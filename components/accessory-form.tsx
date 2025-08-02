"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Accessory } from "@/lib/types"
import ImageUpload from "./image-upload"

type AccessoryFormProps = {
  accessory: Partial<Accessory> | null
  images: string[]
  onImagesChange: (images: string[]) => void
}

export default function AccessoryForm({ accessory, images, onImagesChange }: AccessoryFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Detaily doplňku</CardTitle>
            <CardDescription>Základní informace o skladové položce.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Název</Label>
              <Input id="name" name="name" type="text" className="w-full" defaultValue={accessory?.name} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={accessory?.description || ""}
                className="min-h-24"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Obrázky</CardTitle>
          </CardHeader>
          <CardContent>
            {accessory?.id ? (
              <ImageUpload
                images={images}
                onImagesChange={onImagesChange}
                itemId={accessory.id}
                bucket="inventory-images"
              />
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center border-2 border-dashed rounded-lg">
                Nejprve uložte příslušenství pro možnost nahrání obrázků.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Cena a sklad</CardTitle>
            <CardDescription>Ceny jsou vkládány v Kč včetně 21% DPH.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="price">Prodejní cena</Label>
              <Input id="price" name="price" type="number" defaultValue={accessory?.price || ""} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="purchase_price">Nákupní cena</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                defaultValue={accessory?.purchase_price || ""}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="stock">Počet kusů skladem</Label>
              <Input id="stock" name="stock" type="number" defaultValue={accessory?.stock || 0} required />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
