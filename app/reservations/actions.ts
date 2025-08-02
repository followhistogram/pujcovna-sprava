"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { ReservationItem, ReservationStatus } from "@/lib/types"
import { fakturoidApiRequest } from "@/lib/fakturoid"
import { zaslatApiRequest } from "@/lib/zaslat"

const reservationItemSchema = z.object({
  item_id: z.string().uuid(),
  item_type: z.enum(["camera", "film", "accessory"]),
  name: z.string(),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  deposit: z.number().min(0),
})

const reservationSchema = z.object({
  id: z.string().uuid().optional(),
  customer_name: z.string().min(1, "Jméno je povinné."),
  customer_email: z.string().email("Neplatný formát e-mailu.").optional().or(z.literal("")),
  customer_phone: z.string().optional(),
  customer_street: z.string().optional(),
  customer_zip: z.string().optional(),
  customer_city: z.string().optional(),
  rental_start_date: z.string().min(1, "Datum od je povinné."),
  rental_end_date: z.string().min(1, "Datum do je povinné."),
  delivery_method: z.enum(["pickup", "delivery"]).optional(),
  payment_method: z.enum(["card", "bank_transfer", "cash"]).optional(),
  items: z.array(reservationItemSchema).min(1, "Rezervace musí obsahovat alespoň jednu položku."),
  customer_notes: z.string().optional(),
  internal_notes: z.string().optional(),
  shipping_outbound_url: z.string().url("Neplatný formát URL.").optional().or(z.literal("")),
  shipping_return_url: z.string().url("Neplatný formát URL.").optional().or(z.literal("")),
})

export async function saveReservation(prevState: any, formData: FormData) {
  const supabase = createClient()

  let items: Partial<ReservationItem>[] = []
  try {
    items = JSON.parse(formData.get("items") as string)
  } catch (e) {
    return { success: false, message: "Chyba při zpracování položek." }
  }

  const validatedFields = reservationSchema.safeParse({
    id: formData.get("id") || undefined,
    customer_name: formData.get("customer_name"),
    customer_email: formData.get("customer_email"),
    customer_phone: formData.get("customer_phone"),
    customer_street: formData.get("customer_street"),
    customer_zip: formData.get("customer_zip"),
    customer_city: formData.get("customer_city"),
    rental_start_date: formData.get("rental_start_date"),
    rental_end_date: formData.get("rental_end_date"),
    delivery_method: formData.get("delivery_method"),
    payment_method: formData.get("payment_method"),
    items: items,
    customer_notes: formData.get("customer_notes"),
    internal_notes: formData.get("internal_notes"),
    shipping_outbound_url: formData.get("shipping_outbound_url"),
    shipping_return_url: formData.get("shipping_return_url"),
  })

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors)
    return { success: false, message: "Formulář obsahuje chyby.", errors: validatedFields.error.flatten().fieldErrors }
  }

  const { id, items: reservationItems, customer_notes, internal_notes, ...data } = validatedFields.data

  // Calculations are now handled by DB triggers, but we can still prepare the data
  const sales_total = reservationItems
    .filter((item) => item.item_type === "film" || item.item_type === "accessory")
    .reduce((acc, item) => acc + item.unit_price * item.quantity, 0)

  const reservationData = {
    ...data,
    customer_address: {
      street: data.customer_street || "",
      zip: data.customer_zip || "",
      city: data.customer_city || "",
    },
    sales_total,
    customer_notes: customer_notes || null,
    internal_notes: internal_notes || null,
    status: id ? undefined : "new",
    amount_paid: id ? undefined : 0,
  }

  delete (reservationData as any).customer_street
  delete (reservationData as any).customer_zip
  delete (reservationData as any).customer_city

  try {
    let reservationId = id
    if (id) {
      const updateData = Object.fromEntries(Object.entries(reservationData).filter(([_, value]) => value !== undefined))
      const { error } = await supabase.from("reservations").update(updateData).eq("id", id)
      if (error) throw error
    } else {
      const { data: newReservation, error } = await supabase
        .from("reservations")
        .insert(reservationData)
        .select()
        .single()
      if (error) throw error
      reservationId = newReservation.id
    }

    if (reservationId) {
      await supabase.from("reservation_items").delete().eq("reservation_id", reservationId)
      const itemsToInsert = reservationItems.map((item) => ({ ...item, reservation_id: reservationId }))
      const { error: insertError } = await supabase.from("reservation_items").insert(itemsToInsert)
      if (insertError) throw insertError
    }

    revalidatePath("/reservations")
    revalidatePath(`/reservations/${reservationId}`)

    return { success: true, message: "Rezervace byla úspěšně uložena.", reservationId }
  } catch (error: any) {
    return { success: false, message: `Nepodařilo se uložit rezervaci: ${error.message}` }
  }
}

export async function updateReservationStatus(reservationId: string, newStatus: ReservationStatus) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("reservations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId)

    if (error) {
      console.error("Status update error:", error)
      throw error
    }

    revalidatePath("/reservations")
    revalidatePath(`/reservations/${reservationId}`)

    const statusLabels = {
      new: "Nová",
      confirmed: "Potvrzená",
      ready_for_dispatch: "K expedici",
      active: "Aktivní",
      returned: "Vrácena",
      completed: "Dokončena",
      canceled: "Stornována",
    }

    return {
      success: true,
      message: `Stav rezervace byl změněn na "${statusLabels[newStatus]}".`,
    }
  } catch (error: any) {
    console.error("Update status error:", error)
    return {
      success: false,
      message: `Nepodařilo se změnit stav rezervace: ${error.message}`,
    }
  }
}

export async function createInvoice(reservationId: string) {
  if (!process.env.FAKTUROID_SLUG || !process.env.FAKTUROID_CLIENT_ID || !process.env.FAKTUROID_CLIENT_SECRET) {
    return { success: false, message: "Chybí konfigurace pro Fakturoid API (OAuth)." }
  }

  const supabase = createClient()

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("*, items:reservation_items(*)")
    .eq("id", reservationId)
    .single()

  if (reservationError || !reservation) {
    return { success: false, message: "Rezervace nenalezena." }
  }

  if (reservation.invoice_id) {
    return { success: false, message: "Faktura pro tuto rezervaci již existuje." }
  }

  const lines = reservation.items.map((item: ReservationItem) => ({
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price.toString(),
    vat_rate: "21",
  }))

  if (reservation.deposit_total > 0) {
    lines.push({
      name: "Vratná kauce",
      quantity: 1,
      unit_price: reservation.deposit_total.toString(),
      vat_rate: "0",
    })
  }

  const payload = {
    client_name: reservation.customer_name,
    client_street: reservation.customer_address?.street,
    client_city: reservation.customer_address?.city,
    client_zip: reservation.customer_address?.zip,
    client_country: "CZ",
    client_email: reservation.customer_email,
    client_phone: reservation.customer_phone,
    order_number: reservation.short_id,
    lines: lines,
  }

  try {
    const invoiceData = await fakturoidApiRequest("/invoices.json", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        invoice_id: invoiceData.id,
        invoice_number: invoiceData.number,
        invoice_url: invoiceData.pdf_url,
      })
      .eq("id", reservationId)

    if (updateError) {
      console.error("DB update error after invoicing:", updateError)
      return { success: false, message: "Faktura vytvořena, ale nepodařilo se ji uložit do databáze." }
    }

    revalidatePath(`/reservations/${reservationId}`)
    return { success: true, message: `Faktura ${invoiceData.number} byla úspěšně vystavena.` }
  } catch (error: any) {
    console.error("Create invoice error:", error)
    if (error.data && error.data.errors) {
      const errorMessage = error.data.errors?.base?.[0] || "Neznámá chyba Fakturoid API."
      return { success: false, message: `Chyba Fakturoid: ${errorMessage}` }
    }
    return { success: false, message: `Došlo k chybě: ${error.message || "Neznámá chyba"}` }
  }
}

export async function orderShipping(reservationId: string) {
  if (!process.env.ZASLAT_API_KEY) {
    return { success: false, message: "Chybí konfigurace pro Zaslat.cz API." }
  }

  const supabase = createClient()

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .single()

  if (reservationError || !reservation) {
    return { success: false, message: "Rezervace nenalezena." }
  }

  if (reservation.shipment_id) {
    return { success: false, message: "Doprava pro tuto rezervaci již byla objednána." }
  }
  if (reservation.delivery_method !== "delivery") {
    return { success: false, message: "Tato rezervace nemá nastavenou dopravu na adresu." }
  }
  if (
    !reservation.customer_address ||
    !reservation.customer_address.street ||
    !reservation.customer_address.city ||
    !reservation.customer_address.zip
  ) {
    return { success: false, message: "Chybí kompletní adresa zákazníka." }
  }

  const payload = {
    sender: {
      name: "Půjčovna Polaroidů",
      street: "Naše Ulice 1",
      city: "Praha",
      zip: "11000",
      country: "CZ",
      contact_person: "Admin Půjčovny",
      email: "admin@pujcovna.cz",
      phone: "+420111222333",
    },
    recipient: {
      name: reservation.customer_name,
      street: reservation.customer_address.street,
      city: reservation.customer_address.city,
      zip: reservation.customer_address.zip,
      country: "CZ",
      contact_person: reservation.customer_name,
      email: reservation.customer_email,
      phone: reservation.customer_phone,
    },
    shipment_info: {
      service_id: 1,
      cod: 0,
      value: reservation.total_price,
      weight: 2,
      eshop: "Půjčovna Polaroidů",
      reference: reservation.short_id,
    },
  }

  try {
    const shipmentData = await zaslatApiRequest("/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (!shipmentData || !shipmentData.id) {
      throw new Error("API nevrátilo platná data o zásilce.")
    }

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        shipment_id: shipmentData.id,
        shipment_tracking_number: shipmentData.tracking_number,
        shipment_label_url: shipmentData.label_pdf,
      })
      .eq("id", reservationId)

    if (updateError) {
      console.error("DB update error after ordering shipping:", updateError)
      return { success: false, message: "Doprava objednána, ale nepodařilo se ji uložit do databáze." }
    }

    revalidatePath(`/reservations/${reservationId}`)
    return {
      success: true,
      message: `Doprava byla úspěšně objednána. Sledovací číslo: ${shipmentData.tracking_number}`,
    }
  } catch (error: any) {
    console.error("Order shipping error:", error)
    const errorMessage = error.data?.errors?.base?.[0] || error.data?.message || error.message || "Neznámá chyba"
    return { success: false, message: `Chyba Zaslat.cz: ${errorMessage}` }
  }
}

export async function addPaymentTransaction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const reservationId = formData.get("reservationId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("paymentMethod") as string
    const transactionType = formData.get("transactionType") as string
    const description = formData.get("description") as string
    const referenceNumber = formData.get("referenceNumber") as string
    const notes = formData.get("notes") as string

    if (!reservationId || !amount || !paymentMethod || !transactionType) {
      return {
        success: false,
        message: "Všechna povinná pole musí být vyplněna",
      }
    }

    const finalAmount = Math.round(amount)
    const finalAmountAdjusted = transactionType === "refund" ? -finalAmount : finalAmount

    const { error: transactionError } = await supabase.from("payment_transactions").insert({
      reservation_id: reservationId,
      amount: finalAmountAdjusted,
      payment_method: paymentMethod,
      transaction_type: transactionType,
      description: description || null,
      reference_number: referenceNumber || null,
      notes: notes || null,
    })

    if (transactionError) {
      console.error("Error inserting payment transaction:", transactionError)
      return {
        success: false,
        message: "Chyba při ukládání transakce",
      }
    }

    revalidatePath(`/reservations/${reservationId}`)
    return {
      success: true,
      message: `${transactionType === "refund" ? "Refundace" : "Platba"} byla úspěšně zaznamenána`,
    }
  } catch (error) {
    console.error("Error in addPaymentTransaction:", error)
    return {
      success: false,
      message: "Došlo k neočekávané chybě",
    }
  }
}

export async function deletePaymentTransaction(transactionId: string, reservationId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("payment_transactions").delete().eq("id", transactionId)

    if (error) {
      console.error("Error deleting payment transaction:", error)
      return {
        success: false,
        message: "Chyba při mazání transakce",
      }
    }

    revalidatePath(`/reservations/${reservationId}`)
    return {
      success: true,
      message: "Transakce byla úspěšně smazána",
    }
  } catch (error) {
    console.error("Error in deletePaymentTransaction:", error)
    return {
      success: false,
      message: "Došlo k neočekávané chybě",
    }
  }
}

export async function getPaymentTransactions(reservationId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payment transactions:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching payment transactions:", error)
    return { success: false, error: "Nepodařilo se načíst platby" }
  }
}

export async function getReservation(reservationId: string) {
  const supabase = createClient()

  try {
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single()

    if (reservationError) {
      console.error("Error fetching reservation:", reservationError)
      return { success: false, error: reservationError.message }
    }

    const { data: items, error: itemsError } = await supabase
      .from("reservation_items")
      .select("*")
      .eq("reservation_id", reservationId)

    if (itemsError) {
      console.error("Error fetching reservation items:", itemsError)
      return { success: false, error: itemsError.message }
    }

    return {
      success: true,
      data: {
        ...reservation,
        items: items || [],
      },
    }
  } catch (error: any) {
    console.error("Error fetching reservation:", error)
    return { success: false, error: "Nepodařilo se načíst rezervaci" }
  }
}
