"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Check, X, Copy } from "lucide-react"
import { updateCustomerInfo } from "@/app/reservations/actions"
import { toast } from "sonner"
import type { Reservation } from "@/lib/types"

interface CustomerInfoCardProps {
  reservation: Reservation
}

function formatAddress(address: any): string {
  if (!address) return "Není uvedena"

  if (typeof address === "string") {
    return address
  }

  if (typeof address === "object") {
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.zip) parts.push(address.zip)
    return parts.length > 0 ? parts.join(", ") : "Není uvedena"
  }

  return "Není uvedena"
}

export function CustomerInfoCard({ reservation }: CustomerInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateCustomerInfo, null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} zkopírováno do schránky`)
    } catch (error) {
      toast.error("Nepodařilo se zkopírovat do schránky")
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData)
    if (result?.success) {
      setIsEditing(false)
      toast.success("Údaje zákazníka byly aktualizovány")
    } else {
      toast.error(result?.error || "Nepodařilo se aktualizovat údaje")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Zákazník</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={isPending}>
          {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="reservationId" value={reservation.id} />

            <div className="space-y-2">
              <Label htmlFor="customer_name">Jméno</Label>
              <Input id="customer_name" name="customer_name" defaultValue={reservation.customer_name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">E-mail</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                defaultValue={reservation.customer_email || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefon</Label>
              <Input id="customer_phone" name="customer_phone" defaultValue={reservation.customer_phone || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Ulice</Label>
              <Input
                id="street"
                name="street"
                defaultValue={
                  typeof reservation.customer_address === "object" && reservation.customer_address?.street
                    ? reservation.customer_address.street
                    : ""
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">Město</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={
                    typeof reservation.customer_address === "object" && reservation.customer_address?.city
                      ? reservation.customer_address.city
                      : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">PSČ</Label>
                <Input
                  id="zip"
                  name="zip"
                  defaultValue={
                    typeof reservation.customer_address === "object" && reservation.customer_address?.zip
                      ? reservation.customer_address.zip
                      : ""
                  }
                />
              </div>
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
                <p className="text-sm text-muted-foreground">Jméno</p>
                <p className="font-medium">{reservation.customer_name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(reservation.customer_name, "Jméno")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {reservation.customer_email && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{reservation.customer_email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.customer_email!, "E-mail")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            {reservation.customer_phone && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{reservation.customer_phone}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.customer_phone!, "Telefon")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adresa</p>
                <p className="font-medium">{formatAddress(reservation.customer_address)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formatAddress(reservation.customer_address), "Adresa")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
