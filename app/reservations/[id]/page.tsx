import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { fetchReservationById } from "@/lib/data"
import { CustomerInfoCard } from "@/components/customer-info-card"
import { ReservationDetailsCard } from "@/components/reservation-details-card"
import { ReservationItemsManager } from "@/components/reservation-items-manager"
import { ReservationStatusCard } from "@/components/reservation-status-card"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { EmailLogsCard } from "@/components/email-logs-card"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { format } from "date-fns"

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const resolvedParams = await params
  const reservationId = resolvedParams.id

  const reservation = await fetchReservationById(reservationId)

  if (!reservation) {
    notFound()
  }

  return (
    <main className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" asChild>
            <Link href="/reservations">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Zpět na rezervace</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rezervace {reservation.short_id}</h1>
            <p className="text-muted-foreground">Vytvořeno: {format(new Date(reservation.created_at), "d. M. yyyy")}</p>
          </div>
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Customer and Reservation Details - Side by Side */}
          <div className="grid gap-6 md:grid-cols-2">
            <CustomerInfoCard reservation={reservation} />
            <ReservationDetailsCard reservation={reservation} />
          </div>

          {/* Reservation Items */}
          <ReservationItemsManager
            items={reservation.items || []}
            setItems={() => {}} // This would need proper state management
            availableCameras={[]}
            availableFilms={[]}
            availableAccessories={[]}
            rentalDays={
              reservation.rental_start_date && reservation.rental_end_date
                ? Math.max(
                    1,
                    Math.ceil(
                      (new Date(reservation.rental_end_date).getTime() -
                        new Date(reservation.rental_start_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : 1
            }
          />

          {/* Email History */}
          <EmailLogsCard reservationId={reservation.id} logs={[]} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <ReservationStatusCard reservation={reservation} />

          {/* Financial Summary */}
          <FinancialSummaryCard reservation={reservation} transactions={reservation.transactions || []} />

          {/* Payment Transactions */}
          <PaymentTransactionsCard
            reservationId={reservation.id}
            transactions={reservation.transactions || []}
            totalPrice={reservation.total_price || 0}
            totalPaid={reservation.amount_paid || 0}
          />
        </div>
      </div>
    </main>
  )
}
