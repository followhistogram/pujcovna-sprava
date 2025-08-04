import { createClient } from "@/lib/supabase/server"
import type { Reservation, ReservationItem } from "@/lib/types"

export async function fetchReservationById(id: string): Promise<(Reservation & { items: ReservationItem[] }) | null> {
  try {
    const supabase = await createClient()

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
      return { ...reservation, items: [] }
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

export async function fetchDashboardStats() {
  try {
    const supabase = await createClient()

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("status, total_price, amount_paid")

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError)
      return {
        totalReservations: 0,
        activeReservations: 0,
        totalRevenue: 0,
        pendingPayments: 0,
      }
    }

    const totalReservations = reservations.length
    const activeReservations = reservations.filter((r) =>
      ["confirmed", "ready_for_dispatch", "active"].includes(r.status),
    ).length
    const totalRevenue = reservations.reduce((sum, r) => sum + (r.amount_paid || 0), 0)
    const pendingPayments = reservations.reduce(
      (sum, r) => sum + Math.max(0, (r.total_price || 0) - (r.amount_paid || 0)),
      0,
    )

    return {
      totalReservations,
      activeReservations,
      totalRevenue,
      pendingPayments,
    }
  } catch (error) {
    console.error("Error in fetchDashboardStats:", error)
    return {
      totalReservations: 0,
      activeReservations: 0,
      totalRevenue: 0,
      pendingPayments: 0,
    }
  }
}

export async function fetchTimelineData() {
  try {
    const supabase = await createClient()

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select(`
        *,
        items:reservation_items(*)
      `)
      .in("status", ["confirmed", "ready_for_dispatch", "active", "returned"])
      .order("rental_start_date", { ascending: true })

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError)
      return { reservations: [], cameras: [] }
    }

    const { data: cameras, error: camerasError } = await supabase.from("cameras").select("*").eq("status", "active")

    if (camerasError) {
      console.error("Error fetching cameras:", camerasError)
      return { reservations: reservations || [], cameras: [] }
    }

    return {
      reservations: reservations || [],
      cameras: cameras || [],
    }
  } catch (error) {
    console.error("Error in fetchTimelineData:", error)
    return { reservations: [], cameras: [] }
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
