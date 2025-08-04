"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Check, Copy, X, Calendar, Truck, CreditCard, FileText } from "lucide-react"
import { toast } from "sonner"
import { updateReservationDetails } from "@/app/reservations/actions"
import { useFormState } from "react-dom"
import { format } from "date-fns"

interface ReservationDetailsCardProps {
  reservation: {
    id: string
    rental_start_date: string | null
    rental_end_date: string | null
    delivery_method: string | null
    payment_method: string | null
    notes: string | null
  }
}

export function ReservationDetailsCard({ reservation }: ReservationDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction] = useFormState(updateReservationDetails, null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} zkopírováno do schránky`)
    } catch (error) {
      toast.error("Chyba při kopírování do schránky")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "d. M. yyyy")
    } catch {
      return dateString
    }
  }

  const getDeliveryMethodLabel = (method: string | null) => {
    switch (method) {
      case "pickup":
        return "Osobní odběr"
      case "delivery":
        return "Doručení"
      default:
        return method || "Neurčeno"
    }
  }

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case "cash":
        return "Hotově"
      case "card":
        return "Kartou"
      case "transfer":
        return "Převodem"
      default:
        return method || "Neurčeno"
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData)
    if (result?.success) {
      setIsEditing(false)
      toast.success("Detaily rezervace byly aktualizovány")
    } else {
      toast.error(result?.error || "Chyba při aktualizaci detailů")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Detaily rezervace
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="h-8 w-8 p-0">
          {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="reservationId" value={reservation.id} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentalStartDate">Začátek pronájmu</Label>
                <Input
                  id="rentalStartDate"
                  name="rentalStartDate"
                  type="date"
                  defaultValue={reservation.rental_start_date || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalEndDate">Konec pronájmu</Label>
                <Input
                  id="rentalEndDate"
                  name="rentalEndDate"
                  type="date"
                  defaultValue={reservation.rental_end_date || ""}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMethod">Způsob doručení</Label>
              <Select name="deliveryMethod" defaultValue={reservation.delivery_method || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte způsob doručení" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Osobní odběr</SelectItem>
                  <SelectItem value="delivery">Doručení</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Způsob platby</Label>
              <Select name="paymentMethod" defaultValue={reservation.payment_method || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte způsob platby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Hotově</SelectItem>
                  <SelectItem value="card">Kartou</SelectItem>
                  <SelectItem value="transfer">Převodem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Poznámky</Label>
              <Textarea id="notes" name="notes" defaultValue={reservation.notes || ""} rows={3} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                <Check className="h-4 w-4 mr-2" />
                Uložit
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Zrušit
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {(reservation.rental_start_date || reservation.rental_end_date) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(reservation.rental_start_date)} - {formatDate(reservation.rental_end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">Období pronájmu</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `${formatDate(reservation.rental_start_date)} - ${formatDate(reservation.rental_end_date)}`,
                      "Období pronájmu",
                    )
                  }
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {reservation.delivery_method && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{getDeliveryMethodLabel(reservation.delivery_method)}</p>
                    <p className="text-xs text-muted-foreground">Způsob doručení</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(getDeliveryMethodLabel(reservation.delivery_method), "Způsob doručení")
                  }
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {reservation.payment_method && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{getPaymentMethodLabel(reservation.payment_method)}</p>
                    <p className="text-xs text-muted-foreground">Způsob platby</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(getPaymentMethodLabel(reservation.payment_method), "Způsob platby")}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {reservation.notes && (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{reservation.notes}</p>
                    <p className="text-xs text-muted-foreground">Poznámky</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.notes!, "Poznámky")}
                  className="h-8 w-8 p-0 mt-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {!reservation.rental_start_date &&
              !reservation.rental_end_date &&
              !reservation.delivery_method &&
              !reservation.payment_method &&
              !reservation.notes && (
                <div className="text-center text-muted-foreground py-4">
                  <p>Žádné detaily rezervace</p>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
