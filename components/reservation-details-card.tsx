import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Reservation } from "@/lib/types"
import { Calendar, Truck, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

const deliveryMethodLabels = {
  pickup: "Osobní odběr",
  delivery: "Doprava na adresu",
}

const paymentMethodLabels = {
  card: "Kartou online",
  bank_transfer: "Bankovním převodem",
  cash: "Hotově při převzetí",
}

export function ReservationDetailsCard({ reservation }: { reservation: Reservation | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detaily rezervace</CardTitle>
        <CardDescription>Termín, doprava a platba.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {reservation ? (
          <>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="font-medium">
                {format(new Date(reservation.rental_start_date), "d. M. yyyy", { locale: cs })} -{" "}
                {format(new Date(reservation.rental_end_date), "d. M. yyyy", { locale: cs })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>{deliveryMethodLabels[reservation.delivery_method] || "Nezvoleno"}</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{paymentMethodLabels[reservation.payment_method] || "Nezvoleno"}</span>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">Vyplňte detaily rezervace.</div>
        )}
      </CardContent>
    </Card>
  )
}
