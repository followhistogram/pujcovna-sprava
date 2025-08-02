import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { ReservationItem } from "@/lib/types"

export function ReservationItemsCard({ items }: { items: ReservationItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Položky rezervace</CardTitle>
        <CardDescription>Seznam vypůjčeného vybavení a filmů.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název</TableHead>
              <TableHead className="text-center">Množství</TableHead>
              <TableHead className="text-right">Cena/ks</TableHead>
              <TableHead className="text-right">Kauce</TableHead>
              <TableHead className="text-right">Celkem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.unit_price.toLocaleString("cs-CZ")} Kč</TableCell>
                <TableCell className="text-right">{item.deposit.toLocaleString("cs-CZ")} Kč</TableCell>
                <TableCell className="text-right">
                  {(item.unit_price * item.quantity).toLocaleString("cs-CZ")} Kč
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className="border-t pt-4">
        <Button size="sm" variant="outline" className="w-full bg-transparent">
          <PlusCircle className="h-4 w-4 mr-2" />
          Přidat položku
        </Button>
      </CardContent>
    </Card>
  )
}
