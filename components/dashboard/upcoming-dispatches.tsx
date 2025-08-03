import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

interface UpcomingDispatchesProps {
  reservations: Array<{
    id: string
    short_id: string
    customer_name: string
    rental_start_date: string
    items: Array<{ name: string }>
  }>
}

export function UpcomingDispatches({ reservations }: UpcomingDispatchesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Nadcházející expedice
        </CardTitle>
        <CardDescription>Rezervace k odeslání v příštích 7 dnech</CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žádné nadcházející expedice</p>
        ) : (
          <div className="space-y-4">
            {reservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Link href={`/reservations/${reservation.id}`} className="font-medium hover:underline">
                    {reservation.customer_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{reservation.items.length} položek</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {format(new Date(reservation.rental_start_date), "d. M.", { locale: cs })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
