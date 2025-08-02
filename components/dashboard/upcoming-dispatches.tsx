import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format, isToday, isTomorrow } from "date-fns"
import { cs } from "date-fns/locale"
import { ArrowRight } from "lucide-react"

type UpcomingDispatchesProps = {
  reservations: {
    id: string
    short_id: string
    customer_name: string
    rental_start_date: string
    items: { name: string }[]
  }[]
}

export function UpcomingDispatches({ reservations }: UpcomingDispatchesProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return "Dnes"
    if (isTomorrow(date)) return "Zítra"
    return format(date, "d. MMMM", { locale: cs })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rezervace k expedici (7 dní)</CardTitle>
        <CardDescription>Přehled výpůjček, které je potřeba připravit.</CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kdy</TableHead>
                <TableHead>Zákazník</TableHead>
                <TableHead>
                  <span className="sr-only">Akce</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{formatDate(r.rental_start_date)}</TableCell>
                  <TableCell>
                    <div>{r.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r.items.map((item) => item.name).join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/reservations/${r.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Žádné rezervace k expedici.</p>
        )}
      </CardContent>
    </Card>
  )
}
