import type { Reservation } from "@/lib/types"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type TimelinePopoverContentProps = {
  reservation: Reservation & {
    items: Array<{
      item_type: "camera" | "film" | "accessory"
      name: string
      quantity: number
    }>
  }
}

export function TimelinePopoverContent({ reservation }: TimelinePopoverContentProps) {
  const cameraItems = reservation.items.filter((item) => item.item_type === "camera")

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">{reservation.customer_name}</h4>
          <p className="text-sm text-muted-foreground">{reservation.short_id}</p>
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </div>
      <div className="text-sm">
        <p>
          <span className="font-medium">Termín:</span> {format(new Date(reservation.rental_start_date), "d. M. yyyy")} -{" "}
          {format(new Date(reservation.rental_end_date), "d. M. yyyy")}
        </p>
        <p>
          <span className="font-medium">Vybavení:</span> {cameraItems.map((item) => item.name).join(", ")}
        </p>
      </div>
      <Button asChild size="sm" className="w-full">
        <Link href={`/reservations/${reservation.id}`}>Zobrazit detail</Link>
      </Button>
    </div>
  )
}
