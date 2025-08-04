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
import { format } from "date-fns"
import { Edit2, Check, Copy } from "lucide-react"

function EditableReservationDetails({
  reservation,
  dates,
  setDates,
}: {
  reservation: (Reservation & { items: ReservationItem[] }) | null
  dates: { from: Date | undefined; to: Date | undefined }
  setDates: (dates: { from: Date | undefined; to: Date | undefined }) => void
}) {
  const [isEditing, setIsEditing] = useState(!reservation) // Start in edit mode for new reservations

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Termín rezervace</CardTitle>
          <CardDescription>Datum začátku a konce půjčení</CardDescription>
        </div>
        {reservation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8 p-0"
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="rental_start_date">Datum od</Label>
              <Input
                id="rental_start_date"
                name="rental_start_date"
                type="date"
                defaultValue={reservation ? new Date(reservation.rental_start_date).toISOString().split("T")[0] : ""}
                onChange={(e) => setDates({ ...dates, from: e.target.value ? new Date(e.target.value) : undefined })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rental_end_date">Datum do</Label>
              <Input
                id="rental_end_date"
                name="rental_end_date"
                type="date"
                defaultValue={reservation ? new Date(reservation.rental_end_date).toISOString().split("T")[0] : ""}
                onChange={(e) => setDates({ ...dates, to: e.target.value ? new Date(e.target.value) : undefined })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delivery_method">Způsob předání</Label>
              <select
                id="delivery_method"
                name="delivery_method"
                defaultValue={reservation?.delivery_method || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Vyberte způsob předání</option>
                <option value="pickup">Osobní odběr</option>
                <option value="delivery">Doručení na adresu</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_method">Způsob platby</Label>
              <select
                id="payment_method"
                name="payment_method"
                defaultValue={reservation?.payment_method || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Vyberte způsob platby</option>
                <option value="card">Kartou</option>
                <option value="bank_transfer">Bankovní převod</option>
                <option value="cash">Hotově</option>
              </select>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Termín</p>
              <p className="text-sm">
                {dates.from ? format(dates.from, "d. M. yyyy") : "Nezadáno"} -{" "}
                {dates.to ? format(dates.to, "d. M. yyyy") : "Nezadáno"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Způsob předání</p>
              <p className="text-sm">
                {reservation?.delivery_method === "pickup"
                  ? "Osobní odběr"
                  : reservation?.delivery_method === "delivery"
                    ? "Doručení na adresu"
                    : "Nezadáno"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Způsob platby</p>
              <p className="text-sm">
                {reservation?.payment_method === "card"
                  ? "Kartou"
                  : reservation?.payment_method === "bank_transfer"
                    ? "Bankovní převod"
                    : reservation?.payment_method === "cash"
                      ? "Hotově"
                      : "Nezadáno"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditableCustomerInfo({ reservation }: { reservation: (Reservation & { items: ReservationItem[] }) | null }) {
  const [isEditing, setIsEditing] = useState(!reservation) // Start in edit mode for new reservations

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} zkopírován do schránky`)
    } catch (err) {
      toast.error("Nepodařilo se zkopírovat do schránky")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Údaje zákazníka</CardTitle>
          <CardDescription>Kontaktní informace a adresa</CardDescription>
        </div>
        {reservation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8 p-0"
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="customer_name">Jméno a příjmení *</Label>
              <Input id="customer_name" name="customer_name" defaultValue={reservation?.customer_name || ""} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer_email">E-mail</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                defaultValue={reservation?.customer_email || ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer_phone">Telefon</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                defaultValue={reservation?.customer_phone || ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer_street">Ulice a číslo popisné</Label>
              <Input
                id="customer_street"
                name="customer_street"
                defaultValue={reservation?.customer_address?.street || ""}
              />
            </div>
            <div className="grid gap-2 grid-cols-2">
              <div>
                <Label htmlFor="customer_zip">PSČ</Label>
                <Input id="customer_zip" name="customer_zip" defaultValue={reservation?.customer_address?.zip || ""} />
              </div>
              <div>
                <Label htmlFor="customer_city">Město</Label>
                <Input
                  id="customer_city"
                  name="customer_city"
                  defaultValue={reservation?.customer_address?.city || ""}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jméno</p>
              <p className="text-sm">{reservation?.customer_name || "Nezadáno"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-mail</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{reservation?.customer_email || "Nezadáno"}</p>
                {reservation?.customer_email && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(reservation.customer_email!, "E-mail")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Telefon</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">{reservation?.customer_phone || "Nezadáno"}</p>
                {reservation?.customer_phone && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(reservation.customer_phone!, "Telefon")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresa</p>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {reservation?.customer_address?.street && reservation?.customer_address?.city
                    ? `${reservation.customer_address.street}, ${reservation.customer_address.zip} ${reservation.customer_address.city}`
                    : "Nezadáno"}
                </p>
                {reservation?.customer_address?.street && reservation?.customer_address?.city && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${reservation.customer_address!.street}, ${reservation.customer_address!.zip} ${reservation.customer_address!.city}`,
                        "Adresa",
                      )
                    }
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type ReservationFormProps = {
  reservation: (Reservation & { items: ReservationItem[] }) | null
  availableCameras?: Camera[]
  allFilms?: Film[]
  allAccessories?: Accessory[]
}

export function ReservationForm({
  reservation,
  availableCameras: initialCameras = [],
  allFilms: initialFilms = [],
  allAccessories: initialAccessories = [],
}: ReservationFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveReservation, null)

  const [items, setItems] = useState<Partial<ReservationItem>[]>(reservation?.items || [])
  const [dates, setDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: reservation ? new Date(reservation.rental_start_date) : undefined,
    to: reservation ? new Date(reservation.rental_end_date) : undefined,
  })

  const [availableCameras, setAvailableCameras] = useState<Camera[]>(initialCameras)
  const [availableFilms, setAvailableFilms] = useState<Film[]>(initialFilms)
  const [availableAccessories, setAvailableAccessories] = useState<Accessory[]>(initialAccessories)
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  useEffect(() => {
    const isDataPreloaded = initialCameras.length > 0 || initialFilms.length > 0 || initialAccessories.length > 0
    if (isDataPreloaded) {
      return
    }

    const fetchAvailableItems = async () => {
      setIsLoadingItems(true)
      try {
        const response = await fetch("/api/inventory/available")
        if (!response.ok) {
          throw new Error("Failed to fetch available items")
        }
        const data: { cameras: Camera[]; films: Film[]; accessories: Accessory[] } = await response.json()

        setAvailableCameras(data.cameras || [])
        setAvailableFilms(data.films || [])
        setAvailableAccessories(data.accessories || [])
      } catch (error) {
        console.error(error)
        toast.error("Nepodařilo se načíst dostupné položky.")
      } finally {
        setIsLoadingItems(false)
      }
    }

    fetchAvailableItems()
  }, [initialCameras.length, initialFilms.length, initialAccessories.length])

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

      <div className="grid gap-6 md:grid-cols-2">
        <EditableReservationDetails reservation={reservation} dates={dates} setDates={setDates} />
        <EditableCustomerInfo reservation={reservation} />
      </div>

      <ReservationItemsManager
        items={items}
        setItems={setItems}
        availableCameras={availableCameras}
        availableFilms={availableFilms}
        availableAccessories={availableAccessories}
        rentalDays={rentalDays}
        isLoading={isLoadingItems}
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
        <Button type="submit" disabled={isPending || isLoadingItems}>
          {isPending ? "Ukládání..." : "Uložit rezervaci"}
        </Button>
      </div>
    </form>
  )
}
