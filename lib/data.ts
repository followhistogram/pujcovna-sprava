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
