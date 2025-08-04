import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, AlertCircle } from "lucide-react"
import { fetchReservationById } from "@/lib/data"
import { CustomerInfoCard } from "@/components/customer-info-card"
import { ReservationDetailsCard } from "@/components/reservation-details-card"
import { ReservationItemsManager } from "@/components/reservation-items-manager"
import { ReservationStatusCard } from "@/components/reservation-status-card"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { EmailLogsCard } from "@/components/email-logs-card"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { ReservationForm } from "@/components/reservation-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>
}

interface Reservation {
  id: string
  short_id?: string
  status: string
  created_at: string
  rental_start_date?: string
  rental_end_date?: string
  total_price?: number
  amount_paid?: number
  items?: any[]
  transactions?: any[]
  [key: string]: any
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const resolvedParams = await params
  const reservationId = resolvedParams.id

  // Kontrola, zda se jedná o novou rezervaci
  const isNew = reservationId === "new"

  let reservation: Reservation | null = null
  let error: string | null = null

  // Pouze pokud se nejedná o novou rezervaci, pokusíme se načíst data
  if (!isNew) {
    try {
      console.log(`Fetching reservation with ID: ${reservationId}`)
      reservation = await fetchReservationById(reservationId)
      
      if (!reservation) {
        console.log(`Reservation with ID ${reservationId} not found`)
        notFound()
      }
    } catch (err) {
      console.error("Error fetching reservation:", err)
      error = err instanceof Error ? err.message : "Neočekávaná chyba při načítání rezervace"
    }
  }

  // Pokud došlo k chybě při načítání, zobrazíme error stránku
  if (error) {
    return (
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" asChild>
            <Link href="/reservations">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Zpět na rezervace</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Chyba při načítání rezervace</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Nepodařilo se načíst rezervaci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Možné příčiny:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Rezervace s ID "{reservationId}" neexistuje</li>
                <li>• Problém s připojením k databázi</li>
                <li>• Neplatné nebo poškozené ID rezervace</li>
                <li>• Nedostatečná oprávnění pro přístup k rezervaci</li>
              </ul>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Zkusit znovu
              </Button>
              <Button asChild>
                <Link href="/reservations">
                  Zpět na seznam rezervací
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
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
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "Nová rezervace" : `Rezervace ${reservation?.short_id || reservationId}`}
            </h1>
            {!isNew && reservation?.created_at && (
              <p className="text-muted-foreground">
                Vytvořeno: {format(new Date(reservation.created_at), "d. M. yyyy")}
              </p>
            )}
          </div>
        </div>
        {!isNew && reservation?.status && (
          <ReservationStatusBadge status={reservation.status} />
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {isNew ? (
            // Nová rezervace - zobrazí formulář
            <ReservationForm />
          ) : reservation ? (
            // Existující rezervace - zobrazí detail
            <>
              {/* Customer and Reservation Details - Side by Side */}
              <div className="grid gap-6 md:grid-cols-2">
                <CustomerInfoCard reservation={reservation} />
                <ReservationDetailsCard reservation={reservation} />
              </div>

              {/* Reservation Items */}
              <ReservationItemsManager
                items={reservation.items || []}
                setItems={() => {}} // TODO: Implementovat správnou správu stavu
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
                            (1000 * 60 * 60 * 24)
                        )
                      )
                    : 1
                }
              />

              {/* Email History */}
              <EmailLogsCard reservationId={reservation.id} logs={[]} />
            </>
          ) : (
            // Fallback pro případ, kdy reservation je null ale není error
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Rezervace nebyla nalezena.</p>
                  <Button asChild className="mt-4">
                    <Link href="/reservations">Zpět na seznam rezervací</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {isNew ? (
            // Nová rezervace - placeholder sidebar
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                  <p>Vyplňte základní údaje rezervace pro zobrazení dalších možností.</p>
                </div>
              </CardContent>
            </Card>
          ) : reservation ? (
            // Existující rezervace - sidebar s informacemi
            <>
              {/* Status Management */}
              <ReservationStatusCard reservation={reservation} />

              {/* Financial Summary */}
              <FinancialSummaryCard 
                reservation={reservation} 
                transactions={reservation.transactions || []} 
              />

              {/* Payment Transactions */}
              <PaymentTransactionsCard
                reservationId={reservation.id}
                transactions={reservation.transactions || []}
                totalPrice={reservation.total_price || 0}
                totalPaid={reservation.amount_paid || 0}
              />
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
