"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Camera, Film, Package } from "lucide-react"

interface ReservationItem {
  id: string
  type: "camera" | "film" | "accessory"
  name: string
  quantity: number
  price_per_day: number
  total_price?: number
  description?: string
  inventory_item_id?: string
}

interface ReservationItemsDisplayProps {
  items: ReservationItem[]
  rentalDays: number
}

export function ReservationItemsDisplay({ items = [], rentalDays }: ReservationItemsDisplayProps) {
  const getItemIcon = (type: string) => {
    switch (type) {
      case "camera":
        return <Camera className="h-4 w-4" />
      case "film":
        return <Film className="h-4 w-4" />
      case "accessory":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "camera":
        return "Fotoaparát"
      case "film":
        return "Film"
      case "accessory":
        return "Příslušenství"
      default:
        return "Položka"
    }
  }

  // Výpočet celkové ceny
  const totalPrice = items.reduce((sum, item) => {
    const itemTotal = (Number(item.price_per_day) || 0) * (Number(item.quantity) || 0) * rentalDays
    return sum + itemTotal
  }, 0)

  // Statistiky podle typu
  const getTypeStats = () => {
    const stats = {
      camera: { count: 0, total: 0 },
      film: { count: 0, total: 0 },
      accessory: { count: 0, total: 0 },
    }

    items.forEach((item) => {
      if (stats[item.type]) {
        stats[item.type].count += Number(item.quantity) || 0
        stats[item.type].total += (Number(item.price_per_day) || 0) * (Number(item.quantity) || 0) * rentalDays
      }
    })

    return stats
  }

  const typeStats = getTypeStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Položky rezervace
          <Badge variant="secondary">{items.length} položek</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Přehled podle kategorií */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(typeStats).map(([type, stats]) => (
              <div key={type} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">{getItemIcon(type)}</div>
                <p className="text-sm font-medium">{getItemTypeLabel(type)}</p>
                <p className="text-lg font-bold">{stats.count}</p>
                <p className="text-xs text-muted-foreground">{stats.total.toLocaleString("cs-CZ")} Kč</p>
              </div>
            ))}
          </div>

          {/* Tabulka položek */}
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Položka</TableHead>
                  <TableHead className="text-center">Typ</TableHead>
                  <TableHead className="text-center">Počet</TableHead>
                  <TableHead className="text-right">Cena/den</TableHead>
                  <TableHead className="text-right">Celkem ({rentalDays} dní)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const itemTotal = (Number(item.price_per_day) || 0) * (Number(item.quantity) || 0) * rentalDays

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                          {getItemIcon(item.type)}
                          {getItemTypeLabel(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {(Number(item.price_per_day) || 0).toLocaleString("cs-CZ")} Kč
                      </TableCell>
                      <TableCell className="text-right font-medium">{itemTotal.toLocaleString("cs-CZ")} Kč</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Žádné položky v rezervaci</p>
              <p className="text-sm">Rezervace neobsahuje žádné položky</p>
            </div>
          )}

          {/* Celková cena */}
          {items.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-medium">Celkem za {rentalDays} dní:</span>
              <span className="text-xl font-bold">{totalPrice.toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
