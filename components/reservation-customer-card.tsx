import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Reservation } from "@/lib/types"

export function ReservationCustomerCard({ reservation }: { reservation: Reservation | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zákazník</CardTitle>
        <CardDescription>Údaje o zákazníkovi pro rezervaci.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer_name">Jméno a příjmení</Label>
            <Input
              id="customer_name"
              name="customer_name"
              defaultValue={reservation?.customer_name}
              placeholder="Jan Novák"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_email">E-mail</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              defaultValue={reservation?.customer_email || ""}
              placeholder="jan.novak@email.cz"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer_phone">Telefon</Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              defaultValue={reservation?.customer_phone || ""}
              placeholder="+420 123 456 789"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_street">Ulice a č.p.</Label>
            <Input
              id="customer_street"
              name="customer_street"
              defaultValue={reservation?.customer_address?.street || ""}
              placeholder="Vodičkova 1"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer_zip">PSČ</Label>
            <Input
              id="customer_zip"
              name="customer_zip"
              defaultValue={reservation?.customer_address?.zip || ""}
              placeholder="110 00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_city">Město</Label>
            <Input
              id="customer_city"
              name="customer_city"
              defaultValue={reservation?.customer_address?.city || ""}
              placeholder="Praha 1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
