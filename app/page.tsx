import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CameraTimelineCalendar } from "@/components/dashboard/camera-timeline-calendar"
import { UpcomingDispatches } from "@/components/dashboard/upcoming-dispatches"
import { ExpectedReturns } from "@/components/dashboard/expected-returns"
import { addDays, format, startOfMonth, endOfMonth } from "date-fns"
import type { Camera } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  try {
    // --- Data Fetching ---

    // 1. Stats Cards Data
    const { data: depositData } = await supabase
      .from("reservations")
      .select("deposit_total")
      .in("status", ["confirmed", "ready_for_dispatch", "active", "returned"])

    const totalDeposits = depositData?.reduce((sum, r) => sum + (r.deposit_total || 0), 0) || 0

    const { data: filmForecastData } = await supabase.rpc("get_film_forecast").then(
      (result) => result,
      () => ({ data: [] }),
    )

    const filmForecast = filmForecastData || []

    // New data fetch for active reservations count
    const { count: activeReservationsCount } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // 2. Upcoming Dispatches & Expected Returns
    const today = format(new Date(), "yyyy-MM-dd")
    const sevenDaysFromNow = format(addDays(new Date(), 7), "yyyy-MM-dd")

    const { data: upcomingDispatchesData } = await supabase
      .from("reservations")
      .select("id, short_id, customer_name, rental_start_date, items:reservation_items(name)")
      .in("status", ["confirmed", "ready_for_dispatch"])
      .gte("rental_start_date", today)
      .lte("rental_start_date", sevenDaysFromNow)
      .order("rental_start_date", { ascending: true })

    const { data: expectedReturnsData } = await supabase
      .from("reservations")
      .select("id, short_id, customer_name, rental_end_date, items:reservation_items(name)")
      .eq("status", "active")
      .lt("rental_end_date", today)
      .order("rental_end_date", { ascending: true })

    // 3. Calendar Data
    const viewStartDate = startOfMonth(new Date())
    const viewEndDate = endOfMonth(addDays(new Date(), 60)) // Show current month + next 2 months

    const { data: calendarReservationsData } = await supabase
      .from("reservations")
      .select("*, items:reservation_items(*)")
      .in("status", ["confirmed", "ready_for_dispatch", "active", "returned"])
      .not("rental_start_date", "is", null)
      .not("rental_end_date", "is", null)
      .gte("rental_start_date", format(viewStartDate, "yyyy-MM-dd"))
      .lte("rental_start_date", format(viewEndDate, "yyyy-MM-dd"))

    const { data: camerasData } = await supabase.from("cameras").select("id, name").order("name")

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Přehled vašeho půjčovacího systému</p>
        </div>
        <StatsCards
          totalDeposits={totalDeposits}
          filmForecast={filmForecast}
          activeReservationsCount={activeReservationsCount || 0}
        />
        <CameraTimelineCalendar
          reservations={(calendarReservationsData as any[]) || []}
          cameras={(camerasData as Camera[]) || []}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <UpcomingDispatches reservations={upcomingDispatchesData || []} />
          <ExpectedReturns reservations={expectedReturnsData || []} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Přehled vašeho půjčovacího systému</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chyba při načítání dat. Zkuste obnovit stránku.</p>
        </div>
      </div>
    )
  }
}
