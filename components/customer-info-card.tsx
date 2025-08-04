"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Check, Copy, X, User, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"
import { updateCustomerInfo } from "@/app/reservations/actions"
import { useFormState } from "react-dom"

interface CustomerInfoCardProps {
  reservation: {
    id: string
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
    customer_address: any
  }
}

export function CustomerInfoCard({ reservation }: CustomerInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction] = useFormState(updateCustomerInfo, null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} zkopírováno do schránky`)
    } catch (error) {
      toast.error("Chyba při kopírování do schránky")
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return ""
    if (typeof address === "string") return address
    if (typeof address === "object") {
      const parts = []
      if (address.street) parts.push(address.street)
      if (address.zip || address.city) {
        parts.push(`${address.zip || ""} ${address.city || ""}`.trim())
      }
      return parts.join(", ")
    }
    return ""
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await formAction(formData)
    if (result?.success) {
      setIsEditing(false)
      toast.success("Údaje zákazníka byly aktualizovány")
    } else {
      toast.error(result?.error || "Chyba při aktualizaci údajů")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Zákazník
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="h-8 w-8 p-0">
          {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="reservationId" value={reservation.id} />

            <div className="space-y-2">
              <Label htmlFor="customerName">Jméno</Label>
              <Input id="customerName" name="customerName" defaultValue={reservation.customer_name || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">E-mail</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                defaultValue={reservation.customer_email || ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefon</Label>
              <Input id="customerPhone" name="customerPhone" defaultValue={reservation.customer_phone || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Adresa</Label>
              <Textarea
                id="customerAddress"
                name="customerAddress"
                defaultValue={formatAddress(reservation.customer_address)}
                required
                rows={3}
              />
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
            {reservation.customer_name && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{reservation.customer_name}</p>
                    <p className="text-xs text-muted-foreground">Jméno</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.customer_name!, "Jméno")}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {reservation.customer_email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{reservation.customer_email}</p>
                    <p className="text-xs text-muted-foreground">E-mail</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.customer_email!, "E-mail")}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {reservation.customer_phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{reservation.customer_phone}</p>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reservation.customer_phone!, "Telefon")}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {reservation.customer_address && (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{formatAddress(reservation.customer_address)}</p>
                    <p className="text-xs text-muted-foreground">Adresa</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatAddress(reservation.customer_address), "Adresa")}
                  className="h-8 w-8 p-0 mt-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {!reservation.customer_name && !reservation.customer_email && !reservation.customer_phone && (
              <div className="text-center text-muted-foreground py-4">
                <p>Žádné údaje o zákazníkovi</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
