"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Copy, Check, X } from "lucide-react"
import { updateCustomerInfo } from "@/app/reservations/actions"
import { toast } from "sonner"
import type { Reservation } from "@/lib/types"

interface CustomerInfoCardProps {
  reservation: Reservation
}

export function CustomerInfoCard({ reservation }: CustomerInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: reservation.customer_name || "",
    customer_email: reservation.customer_email || "",
    customer_phone: reservation.customer_phone || "",
    customer_address: reservation.customer_address || { street: "", city: "", zip: "" },
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateCustomerInfo(reservation.id, formData)
      if (result.success) {
        setIsEditing(false)
        toast.success("Údaje zákazníka byly aktualizovány")
      } else {
        toast.error(result.error || "Nepodařilo se aktualizovat údaje")
      }
    } catch (error) {
      toast.error("Nepodařilo se aktualizovat údaje")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      customer_name: reservation.customer_name || "",
      customer_email: reservation.customer_email || "",
      customer_phone: reservation.customer_phone || "",
      customer_address: reservation.customer_address || { street: "", city: "", zip: "" },
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

  const formatAddress = (address: any) => {
    if (!address) return "Není zadáno"
    if (typeof address === "string") return address
    const { street, city, zip } = address
    return [street, city, zip].filter(Boolean).join(", ") || "Není zadáno"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Zákazník</CardTitle>
          <CardDescription>Kontaktní údaje a adresa</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="customer_name">Jméno</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Jméno zákazníka"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">E-mail</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefon</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                placeholder="+420 123 456 789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_street">Ulice</Label>
              <Input
                id="address_street"
                value={formData.customer_address?.street || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_address: {
                      ...formData.customer_address,
                      street: e.target.value,
                    },
                  })
                }
                placeholder="Ulice a číslo popisné"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="address_city">Město</Label>
                <Input
                  id="address_city"
                  value={formData.customer_address?.city || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer_address: {
                        ...formData.customer_address,
                        city: e.target.value,
                      },
                    })
                  }
                  placeholder="Město"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_zip">PSČ</Label>
                <Input
                  id="address_zip"
                  value={formData.customer_address?.zip || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer_address: {
                        ...formData.customer_address,
                        zip: e.target.value,
                      },
                    })
                  }
                  placeholder="12345"
                />
              </div>
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
                  <div className="text-sm font-medium text-muted-foreground">Jméno</div>
                  <div className="font-medium">{reservation.customer_name || "Není zadáno"}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(reservation.customer_name || "", "Jméno")}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">E-mail</div>
                  <div className="font-medium">{reservation.customer_email || "Není zadáno"}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(reservation.customer_email || "", "E-mail")}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Telefon</div>
                  <div className="font-medium">{reservation.customer_phone || "Není zadáno"}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(reservation.customer_phone || "", "Telefon")}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Adresa</div>
                  <div className="font-medium">{formatAddress(reservation.customer_address)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(formatAddress(reservation.customer_address), "Adresa")}
                  className="h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
