import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleUser, CreditCard, CircleCheck } from "lucide-react"

// This is a placeholder component. In a real app, you would fetch logs from the database.
const timelineEvents = [
  {
    icon: CircleUser,
    title: "Rezervace vytvořena",
    time: "2. srpna 2025, 17:30",
    description: "Vytvořil Admin",
  },
  {
    icon: CreditCard,
    title: "Platba přijata",
    time: "2. srpna 2025, 17:32",
    description: "Záloha 1 500 Kč (Kartou)",
  },
  {
    icon: CircleCheck,
    title: "Stav změněn na Potvrzeno",
    time: "2. srpna 2025, 17:32",
    description: "Automaticky po platbě",
  },
]

export function ReservationTimeline({ reservationId }: { reservationId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Časová osa</CardTitle>
        <CardDescription>Historie událostí této rezervace.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex items-start gap-4 mb-6">
              <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-background border">
                <event.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <time className="text-xs text-muted-foreground">{event.time}</time>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
