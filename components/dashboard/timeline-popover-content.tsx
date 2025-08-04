import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import type { Reservation } from "@/lib/types"

interface TimelinePopoverContentProps {
  reservation: Reservation & {
    items: Array<{
      item_id: string
      item_type: string
      quantity: number
    }>
  }
}

export function TimelinePopoverContent({ reservation }: TimelinePopoverContentProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Potvrzeno"
      case "ready_for_dispatch":
        return "K odeslání"
      case "active":
        return "Aktivní"
      case "returned":
        return "Vráceno"
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "ready_for_dispatch":
        return "secondary"
      case "active":
        return "default"
      case "returned":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{reservation.customer_name}</h4>
        <p className="text-sm text-muted-foreground">Rezervace #{reservation.short_id}</p>
      </div>

      <div className="text-sm">
        <p>
          <strong>Termín:</strong> {format(new Date(reservation.rental_start_date), "d. M. yyyy", { locale: cs })} -{" "}
          {format(new Date(reservation.rental_end_date), "d. M. yyyy", { locale: cs })}
        </p>
      </div>

      <div>
        <Badge variant={getStatusVariant(reservation.status)}>{getStatusLabel(reservation.status)}</Badge>
      </div>

      {reservation.items && reservation.items.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Položky:</p>
          <ul className="text-sm text-muted-foreground">
            {reservation.items.map((item, index) => (
              <li key={index}>
                {item.quantity}x{" "}
                {item.item_type === "camera" ? "Fotoaparát" : item.item_type === "film" ? "Film" : "Příslušenství"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
