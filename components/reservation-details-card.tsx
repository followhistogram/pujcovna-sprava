"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Copy, Check, X } from "lucide-react"
import { updateReservationDetails } from "@/app/reservations/actions"
import { toast } from "sonner"
import { format } from "date-fns"
import type { Reservation } from "@/lib/types"

interface ReservationDetailsCardProps {
  reservation: Reservation
}

export function ReservationDetailsCard({ reservation }: ReservationDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    rental_start_date: reservation.rental_start_date || "",
    rental_end_date: reservation.rental_end_date || "",
    delivery_method: reservation.delivery_method || "",
    payment_method: reservation.payment_method || "",
    customer_notes: reservation.customer_notes || "",
    internal_notes: reservation.internal_notes || "",
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateReservationDetails(reservation.id, formData)
      if (result.success) {
        setIsEditing(false)
        toast.success("Detaily rezervace byly aktualizovány")
      } else {
        toast.error(result.error || "Nepodařilo se aktualizovat detaily")
      }
    } catch (error) {
      toast.error("Nepodařilo se aktualizovat detaily")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      rental_start_date: reservation.rental_start_date || "",
      rental_end_date: reservation.rental_end_date || "",
      delivery_method: reservation.delivery_method || "",
      payment_method: reservation.payment_method || "",
      customer_notes: reservation.customer_notes || "",
      internal_notes: reservation.internal_notes || "",
    })
    setIsEditing(false)
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} zkopírováno do schránky`)
    } catch (error) {
      toast.error("Nepodařilo se zkopírovat do schránky")
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Není zadáno"
    try {
      return format(new Date(dateString), "d. M. yyyy")
    } catch {
      return dateString
    }
  }

  const translateDeliveryMethod = (method: string) => {
    const translations: Record<string, string> = {
      pickup: "Osobní odběr",
      delivery: "Doručení",
    }
    return translations[method] || method || "Není zadáno"
  }

  const translatePaymentMethod = (method: string) => {
    const translations: Record<string, string> = {
      card: "Kartou",
      cash: "Hotově",
      bank_transfer: "Bankovní převod",
    }
    return translations[method] || method || "Není zadáno"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Detaily rezervace</CardTitle>
          <CardDescription>Termín, způsob doručení a poznámky</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="rental_start_date">Začátek pronájmu</Label>
                <Input
                  id="rental_start_date"
                  type="date"
                  value={formData.rental_start_date}
                  onChange={(e) => setFormData({ ...formData, rental_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rental_end_date">Konec pronájmu</Label>
                <Input
                  id="rental_end_date"
                  type="date"
                  value={formData.rental_end_date}
                  onChange={(e) => setFormData({ ...formData, rental_end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_method">Způsob doručení</Label>
              <Select
                value={formData.delivery_method}
                onValueChange={(value) => setFormData({ ...formData, delivery_method: value })}
              >
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
              <Label htmlFor="payment_method">Způsob platby</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte způsob platby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Kartou</SelectItem>
                  <SelectItem value="cash">Hotově</SelectItem>
                  <SelectItem value="bank_transfer">Bankovní převod</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_notes">Poznámky zákazníka</Label>
              <Textarea
                id="customer_notes"
                value={formData.customer_notes}
                onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                placeholder="Poznámky od zákazníka..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Interní poznámky</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                placeholder="Interní poznámky..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={isLoading} size="sm">
                <Check className="h-4 w-4 mr-1" />
                Uložit
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading} size="sm">
                <X className="h-4 w-4 mr-1" />
                Zrušit
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Začátek pronájmu</div>
                  <div className="font-medium">{formatDate(reservation.rental_start_date)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(formatDate(reservation.rental_start_date), "Začátek pronájmu")}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Konec pronájmu</div>
                  <div className="font-medium">{formatDate(reservation.rental_end_date)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(formatDate(reservation.rental_end_date), "Konec pronájmu")}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Způsob doručení</div>
                  <div className="font-medium">{translateDeliveryMethod(reservation.delivery_method || "")}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(translateDeliveryMethod(reservation.delivery_method || ""), "Způsob doručení")
                  }
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Způsob platby</div>
                  <div className="font-medium">{translatePaymentMethod(reservation.payment_method || "")}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(translatePaymentMethod(reservation.payment_method || ""), "Způsob platby")
                  }
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {reservation.customer_notes && (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Poznámky zákazníka</div>
                    <div className="font-medium text-sm">{reservation.customer_notes}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(reservation.customer_notes || "", "Poznámky zákazníka")}
                    className="h-8 w-8"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {reservation.internal_notes && (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Interní poznámky</div>
                    <div className="font-medium text-sm">{reservation.internal_notes}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(reservation.internal_notes || "", "Interní poznámky")}
                    className="h-8 w-8"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
