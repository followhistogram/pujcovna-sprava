import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReservationForm } from "@/components/reservation-form"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { EmailLogsCard } from "@/components/email-logs-card"

// Označit stránku jako dynamickou
export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ReservationDetailPage({ params }: PageProps) {
  const { id } = params
  const isNew = id === "new"

  let reservation = null

  if (!isNew) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        reservation_items (
          id,
          item_type,
          item_id,
          quantity,
          daily_rate,
          total_amount,
          cameras (id, name, brand, model),
          films (id, name, brand),
          accessories (id, name)
        )
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      notFound()
    }

    reservation = data
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Nová rezervace" : `Rezervace #${reservation?.id?.slice(-8)}`}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? "Vytvořte novou rezervace pro zákazníka" : "Detail a správa rezervace"}
          </p>
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
