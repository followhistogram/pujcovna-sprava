import { Suspense } from "react"
import { notFound } from "next/navigation"
import { fetchReservationById } from "@/lib/data"
import { ReservationStatusUpdater } from "@/components/reservation-status-updater"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReservationDetailsCard } from "@/components/reservation-details-card"
import { CustomerInfoCard } from "@/components/customer-info-card"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { ReservationItemsCard } from "@/components/reservation-items-card"
import { PageSkeleton } from "@/components/skeletons"

export default async function ReservationDetailPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10)
  if (isNaN(id)) {
    notFound()
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReservationData id={id} />
    </Suspense>
  )
}

async function ReservationData({ id }: { id: number }) {
  const reservation = await fetchReservationById(id)

  if (!reservation) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Rezervace #{reservation.short_id}</h1>
          <p className="text-muted-foreground">Detail rezervace a správa stavu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stav rezervace</CardTitle>
            </CardHeader>
            <CardContent>
              <ReservationStatusUpdater reservation={reservation} />
            </CardContent>
          </Card>
          <ReservationItemsCard reservationId={reservation.id} />
          <PaymentTransactionsCard reservationId={reservation.id} />
        </div>
        <div className="space-y-6">
          <ReservationDetailsCard reservation={reservation} />
          <CustomerInfoCard customer={reservation.customer} />
          <FinancialSummaryCard reservationId={reservation.id} />
        </div>
      </div>
    </div>
  )
}
