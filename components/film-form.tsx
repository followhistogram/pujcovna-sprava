"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Film } from "@/lib/types"
import ImageUrlManager from "./image-url-manager"

type FilmFormProps = {
  film: Partial<Film> | null
  images: string[]
  onImagesChange: (images: string[]) => void
}

export default function FilmForm({ film, images, onImagesChange }: FilmFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Detaily filmu</CardTitle>
            <CardDescription>Základní informace o skladové položce.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Název</Label>
              <Input id="name" name="name" type="text" className="w-full" defaultValue={film?.name} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={film?.description || ""}
                className="min-h-24"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Obrázky</CardTitle>
            <CardDescription>Přidejte URL adresy obrázků.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUrlManager images={images} onImagesChange={onImagesChange} />
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
              <Label htmlFor="shots_per_pack">Počet snímků na balení</Label>
              <Input
                id="shots_per_pack"
                name="shots_per_pack"
                type="number"
                defaultValue={film?.shots_per_pack || ""}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="price">Prodejní cena za balení</Label>
              <Input id="price" name="price" type="number" defaultValue={film?.price || ""} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="purchase_price">Nákupní cena za balení</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                defaultValue={film?.purchase_price || ""}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="stock">Počet kusů skladem</Label>
              <Input id="stock" name="stock" type="number" defaultValue={film?.stock || 0} required />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
