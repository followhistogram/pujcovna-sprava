import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PackageCheck } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

interface ExpectedReturnsProps {
  reservations: Array<{
    id: string
    short_id: string
    customer_name: string
    rental_end_date: string
    items: Array<{ name: string }>
  }>
}

export function ExpectedReturns({ reservations }: ExpectedReturnsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5" />
          Očekávané vrácení
        </CardTitle>
        <CardDescription>Rezervace s prošlým termínem vrácení</CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žádné zpožděné vrácení</p>
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
                  <Badge variant="destructive">
                    {format(new Date(reservation.rental_end_date), "d. M.", { locale: cs })}
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
