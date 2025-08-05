import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const excludeReservationId = searchParams.get("excludeReservationId")

  try {
    const supabase = await createClient()

    let bookedCameraIds: string[] = []

    if (startDate && endDate) {
      // Find reservations that overlap with the given date range
      // An overlap occurs if (StartA <= EndB) and (EndA >= StartB)
      let query = supabase
        .from("reservations")
        .select("id")
        .lte("rental_start_date", endDate)
        .gte("rental_end_date", startDate)
        .neq("status", "cancelled") // Ignore cancelled reservations

      if (excludeReservationId) {
        query = query.neq("id", excludeReservationId)
      }

      const { data: overlappingReservations, error: reservationError } = await query

      if (reservationError) throw reservationError

      if (overlappingReservations && overlappingReservations.length > 0) {
        const reservationIds = overlappingReservations.map((r) => r.id)

        // Find camera items in those reservations
        const { data: bookedItems, error: itemsError } = await supabase
          .from("reservation_items")
          .select("item_id")
          .in("reservation_id", reservationIds)
          .eq("item_type", "camera")
          .not("item_id", "is", null)

        if (itemsError) throw itemsError

        if (bookedItems) {
          bookedCameraIds = bookedItems.map((item) => item.item_id!)
        }
      }
    }

    // Fetch available cameras
    let cameraQuery = supabase.from("cameras").select("*, pricing_tiers(*)").eq("status", "active").order("name")

    if (bookedCameraIds.length > 0) {
      cameraQuery = cameraQuery.not("id", "in", `(${bookedCameraIds.join(",")})`)
    }

    const { data: cameras, error: camerasError } = await cameraQuery
    if (camerasError) throw camerasError

    // Fetch films and accessories (for now, availability is just based on stock)
    const { data: films, error: filmsError } = await supabase.from("films").select(`*`).gt("stock", 0).order("name")
    if (filmsError) throw filmsError

    const { data: accessories, error: accessoriesError } = await supabase
      .from("accessories")
      .select(`*`)
      .gt("stock", 0)
      .order("name")
    if (accessoriesError) throw accessoriesError

    return NextResponse.json({
      cameras: cameras || [],
      films: films || [],
      accessories: accessories || [],
    })
  } catch (error) {
    console.error("Error fetching available inventory:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
