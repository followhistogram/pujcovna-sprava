import { createClient } from "@/lib/supabase/server"
import type { Reservation, Camera, Film, Accessory, ReservationItem } from "@/lib/types"

export async function fetchReservations(): Promise<Reservation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      *,
      items:reservation_items(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reservations:", error)
    return []
  }

  return data || []
}

export async function fetchReservationById(
  id: string,
): Promise<(Reservation & { items: ReservationItem[]; transactions: any[] }) | null> {
  const supabase = await createClient()

  try {
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single()

    if (reservationError || !reservation) {
      console.error("Error fetching reservation:", reservationError)
      return null
    }

    const { data: items, error: itemsError } = await supabase
      .from("reservation_items")
      .select("*")
      .eq("reservation_id", id)

    if (itemsError) {
      console.error("Error fetching reservation items:", itemsError)
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reservation_id", id)
      .order("created_at", { ascending: false })

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError)
    }

    return {
      ...reservation,
      items: items || [],
      transactions: transactions || [],
    }
  } catch (error) {
    console.error("Error in fetchReservationById:", error)
    return null
  }
}

export async function fetchCameras(): Promise<Camera[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("cameras").select("*").eq("status", "active").order("name")

  if (error) {
    console.error("Error fetching cameras:", error)
    return []
  }

  return data || []
}

export async function fetchFilms(): Promise<Film[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("films").select("*").gt("stock", 0).order("name")

  if (error) {
    console.error("Error fetching films:", error)
    return []
  }

  return data || []
}

export async function fetchAccessories(): Promise<Accessory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("accessories").select("*").gt("stock", 0).order("name")

  if (error) {
    console.error("Error fetching accessories:", error)
    return []
  }

  return data || []
}

export async function fetchDashboardStats() {
  const supabase = await createClient()

  try {
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("status, total_price, created_at")

    if (reservationsError) throw reservationsError

    const { data: cameras, error: camerasError } = await supabase.from("cameras").select("id, status")

    if (camerasError) throw camerasError

    const totalReservations = reservations?.length || 0
    const activeReservations = reservations?.filter((r) => r.status === "active").length || 0
    const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0
    const availableCameras = cameras?.filter((c) => c.status === "active").length || 0

    return {
      totalReservations,
      activeReservations,
      totalRevenue,
      availableCameras,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalReservations: 0,
      activeReservations: 0,
      totalRevenue: 0,
      availableCameras: 0,
    }
  }
}

export async function fetchTimelineData() {
  const supabase = await createClient()

  try {
    const { data: reservations, error } = await supabase
      .from("reservations")
      .select(`
        id,
        short_id,
        customer_name,
        rental_start_date,
        rental_end_date,
        status,
        items:reservation_items(
          item_id,
          item_type,
          name,
          quantity
        )
      `)
      .in("status", ["confirmed", "ready_for_dispatch", "active"])
      .order("rental_start_date")

    if (error) throw error

    return reservations || []
  } catch (error) {
    console.error("Error fetching timeline data:", error)
    return []
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "0 Kč"
  }
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
