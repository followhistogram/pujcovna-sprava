// app/api/reservations/[id]/items/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface ReservationItem {
  id: string
  type: "camera" | "film" | "accessory"
  name: string
  quantity: number
  price_per_day: number
  total_price: number
  description?: string
  inventory_item_id?: string
  item_id?: string
  item_type?: string
  unit_price?: number
  deposit?: number
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const reservationId = resolvedParams.id
    const { items }: { items: ReservationItem[] } = await request.json()

    console.log(`Updating items for reservation ${reservationId}:`, items)

    const supabase = await createClient()

    // Začneme transakci - nejdříve smažeme všechny existující položky
    const { error: deleteError } = await supabase.from("reservation_items").delete().eq("reservation_id", reservationId)

    if (deleteError) {
      console.error("Error deleting existing items:", deleteError)
      throw new Error(`Database error: ${deleteError.message}`)
    }

    // Pokud máme nové položky, přidáme je
    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        reservation_id: reservationId,
        item_id: item.item_id,
        item_type: item.item_type,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        deposit: item.deposit || 0,
      }))

      const { error: insertError } = await supabase.from("reservation_items").insert(itemsToInsert)

      if (insertError) {
        console.error("Error inserting new items:", insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }
    }

    // Přepočítáme celkovou cenu rezervace
    const totalPrice = items.reduce((sum, item) => sum + (item.unit_price || 0) * (item.quantity || 0), 0)

    const { error: updateReservationError } = await supabase
      .from("reservations")
      .update({
        total_price: totalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId)

    if (updateReservationError) {
      console.error("Error updating reservation total:", updateReservationError)
      // Neházneme chybu, protože položky jsou už uložené
    }

    console.log(`Successfully updated ${items.length} items for reservation ${reservationId}`)

    return NextResponse.json({
      success: true,
      message: `Updated ${items.length} items`,
      totalPrice,
    })
  } catch (error) {
    console.error("Error in PUT /api/reservations/[id]/items:", error)

    return NextResponse.json(
      {
        error: "Failed to update reservation items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const reservationId = resolvedParams.id

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("reservation_items")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching reservation items:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error("Error in GET /api/reservations/[id]/items:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch reservation items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
