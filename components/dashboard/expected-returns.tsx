import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"
import { ArrowRight, AlertTriangle } from "lucide-react"

type ExpectedReturnsProps = {
  reservations: {
    id: string
    short_id: string
    customer_name: string
    rental_end_date: string
    items: { name: string }[]
  }[]
}

export function ExpectedReturns({ reservations }: ExpectedReturnsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Očekávaná vrácení</CardTitle>
        <CardDescription>Aktivní výpůjčky po termínu vrácení.</CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zpoždění</TableHead>
                <TableHead>Zákazník</TableHead>
                <TableHead>
                  <span className="sr-only">Akce</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id} className="bg-amber-50 dark:bg-amber-950/30">
                  <TableCell className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {formatDistanceToNow(new Date(r.rental_end_date), { locale: cs, addSuffix: true })}
                  </TableCell>
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
          <p className="text-sm text-muted-foreground text-center py-8">Žádné výpůjčky po termínu vrácení.</p>
        )}
      </CardContent>
    </Card>
  )
}
