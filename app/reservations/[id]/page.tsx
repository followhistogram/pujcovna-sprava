import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { fetchReservationById, fetchAvailableItems } from "@/lib/data"
import { CustomerInfoCard } from "@/components/customer-info-card"
import { ReservationDetailsCard } from "@/components/reservation-details-card"
import { EditableReservationItems } from "@/components/editable-reservation-items"
import { ReservationStatusCard } from "@/components/reservation-status-card"
import { FinancialSummaryCard } from "@/components/financial-summary-card"
import { PaymentTransactionsCard } from "@/components/payment-transactions-card"
import { EmailLogsCard } from "@/components/email-logs-card"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { ReservationForm } from "@/components/reservation-form"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>
}

interface ReservationItem {
  id: string
  type: "camera" | "film" | "accessory"
  name: string
  quantity: number
  price_per_day: number
  total_price?: number
  description?: string
  inventory_item_id?: string
}

interface AvailableItem {
  id: string
  name: string
  type: "camera" | "film" | "accessory"
  price_per_day: number
  description?: string
  available_quantity: number
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
  items?: ReservationItem[]
  transactions?: any[]
  [key: string]: any
}

// Funkce pro validaci UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const resolvedParams = await params
  const reservationId = resolvedParams.id

  // Kontrola, zda se jedná o novou rezervaci
  const isNew = reservationId === "new"

  let reservation: Reservation | null = null
  let availableItems: AvailableItem[] = []
  let error: string | null = null

  try {
    // Načtení dostupných položek pro editaci (vždy potřebujeme)
    const availableItemsData = await fetchAvailableItems()
    availableItems = availableItemsData || []

    // Pouze pokud se nejedná o novou rezervaci, načteme rezervaci
    if (!isNew) {
      console.log(`Fetching reservation with ID: ${reservationId}`)

      // Validace formátu UUID před voláním API
      if (!isValidUUID(reservationId)) {
        console.log(`Invalid UUID format: ${reservationId}`)
        notFound()
      }

      reservation = await fetchReservationById(reservationId)

      if (!reservation) {
        console.log(`Reservation with ID ${reservationId} not found`)
        notFound()
      }

      // Ujistěme se, že items mají správnou strukturu s cenami
      if (reservation.items) {
        reservation.items = reservation.items.map((item) => ({
          ...item,
          price_per_day: Number(item.price_per_day) || 0,
          quantity: Number(item.quantity) || 1,
          total_price: Number(item.total_price) || 0,
        }))
      }
    }
  } catch (err: any) {
    console.error("Error fetching data:", err)

    if (err?.code === "22P02") {
      console.log(`Invalid UUID format: ${reservationId}`)
      notFound()
    }

    if (err?.message?.includes("404")) {
      notFound()
    }

    error = err instanceof Error ? err.message : "Neočekávaná chyba při načítání dat"
  }

  // Pokud došlo k chybě při načítání, zobrazíme error stránku
  if (error && !isNew) {
    return (
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/reservations">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chyba při načítání</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/reservations">Zpět na rezervace</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const rentalDays =
    reservation?.rental_start_date && reservation?.rental_end_date
      ? Math.max(
          1,
          Math.ceil(
            (new Date(reservation.rental_end_date).getTime() - new Date(reservation.rental_start_date).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 1

  return (
    <main className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" asChild>
            <Link href="/reservations">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Zpět na rezervace</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? "Nová rezervace" : `Rezervace ${reservation?.short_id || reservationId.slice(0, 8)}`}
            </h1>
            {!isNew && reservation?.created_at && (
              <p className="text-muted-foreground mt-1">
                Vytvořeno: {format(new Date(reservation.created_at), "d. M. yyyy")}
              </p>
            )}
          </div>
        </div>
        {!isNew && reservation?.status && <ReservationStatusBadge status={reservation.status} />}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {isNew ? (
            // Nová rezervace - zobrazí formulář
            <ReservationForm />
          ) : reservation ? (
            // Existující rezervace - zobrazí editovatelný detail
            <>
              {/* Customer Info */}
              <CustomerInfoCard reservation={reservation} />

              {/* EDITOVATELNÉ položky rezervace */}
              <EditableReservationItems
                reservationId={reservation.id}
                items={reservation.items || []}
                availableItems={availableItems}
                rentalDays={rentalDays}
              />

              {/* Email History */}
              <EmailLogsCard reservationId={reservation.id} logs={[]} />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground">Rezervace nebyla nalezena.</p>
                <Button asChild className="mt-4">
                  <Link href="/reservations">Zpět na seznam rezervací</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {isNew ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                  <p>Vyplňte základní údaje rezervace pro zobrazení dalších možností.</p>
                </div>
              </CardContent>
            </Card>
          ) : reservation ? (
            <>
              {/* Reservation Details */}
              <ReservationDetailsCard reservation={reservation} />

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
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
