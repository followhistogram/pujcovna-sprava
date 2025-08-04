"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Camera, Film, ReservationItem, Accessory } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

type ReservationItemsManagerProps = {
  items: ReservationItem[]
  setItems: (items: ReservationItem[]) => void
  availableCameras?: Camera[]
  availableFilms?: Film[]
  availableAccessories?: Accessory[]
  rentalDays?: number
}

export function ReservationItemsManager({
  items = [], // Default to empty array to prevent undefined errors
  setItems,
  availableCameras = [],
  availableFilms = [],
  availableAccessories = [],
  rentalDays = 1,
}: ReservationItemsManagerProps) {
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [showFilmModal, setShowFilmModal] = useState(false)
  const [showAccessoryModal, setShowAccessoryModal] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const getCameraPrice = (camera: Camera, days: number): number => {
    if (!camera.pricing_tiers || camera.pricing_tiers.length === 0) {
      return 0
    }

    const sortedTiers = [...camera.pricing_tiers].sort((a, b) => b.min_days - a.min_days)
    const applicableTier = sortedTiers.find((tier) => days >= tier.min_days)

    const dailyPrice = applicableTier ? applicableTier.price_per_day : 0
    return dailyPrice * days
  }

  const addCamera = (cameraId: string) => {
    const camera = availableCameras.find((c) => c.id === cameraId)
    if (!camera) return

    const price = getCameraPrice(camera, rentalDays)

    const newItem: ReservationItem = {
      id: `temp-${Date.now()}`,
      reservation_id: "",
      item_id: camera.id,
      item_type: "camera",
      name: camera.name,
      quantity: 1,
      unit_price: price,
      deposit: camera.deposit,
    }
    setItems([...items, newItem])
    setShowCameraModal(false)
  }

  const addFilm = (filmId: string) => {
    const film = availableFilms.find((f) => f.id === filmId)
    if (!film) return

    const existingFilm = items.find((i) => i.item_id === filmId && i.item_type === "film")
    if (existingFilm) {
      updateItemQuantity(items.indexOf(existingFilm), (existingFilm.quantity || 0) + 1)
    } else {
      const newItem: ReservationItem = {
        id: `temp-${Date.now()}`,
        reservation_id: "",
        item_id: film.id,
        item_type: "film",
        name: film.name,
        quantity: 1,
        unit_price: film.price || 0,
        deposit: 0,
      }
      setItems([...items, newItem])
    }
    setShowFilmModal(false)
  }

  const addAccessory = (accessoryId: string) => {
    const accessory = availableAccessories.find((a) => a.id === accessoryId)
    if (!accessory) return

    const existingAccessory = items.find((i) => i.item_id === accessoryId && i.item_type === "accessory")
    if (existingAccessory) {
      updateItemQuantity(items.indexOf(existingAccessory), (existingAccessory.quantity || 0) + 1)
    } else {
      const newItem: ReservationItem = {
        id: `temp-${Date.now()}`,
        reservation_id: "",
        item_id: accessory.id,
        item_type: "accessory",
        name: accessory.name,
        quantity: 1,
        unit_price: accessory.price || 0,
        deposit: 0,
      }
      setItems([...items, newItem])
    }
    setShowAccessoryModal(false)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = Math.max(1, quantity)
    setItems(newItems)
  }

  const toggleItemCheck = (itemKey: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey)
    } else {
      newChecked.add(itemKey)
    }
    setCheckedItems(newChecked)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Položky</CardTitle>
        <CardDescription>Spravujte položky v rezervaci a označte připravené.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">✓</TableHead>
              <TableHead>Název</TableHead>
              <TableHead className="w-[120px]">Množství</TableHead>
              <TableHead className="w-[100px] text-right">Cena</TableHead>
              <TableHead className="w-[100px] text-right">Kauce</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item, index) => {
                const itemKey = `${item.item_type}-${item.item_id}-${index}`
                const isChecked = checkedItems.has(itemKey)
                const camera = item.item_type === "camera" ? availableCameras.find((c) => c.id === item.item_id) : null
                const packageContents = camera?.package_contents
                  ? typeof camera.package_contents === "string"
                    ? JSON.parse(camera.package_contents)
                    : camera.package_contents
                  : []

                return (
                  <TableRow key={index} className={isChecked ? "bg-green-50 dark:bg-green-950/20" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItemCheck(itemKey)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className={isChecked ? "line-through text-muted-foreground" : ""}>{item.name}</div>
                        {item.item_type === "film" && (
                          <div className="text-xs text-muted-foreground">
                            {availableFilms.find((f) => f.id === item.item_id)?.shots_per_pack} snímků/balení
                          </div>
                        )}
                        {item.item_type === "camera" &&
                          Array.isArray(packageContents) &&
                          packageContents.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <div className="font-medium">Součást balení:</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {packageContents.map((pkg: any, pkgIndex: number) => (
                                  <span
                                    key={pkgIndex}
                                    className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                                  >
                                    {pkg.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) => updateItemQuantity(index, Number.parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full"
                        disabled={item.item_type === "camera"}
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {((item.unit_price || 0) * (item.quantity || 1)).toLocaleString("cs-CZ")} Kč
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {((item.deposit || 0) * (item.quantity || 1)).toLocaleString("cs-CZ")} Kč
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Žádné položky.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Progress indicator */}
        {items && items.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Připraveno:</span>
              <span className="font-medium">
                {checkedItems.size} z {items.length} položek
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${items.length > 0 ? (checkedItems.size / items.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      <CardContent className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <Dialog open={showCameraModal} onOpenChange={setShowCameraModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              Přidat fotoaparát
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vyberte fotoaparát</DialogTitle>
              <DialogDescription>
                Zobrazují se pouze dostupné fotoaparáty pro vybraný termín. Cena je vypočítána na {rentalDays}{" "}
                {rentalDays === 1 ? "den" : rentalDays < 5 ? "dny" : "dnů"}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {availableCameras.map((camera) => {
                const price = getCameraPrice(camera, rentalDays)
                return (
                  <Button
                    key={camera.id}
                    variant="ghost"
                    className="justify-between h-auto p-4 bg-transparent"
                    onClick={() => addCamera(camera.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{camera.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Kauce: {camera.deposit.toLocaleString("cs-CZ")} Kč
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{price.toLocaleString("cs-CZ")} Kč</div>
                    </div>
                  </Button>
                )
              })}
              {availableCameras.length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                  Pro zadaný termín nejsou dostupné žádné fotoaparáty.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showFilmModal} onOpenChange={setShowFilmModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              Přidat film
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vyberte film</DialogTitle>
              <DialogDescription>Vyberte film pro přidání do rezervace.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {availableFilms.map((film) => (
                <Button
                  key={film.id}
                  variant="ghost"
                  className="justify-between h-auto p-4 bg-transparent"
                  onClick={() => addFilm(film.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{film.name}</div>
                    <div className="text-sm text-muted-foreground">{film.shots_per_pack} snímků/balení</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(film.price || 0).toLocaleString("cs-CZ")} Kč</div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAccessoryModal} onOpenChange={setShowAccessoryModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              Přidat příslušenství
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vyberte příslušenství</DialogTitle>
              <DialogDescription>Vyberte příslušenství pro přidání do rezervace.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {availableAccessories.map((accessory) => (
                <Button
                  key={accessory.id}
                  variant="ghost"
                  className="justify-between h-auto p-4 bg-transparent"
                  onClick={() => addAccessory(accessory.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{accessory.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(accessory.price || 0).toLocaleString("cs-CZ")} Kč</div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
