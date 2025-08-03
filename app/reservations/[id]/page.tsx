import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReservationForm } from "@/components/reservation-form"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { EmailLogsCard } from "@/components/email-logs-card"

interface Reservation {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: {
    street: string
    city: string
    zip: string
  } | null
  rental_start_date: string
  rental_end_date: string
  total_amount: number
  status: string
  delivery_method: string
  payment_method: string
  notes: string | null
  created_at: string
  updated_at: string
  items: Array<{
    id: string
    type: "camera" | "film" | "accessory"
    item_id: string
    quantity: number
    daily_rate: number
    total_price: number
    item_name: string
    item_brand?: string
    item_model?: string
  }>
}

async function getReservation(id: string): Promise<Reservation | null> {
  try {
    const supabase = await createClient()

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select(`
        *,
        items:reservation_items(
          id,
          type,
          item_id,
          quantity,
          daily_rate,
          total_price,
          item_name,
          item_brand,
          item_model
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching reservation:", error)
      return null
    }

    return reservation
  } catch (error) {
    console.error("Error in getReservation:", error)
    return null
  }
}

export default async function ReservationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const isNew = id === "new"

  let reservation: Reservation | null = null

  if (!isNew) {
    reservation = await getReservation(id)
    if (!reservation) {
      notFound()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Nová rezervace" : `Rezervace #${reservation?.id.slice(-8)}`}
          </h1>
          <p className="text-muted-foreground">{isNew ? "Vytvořte novou rezervace" : "Detail a správa rezervace"}</p>
        </div>
        {!isNew && reservation && <ReservationStatusBadge status={reservation.status} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
        {/* Hlavní obsah - levý sloupec */}
        <div className="space-y-6">
          <ReservationForm reservation={reservation} />
        </div>

        {/* Boční panel - pravý sloupec */}
        {!isNew && reservation && (
          <div className="space-y-6">
            <FinancialSummaryCard reservation={reservation} />
            <PaymentTransactionsCard reservationId={reservation.id} />
            <EmailLogsCard reservationId={reservation.id} />
          </div>
        )}
      </div>
    </div>
  )
}
