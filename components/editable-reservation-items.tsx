"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Camera, Film, Package, Plus, Trash2, Save, Edit, X, Loader2 } from "lucide-react"
import type {
  ReservationItem as TReservationItem,
  Camera as TCamera,
  Film as TFilm,
  Accessory as TAccessory,
  PriceTier,
} from "@/lib/types"

interface EditableReservationItemsProps {
  reservationId: string
  items: TReservationItem[]
  rentalDays: number
}

type EditableReservationItem = TReservationItem & {
  pricing_tiers?: PriceTier[] | null
}

export function EditableReservationItems({
  reservationId,
  items: initialItems,
  rentalDays,
}: EditableReservationItemsProps) {
  const [items, setItems] = useState<EditableReservationItem[]>(initialItems)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItemType, setSelectedItemType] = useState<"camera" | "film" | "accessory">("camera")

  const [availableCameras, setAvailableCameras] = useState<TCamera[]>([])
  const [availableFilms, setAvailableFilms] = useState<TFilm[]>([])
  const [availableAccessories, setAvailableAccessories] = useState<TAccessory[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const getCameraPrice = (camera: { pricing_tiers?: PriceTier[] | null }, days: number): number => {
    const tiers = camera.pricing_tiers
    if (!tiers || tiers.length === 0) {
      return 0
    }

    const applicableTier = [...tiers].sort((a, b) => b.min_days - a.min_days).find((tier) => days >= tier.min_days)

    if (applicableTier) {
      return (applicableTier.price_per_day || 0) * days
    }

    const lowestTier = [...tiers].sort((a, b) => a.min_days - b.min_days)[0]
    return (lowestTier?.price_per_day || 0) * days
  }

  useEffect(() => {
    if (!isEditing) return

    const fetchAndPrepareItems = async () => {
      setIsLoadingItems(true)
      try {
        const response = await fetch("/api/inventory/available")
        if (!response.ok) {
          throw new Error("Failed to fetch available items")
        }
        const data: { cameras: TCamera[]; films: TFilm[]; accessories: TAccessory[] } = await response.json()

        setAvailableCameras(data.cameras || [])
        setAvailableFilms(data.films || [])
        setAvailableAccessories(data.accessories || [])

        setItems((currentItems) =>
          currentItems.map((item) => {
            if (item.item_type === "camera") {
              const cameraData = (data.cameras || []).find((c) => c.id === item.item_id)
              if (cameraData) {
                return {
                  ...item,
                  pricing_tiers: cameraData.pricing_tiers,
                  unit_price: getCameraPrice(cameraData, rentalDays),
                }
              }
            }
            return item
          }),
        )
      } catch (error) {
        console.error("Error fetching available items:", error)
        toast.error("Nepodařilo se načíst dostupné položky.")
      } finally {
        setIsLoadingItems(false)
      }
    }

    fetchAndPrepareItems()
  }, [isEditing])

  useEffect(() => {
    if (isEditing) {
      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.item_type === "camera" && item.pricing_tiers) {
            return { ...item, unit_price: getCameraPrice(item, rentalDays) }
          }
          return item
        }),
      )
    }
  }, [rentalDays, isEditing])

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

  const getAvailableItemsByType = () => {
    switch (selectedItemType) {
      case "camera":
        return availableCameras
      case "film":
        return availableFilms
      case "accessory":
        return availableAccessories
      default:
        return []
    }
  }

  const totalPrice = items.reduce((sum, item) => {
    const itemTotal = (Number(item.unit_price) || 0) * (Number(item.quantity) || 0)
    return sum + itemTotal
  }, 0)

  const getTypeStats = () => {
    const stats = {
      camera: { count: 0, total: 0 },
      film: { count: 0, total: 0 },
      accessory: { count: 0, total: 0 },
    }
    items.forEach((item) => {
      if (stats[item.item_type]) {
        stats[item.item_type].count += Number(item.quantity) || 0
        stats[item.item_type].total += (Number(item.unit_price) || 0) * (Number(item.quantity) || 0)
      }
    })
    return stats
  }

  const addItem = (itemToAdd: TCamera | TFilm | TAccessory, type: "camera" | "film" | "accessory") => {
    let newItem: EditableReservationItem

    if (type === "camera") {
      const camera = itemToAdd as TCamera
      newItem = {
        id: `temp-${Date.now()}`,
        reservation_id: reservationId,
        item_id: camera.id,
        item_type: "camera",
        name: camera.name,
        quantity: 1,
        unit_price: getCameraPrice(camera, rentalDays),
        deposit: camera.deposit,
        pricing_tiers: camera.pricing_tiers,
      }
    } else if (type === "film") {
      const film = itemToAdd as TFilm
      newItem = {
        id: `temp-${Date.now()}`,
        reservation_id: reservationId,
        item_id: film.id,
        item_type: "film",
        name: film.name,
        quantity: 1,
        unit_price: film.price || 0,
        deposit: 0,
      }
    } else {
      // accessory
      const accessory = itemToAdd as TAccessory
      newItem = {
        id: `temp-${Date.now()}`,
        reservation_id: reservationId,
        item_id: accessory.id,
        item_type: "accessory",
        name: accessory.name,
        quantity: 1,
        unit_price: accessory.price || 0,
        deposit: 0,
      }
    }

    setItems((prev) => [...prev, newItem])
    setIsAddDialogOpen(false)
    toast.success("Položka přidána", { description: `${itemToAdd.name} byla přidána do rezervace.` })
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    toast.success("Položka odebrána")
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/reservations/${reservationId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Chyba při ukládání")
      }

      setIsEditing(false)
      toast.success("Změny uloženy", { description: "Položky rezervace byly úspěšně aktualizovány." })
      window.location.reload()
    } catch (error) {
      console.error("Error saving items:", error)
      const errorMessage = error instanceof Error ? error.message : "Nepodařilo se uložit změny. Zkuste to znovu."
      toast.error("Chyba při ukládání", { description: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEditing = () => {
    setItems(initialItems)
    setIsEditing(false)
  }

  const typeStats = getTypeStats()
  const availableItemsForDialog = getAvailableItemsByType()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Položky rezervace
            <Badge variant="secondary">{items.length} položek</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" /> Upravit
              </Button>
            ) : (
              <>
                <Button onClick={cancelEditing} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" /> Zrušit
                </Button>
                <Button onClick={saveChanges} size="sm" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" /> {isSaving ? "Ukládám..." : "Uložit"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(typeStats).map(([type, stats]) => (
              <div key={type} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">{getItemIcon(type)}</div>
                <p className="text-sm font-medium">{getItemTypeLabel(type)}</p>
                <p className="text-lg font-bold">{stats.count}</p>
                <p className="text-xs text-muted-foreground">{stats.total.toLocaleString("cs-CZ")} Kč</p>
              </div>
            ))}
          </div>

          {isEditing && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" /> Přidat položku
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Přidat položku do rezervace</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select
                    value={selectedItemType}
                    onValueChange={(value: "camera" | "film" | "accessory") => setSelectedItemType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">Fotoaparáty</SelectItem>
                      <SelectItem value="film">Filmy</SelectItem>
                      <SelectItem value="accessory">Příslušenství</SelectItem>
                    </SelectContent>
                  </Select>

                  {isLoadingItems ? (
                    <div className="text-center py-8 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítám dostupné položky...
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-96 overflow-y-auto p-1">
                      {availableItemsForDialog.length > 0 ? (
                        availableItemsForDialog.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getItemIcon(selectedItemType)}
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="outline">
                                  {selectedItemType === "camera"
                                    ? `${getCameraPrice(item as TCamera, rentalDays)} Kč`
                                    : `${(item as TFilm | TAccessory).price} Kč`}
                                </Badge>
                              </div>
                              {(item as TFilm).stock !== undefined && (
                                <p className="text-xs text-muted-foreground">Dostupné: {(item as TFilm).stock} ks</p>
                              )}
                            </div>
                            <Button onClick={() => addItem(item, selectedItemType)} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Žádné dostupné položky typu {getItemTypeLabel(selectedItemType)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Položka</TableHead>
                  <TableHead className="text-center">Typ</TableHead>
                  <TableHead className="text-center">Počet</TableHead>
                  <TableHead className="text-right">Celkem</TableHead>
                  {isEditing && <TableHead className="text-center">Akce</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                        {getItemIcon(item.item_type)} {getItemTypeLabel(item.item_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                          className="w-20 mx-auto text-center"
                          disabled={item.item_type === "camera"}
                        />
                      ) : (
                        <span className="font-medium">{item.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(item.unit_price * item.quantity).toLocaleString("cs-CZ")} Kč
                    </TableCell>
                    {isEditing && (
                      <TableCell className="text-center">
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Žádné položky v rezervaci</p>
              {isEditing && <p className="text-sm">Přidejte položky pro zobrazení detailů</p>}
            </div>
          )}

          {items.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <span className="font-medium">Celkem za {rentalDays} dní:</span>
                {isEditing && <p className="text-sm text-muted-foreground">Nezapomeňte uložit změny</p>}
              </div>
              <span className="text-xl font-bold">{totalPrice.toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
