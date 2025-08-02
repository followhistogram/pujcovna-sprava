"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { saveReservation } from "@/app/reservations/actions"
import type { Camera, Film, Reservation, ReservationItem, Accessory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { ReservationItemsManager } from "./reservation-items-manager"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type ReservationFormProps = {
  reservation: (Reservation & { items: ReservationItem[] }) | null
  availableCameras: Camera[]
  allFilms: Film[]
  allAccessories: Accessory[]
}

export function ReservationForm({ reservation, availableCameras, allFilms, allAccessories }: ReservationFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveReservation, null)

  const [items, setItems] = useState<Partial<ReservationItem>[]>(reservation?.items || [])
  const [dates, setDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: reservation ? new Date(reservation.rental_start_date) : undefined,
    to: reservation ? new Date(reservation.rental_end_date) : undefined,
  })

  const rentalDays =
    dates.from && dates.to ? Math.ceil((dates.to.getTime() - dates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      if (state.reservationId) {
        router.push(`/reservations/${state.reservationId}`)
        router.refresh()
      } else {
        router.refresh()
      }
    } else if (state?.success === false) {
      toast.error(state.message)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={reservation?.id} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="rental_start_date" value={dates.from?.toISOString()} />
      <input type="hidden" name="rental_end_date" value={dates.to?.toISOString()} />

      <ReservationItemsManager
        items={items}
        setItems={setItems}
        availableCameras={availableCameras}
        availableFilms={allFilms}
        availableAccessories={allAccessories}
        rentalDays={rentalDays}
      />

      <Card>
        <CardHeader>
          <CardTitle>Poznámky</CardTitle>
          <CardDescription>Interní a zákaznické poznámky k rezervaci.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="internal_notes">Interní poznámka (pouze pro vás)</Label>
            <Textarea
              id="internal_notes"
              name="internal_notes"
              defaultValue={reservation?.internal_notes || ""}
              placeholder="Důležité informace pro interní potřeby..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_notes">Poznámka zákazníka</Label>
            <Textarea
              id="customer_notes"
              name="customer_notes"
              defaultValue={reservation?.customer_notes || ""}
              placeholder="Speciální požadavky nebo dotazy od zákazníka..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sledování dopravy</CardTitle>
          <CardDescription>URL odkazy pro sledování zásilek.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="shipping_outbound_url">Doprava k zákazníkovi (URL)</Label>
            <Input
              id="shipping_outbound_url"
              name="shipping_outbound_url"
              type="url"
              defaultValue={reservation?.shipping_outbound_url || ""}
              placeholder="https://sledovani.zasilkovna.cz/..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipping_return_url">Doprava zpět (URL)</Label>
            <Input
              id="shipping_return_url"
              name="shipping_return_url"
              type="url"
              defaultValue={reservation?.shipping_return_url || ""}
              placeholder="https://sledovani.zasilkovna.cz/..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link href="/reservations">Zrušit</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládání..." : "Uložit rezervaci"}
        </Button>
      </div>
    </form>
  )
}
