import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ReservationForm } from "@/components/reservation-form"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { ReservationStatusCard } from "@/components/reservation-status-card"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { EmailLogsCard } from "@/components/email-logs-card"
import type { Camera, Film, Reservation, ReservationItem, Accessory } from "@/lib/types"
import { format } from "date-fns"

async function getAvailableCameras(
  supabase: ReturnType<typeof createClient>,
  startDate?: string,
  endDate?: string,
  reservationIdToExclude?: string,
): Promise<Camera[]> {
  const { data: allCameras, error: camerasError } = await supabase
    .from("cameras")
    .select("*, pricing_tiers(*), camera_compatible_films(films(id, name, price))")
    .eq("status", "active")

  if (camerasError) {
    console.error("Error fetching cameras:", camerasError)
    return []
  }

  if (!startDate || !endDate) {
    return allCameras as Camera[]
  }

  const { data: setting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "reservation_buffer_days")
    .single()
  const bufferDays = setting ? Number(setting.value) : 0

  const bufferedStartDate = new Date(startDate)
  bufferedStartDate.setDate(bufferedStartDate.getDate() - bufferDays)
  const bufferedEndDate = new Date(endDate)
  bufferedEndDate.setDate(bufferedEndDate.getDate() + bufferDays)

  let conflictingReservationsQuery = supabase
    .from("reservations")
    .select("items:reservation_items!inner(item_id)")
    .in("status", ["confirmed", "ready_for_dispatch", "active", "returned"])
    .lte("rental_start_date", format(bufferedEndDate, "yyyy-MM-dd"))
    .gte("rental_end_date", format(bufferedStartDate, "yyyy-MM-dd"))

  if (reservationIdToExclude) {
    conflictingReservationsQuery = conflictingReservationsQuery.neq("id", reservationIdToExclude)
  }

  const { data: conflictingReservations, error: reservationsError } = await conflictingReservationsQuery

  if (reservationsError) {
    console.error("Error fetching conflicting reservations:", reservationsError)
    return allCameras as Camera[]
  }

  const unavailableCameraIds = new Set(
    conflictingReservations.flatMap((r: any) => r.items.map((item: any) => item.item_id)),
  )

  const availableCameras = allCameras.filter((camera) => !unavailableCameraIds.has(camera.id))

  return availableCameras as Camera[]
}

export default async function ReservationEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const isNew = params.id === "new"

  let reservation: (Reservation & { items: ReservationItem[] }) | null = null

  if (!isNew) {
    const { data: reservationData } = await supabase.from("reservations").select("*").eq("id", params.id).single()
    if (!reservationData) notFound()

    const { data: itemsData } = await supabase.from("reservation_items").select("*").eq("reservation_id", params.id)

    reservation = {
      ...reservationData,
      items: itemsData || [],
    }
  }

  const { data: paymentTransactions } = !isNew
    ? await supabase
        .from("payment_transactions")
        .select("*")
        .eq("reservation_id", params.id)
        .order("created_at", { ascending: false })
    : { data: [] }

  const availableCameras = await getAvailableCameras(
    supabase,
    reservation?.rental_start_date,
    reservation?.rental_end_date,
    reservation?.id,
  )

  const { data: films } = await supabase.from("films").select("id, name, price, shots_per_pack")
  const { data: accessories } = await supabase.from("accessories").select("id, name, price")

  const { data: emailLogs } = await supabase.from("email_logs").select("*").eq("reservation_id", params.id)

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" asChild>
            <Link href="/reservations">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Zpět na rezervace</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "Nová rezervace" : `Rezervace ${reservation?.short_id}`}
            </h1>
            {!isNew && reservation && (
              <p className="text-muted-foreground">
                Vytvořeno: {format(new Date(reservation.created_at), "d. M. yyyy")}
              </p>
            )}
          </div>
        </div>
        {!isNew && reservation && <ReservationStatusBadge status={reservation.status} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
        {/* Hlavní obsah - levý sloupec */}
        <div className="space-y-6">
          <ReservationForm
            reservation={reservation}
            availableCameras={availableCameras}
            allFilms={(films as Film[]) || []}
            allAccessories={(accessories as Accessory[]) || []}
          />
        </div>

        {/* Boční panel - pravý sloupec */}
        <div className="space-y-6">
          {!isNew && reservation && (
            <>
              <ReservationStatusCard reservation={reservation} />
              <FinancialSummaryCard reservation={reservation} transactions={paymentTransactions || []} />
              <PaymentTransactionsCard
                reservationId={reservation.id}
                transactions={paymentTransactions || []}
                totalPrice={reservation.total_price}
                totalPaid={reservation.amount_paid || 0}
              />
              <EmailLogsCard reservationId={reservation.id} logs={emailLogs || []} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
