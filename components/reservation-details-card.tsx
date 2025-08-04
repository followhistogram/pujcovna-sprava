"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Check, X, Copy } from "lucide-react"
import { updateReservationDetails } from "@/app/reservations/actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import type { Reservation } from "@/lib/types"

interface ReservationDetailsCardProps {
  reservation: Reservation
}

export function ReservationDetailsCard({ reservation }: ReservationDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} zkopírováno do schránky`)
    } catch (error) {
      toast.error("Nepodařilo se zkopírovat do schránky")
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    formData.append("reservationId", reservation.id)

    try {
      const result = await updateReservationDetails(formData)
      if (result?.success) {
        setIsEditing(false)
        toast.success("Detaily rezervace byly aktualizovány")
      } else {
        toast.error(result?.error || "Nepodařilo se aktualizovat detaily")
      }
    } catch (error) {
      toast.error("Došlo k neočekávané chybě")
    } finally {
      setIsPending(false)
    }
  }

  const formatDeliveryMethod = (method: string) => {
    const methods = {
      pickup: "Osobní odběr",
      delivery: "Doručení na adresu",
    }
    return methods[method as keyof typeof methods] || method
  }

  const formatPaymentMethod = (method: string) => {
    const methods = {
      cash: "Hotově",
      card: "Kartou",
      transfer: "Převodem",
      bank_transfer: "Bankovní převod",
    }
    return methods[method as keyof typeof methods] || method
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Detaily rezervace</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={isPending}>
          {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rental_start_date">Datum od</Label>
                <Input
                  id="rental_start_date"
                  name="rental_start_date"
                  type="date"
                  defaultValue={reservation.rental_start_date}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rental_end_date">Datum do</Label>
                <Input
                  id="rental_end_date"
                  name="rental_end_date"
                  type="date"
                  defaultValue={reservation.rental_end_date}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_method">Způsob doručení</Label>
              <Select name="delivery_method" defaultValue={reservation.delivery_method || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte způsob doručení" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Osobní odběr</SelectItem>
                  <SelectItem value="delivery">Doručení na adresu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Způsob platby</Label>
              <Select name="payment_method" defaultValue={reservation.payment_method || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte způsob platby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Hotově</SelectItem>
                  <SelectItem value="card">Kartou</SelectItem>
                  <SelectItem value="transfer">Převodem</SelectItem>
                  <SelectItem value="bank_transfer">Bankovní převod</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_notes">Poznámky zákazníka</Label>
              <Textarea
                id="customer_notes"
                name="customer_notes"
                defaultValue={reservation.customer_notes || ""}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Interní poznámky</Label>
              <Textarea
                id="internal_notes"
                name="internal_notes"
                defaultValue={reservation.internal_notes || ""}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                <Check className="h-4 w-4 mr-2" />
                Uložit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Zrušit
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Období pronájmu</p>
                <p className="font-medium">
                  {format(new Date(reservation.rental_start_date), "d. M. yyyy", { locale: cs })} -{" "}
                  {format(new Date(reservation.rental_end_date), "d. M. yyyy", { locale: cs })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    `${format(new Date(reservation.rental_start_date), "d. M. yyyy", { locale: cs })} - ${format(new Date(reservation.rental_end_date), "d. M. yyyy", { locale: cs })}`,
                    "Období pronájmu",
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {reservation.delivery_method && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Způsob doručení</p>
                  <p className="font-medium">{formatDeliveryMethod(reservation.delivery_method)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatDeliveryMethod(reservation.delivery_method!), "Způsob doručení")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            {reservation.payment_method && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Způsob platby</p>
                  <p className="font-medium">{formatPaymentMethod(reservation.payment_method)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatPaymentMethod(reservation.payment_method!), "Způsob platby")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            {reservation.customer_notes && (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Poznámky zákazníka</p>
                  <p className="font-medium whitespace-pre-wrap">{reservation.customer_notes}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.customer_notes!, "Poznámky zákazníka")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            {reservation.internal_notes && (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Interní poznámky</p>
                  <p className="font-medium whitespace-pre-wrap">{reservation.internal_notes}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.internal_notes!, "Interní poznámky")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
