"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const filmSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Název musí mít alespoň 3 znaky."),
  description: z.string().optional(),
  shots_per_pack: z.coerce.number().int().min(0).optional(),
  price: z.coerce.number().int().min(0).optional(),
  purchase_price: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string().url()).optional(),
})

const accessorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Název musí mít alespoň 3 znaky."),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0).optional(),
  purchase_price: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string().url()).optional(),
})

async function logInventoryChange(
  supabase: any,
  itemType: "film" | "accessory",
  itemId: string,
  itemName: string,
  changeType: "created" | "updated" | "deleted" | "stock_change" | "price_change",
  fieldChanged?: string,
  oldValue?: any,
  newValue?: any,
  changeAmount?: number,
  notes?: string,
) {
  try {
    await supabase.from("inventory_logs").insert({
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      change_type: changeType,
      field_changed: fieldChanged,
      old_value: oldValue?.toString(),
      new_value: newValue?.toString(),
      change_amount: changeAmount,
      notes: notes,
    })
  } catch (error) {
    console.error("Failed to log inventory change:", error)
  }
}

export async function saveInventoryItem(type: "film" | "accessory", prevState: any, formData: FormData) {
  const supabase = createClient()
  const schema = type === "film" ? filmSchema : accessorySchema
  const tableName = type === "film" ? "films" : "accessories"

  let images = []
  try {
    const imagesJson = formData.get("images") as string
    if (imagesJson) images = JSON.parse(imagesJson)
  } catch (error) {
    return { success: false, message: "Chyba při zpracování obrázků." }
  }

  const validatedFields = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    shots_per_pack: formData.get("shots_per_pack"),
    price: formData.get("price"),
    purchase_price: formData.get("purchase_price"),
    stock: formData.get("stock"),
    images: images,
  })

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors)
    return {
      success: false,
      message: "Formulář obsahuje chyby.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, ...itemData } = validatedFields.data
  const dataToSave = {
    ...itemData,
    images: JSON.stringify(itemData.images || []),
  }

  try {
    let itemId = id
    let oldItem = null

    // Get old data for comparison if updating
    if (id) {
      const { data } = await supabase.from(tableName).select("*").eq("id", id).single()
      oldItem = data
    }

    // Save or update item
    if (id) {
      const { error } = await supabase.from(tableName).update(dataToSave).eq("id", id)
      if (error) throw error

      // Log changes
      if (oldItem) {
        const changes = []

        // Check stock change
        if (oldItem.stock !== itemData.stock) {
          const changeAmount = itemData.stock - oldItem.stock
          await logInventoryChange(
            supabase,
            type,
            id,
            itemData.name,
            "stock_change",
            "stock",
            oldItem.stock,
            itemData.stock,
            changeAmount,
            changeAmount > 0 ? "Navýšení skladu" : "Snížení skladu",
          )
        }

        // Check price changes
        if (oldItem.price !== itemData.price) {
          await logInventoryChange(
            supabase,
            type,
            id,
            itemData.name,
            "price_change",
            "price",
            oldItem.price,
            itemData.price,
            undefined,
            "Změna prodejní ceny",
          )
        }

        if (oldItem.purchase_price !== itemData.purchase_price) {
          await logInventoryChange(
            supabase,
            type,
            id,
            itemData.name,
            "price_change",
            "purchase_price",
            oldItem.purchase_price,
            itemData.purchase_price,
            undefined,
            "Změna nákupní ceny",
          )
        }

        // Check other field changes
        if (oldItem.name !== itemData.name) {
          await logInventoryChange(
            supabase,
            type,
            id,
            itemData.name,
            "updated",
            "name",
            oldItem.name,
            itemData.name,
            undefined,
            "Změna názvu",
          )
        }

        // If no specific changes logged, log general update
        if (
          oldItem.stock === itemData.stock &&
          oldItem.price === itemData.price &&
          oldItem.purchase_price === itemData.purchase_price &&
          oldItem.name === itemData.name
        ) {
          await logInventoryChange(
            supabase,
            type,
            id,
            itemData.name,
            "updated",
            undefined,
            undefined,
            undefined,
            undefined,
            "Aktualizace položky",
          )
        }
      }
    } else {
      const { data, error } = await supabase.from(tableName).insert(dataToSave).select().single()
      if (error) throw error
      itemId = data.id

      // Log creation
      await logInventoryChange(
        supabase,
        type,
        itemId,
        itemData.name,
        "created",
        undefined,
        undefined,
        undefined,
        undefined,
        "Nová položka vytvořena",
      )
    }

    revalidatePath("/inventory")
    revalidatePath(`/inventory/edit/${type}/${itemId}`)

    return {
      success: true,
      message: "Položka byla úspěšně uložena.",
      itemId: itemId,
      isNew: !id,
    }
  } catch (error: any) {
    console.error("Supabase error:", error)
    return {
      success: false,
      message: `Nepodařilo se uložit data: ${error.message}`,
    }
  }
}

export async function deleteInventoryItem(tableName: "films" | "accessories", itemId: string) {
  const supabase = createClient()

  try {
    // Get item data before deletion for logging
    const { data: item } = await supabase.from(tableName).select("*").eq("id", itemId).single()

    // Check if film is used by any camera (only for films)
    if (tableName === "films") {
      const { data: usedByCamera } = await supabase
        .from("camera_compatible_films")
        .select("camera_id")
        .eq("film_id", itemId)
        .limit(1)

      if (usedByCamera && usedByCamera.length > 0) {
        return {
          success: false,
          message: "Tento film nelze smazat, protože je přiřazen k fotoaparátu. Nejprve ho odeberte z fotoaparátu.",
        }
      }
    }

    // Delete the item
    const { error } = await supabase.from(tableName).delete().eq("id", itemId)

    if (error) {
      console.error("Delete error:", error)
      throw error
    }

    // Log deletion
    if (item) {
      const itemType = tableName === "films" ? "film" : "accessory"
      await logInventoryChange(
        supabase,
        itemType,
        itemId,
        item.name,
        "deleted",
        undefined,
        undefined,
        undefined,
        undefined,
        `Položka smazána (měla ${item.stock} ks na skladě)`,
      )
    }

    revalidatePath("/inventory")
    const itemType = tableName === "films" ? "Film" : "Příslušenství"
    return { success: true, message: `${itemType} byl úspěšně smazán.` }
  } catch (error: any) {
    console.error("Delete error:", error)
    const itemType = tableName === "films" ? "film" : "příslušenství"
    return { success: false, message: `Nepodařilo se smazat ${itemType}: ${error.message}` }
  }
}

export async function adjustStock(itemType: "film" | "accessory", itemId: string, adjustment: number, reason: string) {
  const supabase = createClient()
  const tableName = itemType === "film" ? "films" : "accessories"

  try {
    // Get current item data
    const { data: item, error: fetchError } = await supabase.from(tableName).select("*").eq("id", itemId).single()

    if (fetchError || !item) {
      throw new Error("Položka nenalezena")
    }

    const newStock = Math.max(0, item.stock + adjustment)

    // Update stock
    const { error: updateError } = await supabase.from(tableName).update({ stock: newStock }).eq("id", itemId)

    if (updateError) throw updateError

    // Log the change
    await logInventoryChange(
      supabase,
      itemType,
      itemId,
      item.name,
      "stock_change",
      "stock",
      item.stock,
      newStock,
      adjustment,
      reason,
    )

    revalidatePath("/inventory")
    return { success: true, message: "Stav skladu byl upraven." }
  } catch (error: any) {
    console.error("Stock adjustment error:", error)
    return { success: false, message: `Nepodařilo se upravit sklad: ${error.message}` }
  }
}

export async function getInventoryLogs(itemType?: "film" | "accessory", itemId?: string, limit = 50) {
  const supabase = createClient()

  try {
    let query = supabase.from("inventory_logs").select("*").order("created_at", { ascending: false }).limit(limit)

    if (itemType) {
      query = query.eq("item_type", itemType)
    }

    if (itemId) {
      query = query.eq("item_id", itemId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Error fetching inventory logs:", error)
    return { success: false, message: error.message, data: [] }
  }
}
