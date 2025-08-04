import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, format, addDays } from "date-fns"
import type { Camera } from "./types"

export async function fetchDashboardStats() {
  const supabase = await createClient()
  const today = new Date()
  const monthStart = format(startOfMonth(today), "yyyy-MM-dd")
  const monthEnd = format(endOfMonth(today), "yyyy-MM-dd")

  const [
    { count: totalCameras, error: camerasError },
    { count: activeReservations, error: reservationsError },
    { data: revenueData, error: revenueError },
    { count: lowStockItems, error: stockError },
  ] = await Promise.all([
    supabase.from("cameras").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("reservations")
      .select("total_price")
      .eq("status", "completed")
      .gte("rental_end_date", monthStart)
      .lte("rental_end_date", monthEnd),
    supabase.from("inventory").select("*", { count: "exact", head: true }).lte("stock", 5),
  ])

  if (camerasError || reservationsError || revenueError || stockError) {
    console.error("Error fetching dashboard stats:", {
      camerasError,
      reservationsError,
      revenueError,
      stockError,
    })
  }

  const monthlyRevenue = revenueData?.reduce((sum, item) => sum + item.total_price, 0) || 0

  return {
    totalCameras: totalCameras ?? 0,
    activeReservations: activeReservations ?? 0,
    monthlyRevenue,
    lowStockItems: lowStockItems ?? 0,
  }
}

export async function fetchTimelineData() {
  const supabase = await createClient()
  const viewStartDate = startOfMonth(new Date())
  const viewEndDate = endOfMonth(addDays(new Date(), 60))

  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("*, items:reservation_items(*)")
    .in("status", ["confirmed", "ready_for_dispatch", "active", "returned"])
    .not("rental_start_date", "is", null)
    .not("rental_end_date", "is", null)
    .gte("rental_start_date", format(viewStartDate, "yyyy-MM-dd"))
    .lte("rental_start_date", format(viewEndDate, "yyyy-MM-dd"))

  const { data: cameras, error: camerasError } = await supabase.from("cameras").select("id, name").order("name")

  if (reservationsError || camerasError) {
    console.error("Error fetching timeline data:", { reservationsError, camerasError })
    return { reservations: [], cameras: [] }
  }

  return {
    reservations: (reservations as any[]) || [],
    cameras: (cameras as Camera[]) || [],
  }
}

export async function fetchReservationById(id: string) {
  const supabase = await createClient()

  try {
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single()

    if (reservationError) {
      console.error("Error fetching reservation:", reservationError)
      return null
    }

    const { data: items, error: itemsError } = await supabase
      .from("reservation_items")
      .select(`
        *,
        camera:cameras(*),
        film:films(*),
        accessory:accessories(*)
      `)
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
      console.error("Error fetching payment transactions:", transactionsError)
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

export async function getCameras() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("cameras")
      .select(`
        *,
        compatible_films:camera_films(
          film:films(*)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching cameras:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getCameras:", error)
    return []
  }
}

export async function getCamera(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("cameras")
      .select(`
        *,
        compatible_films:camera_films(
          film:films(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching camera:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Error in getCamera:", error)
    return null
  }
}

export async function getReservations() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        reservation_items(
          *,
          camera:cameras(*),
          film:films(*),
          accessory:accessories(*)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reservations:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getReservations:", error)
    return []
  }
}

export async function getReservation(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        reservation_items(
          *,
          camera:cameras(*),
          film:films(*),
          accessory:accessories(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching reservation:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Error in getReservation:", error)
    return null
  }
}

export async function getInventoryItems() {
  try {
    const supabase = await createClient()

    const [filmsResult, accessoriesResult] = await Promise.all([
      supabase.from("films").select("*").order("name"),
      supabase.from("accessories").select("*").order("name"),
    ])

    return {
      films: filmsResult.data || [],
      accessories: accessoriesResult.data || [],
    }
  } catch (error) {
    console.error("Error in getInventoryItems:", error)
    return { films: [], accessories: [] }
  }
}

export async function getDashboardStats() {
  try {
    const supabase = await createClient()

    const [camerasResult, reservationsResult, filmsResult] = await Promise.all([
      supabase.from("cameras").select("id, status"),
      supabase.from("reservations").select("id, status, total_price"),
      supabase.from("films").select("id, stock_quantity"),
    ])

    const cameras = camerasResult.data || []
    const reservations = reservationsResult.data || []
    const films = filmsResult.data || []

    return {
      totalCameras: cameras.length,
      availableCameras: cameras.filter((c) => c.status === "available").length,
      activeReservations: reservations.filter((r) => r.status === "active").length,
      monthlyRevenue: reservations
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + (r.total_price || 0), 0),
      lowStockItems: films.filter((f) => f.stock_quantity < 5).length,
    }
  } catch (error) {
    console.error("Error in getDashboardStats:", error)
    return {
      totalCameras: 0,
      availableCameras: 0,
      activeReservations: 0,
      monthlyRevenue: 0,
      lowStockItems: 0,
    }
  }
}
