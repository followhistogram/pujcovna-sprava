import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { fetchReservationById } from "@/lib/data"
import { ReservationForm } from "@/components/reservation-form"
import { ReservationItemsManager } from "@/components/reservation-items-manager"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { EmailLogsCard } from "@/components/email-logs-card"
import { ReservationStatusCard } from "@/components/reservation-status-card"
import { CustomerInfoCard } from "@/components/customer-info-card"
import { ReservationDetailsCard } from "@/components/reservation-details-card"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { format } from "date-fns"

export default async function ReservationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const reservation = await fetchReservationById(params.id)

  if (!reservation) {
    notFound()
  }

  const isNew = params.id === "new"

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
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "Nová rezervace" : `Rezervace ${reservation.short_id}`}
            </h1>
            {!isNew && (
              <p className="text-muted-foreground">
                Vytvořeno: {format(new Date(reservation.created_at), "d. M. yyyy")}
              </p>
            )}
          </div>
        </div>
        {!isNew && <ReservationStatusBadge status={reservation.status} />}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {isNew ? (
            <ReservationForm />
          ) : (
            <>
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
                  reservation
                    ? Math.ceil(
                        (new Date(reservation.rental_end_date).getTime() -
                          new Date(reservation.rental_start_date).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 1
                }
              />

              {/* Payment Transactions */}
              <Suspense fallback={<div>Načítání platebních transakcí...</div>}>
                <PaymentTransactionsCard
                  reservationId={reservation.id}
                  transactions={reservation.transactions || []}
                  totalPrice={reservation.total_price || 0}
                  totalPaid={reservation.amount_paid || 0}
                />
              </Suspense>

              {/* Email History */}
              <Suspense fallback={<div>Načítání historie e-mailů...</div>}>
                <EmailLogsCard reservationId={reservation.id} logs={[]} />
              </Suspense>
            </>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {!isNew && (
            <>
              {/* Status Management */}
              <ReservationStatusCard reservation={reservation} />

              {/* Financial Summary */}
              <FinancialSummaryCard reservation={reservation} transactions={reservation.transactions || []} />
            </>
          )}

          {isNew && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <p>Vyplňte základní údaje rezervace pro zobrazení dalších možností.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
