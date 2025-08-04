import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import Link from "next/link"

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
        <CardTitle>Nadcházející odeslání</CardTitle>
        <CardDescription>Rezervace připravené k odeslání v následujících 7 dnech</CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žádné nadcházející odeslání</p>
        ) : (
          <div className="space-y-4">
            {reservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/reservations/${reservation.id}`} className="font-medium hover:underline">
                    {reservation.customer_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {reservation.items.map((item) => item.name).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {format(new Date(reservation.rental_start_date), "d. M.", { locale: cs })}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    #{reservation.short_id}
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
