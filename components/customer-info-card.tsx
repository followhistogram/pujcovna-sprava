import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Reservation } from "@/lib/types"
import { User, Mail, Phone, Home } from "lucide-react"

export function CustomerInfoCard({ reservation }: { reservation: Reservation | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zákazník</CardTitle>
        <CardDescription>Kontaktní a doručovací údaje.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {reservation ? (
          <>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{reservation.customer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${reservation.customer_email}`} className="text-primary hover:underline">
                {reservation.customer_email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${reservation.customer_phone}`} className="text-primary hover:underline">
                {reservation.customer_phone}
              </a>
            </div>
            {reservation.customer_address && (
              <div className="flex items-start gap-3 pt-2 border-t mt-3">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                <address className="not-italic">
                  <div>{reservation.customer_address.street}</div>
                  <div>
                    {reservation.customer_address.zip} {reservation.customer_address.city}
                  </div>
                </address>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">Vyplňte údaje o zákazníkovi.</div>
        )}
      </CardContent>
    </Card>
  )
}
