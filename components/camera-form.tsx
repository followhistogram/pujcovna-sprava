"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2 } from "lucide-react"
import type { Camera, Category, PackageItem, Film } from "@/lib/types"
import { saveCamera } from "@/app/cameras/actions"
import { toast } from "sonner"
import ImageUpload from "@/components/image-upload"
import { MultiSelect } from "@/components/ui/multi-select"

type CameraFormProps = {
  camera: (Partial<Camera> & { compatible_films?: Film[] }) | null
  categories: Category[]
  allFilms: Film[]
}

export default function CameraForm({ camera, categories, allFilms }: CameraFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveCamera, null)
  const [pricingTiers, setPricingTiers] = useState(camera?.pricing_tiers || [])
  const [serialNumbers, setSerialNumbers] = useState(
    camera?.serial_numbers?.map((sn) => ({
      ...sn,
      status: sn.status || "active",
    })) || [],
  )
  const [packageContents, setPackageContents] = useState<PackageItem[]>(
    (camera?.package_contents as PackageItem[]) || [],
  )
  const [images, setImages] = useState<string[]>(camera?.images || [])
  const [selectedFilmIds, setSelectedFilmIds] = useState<string[]>(
    camera?.compatible_films?.map((film) => film.id) || [],
  )

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      if (state.isNewCamera && state.cameraId) {
        router.push(`/cameras/edit/${state.cameraId}`)
      }
    } else if (state?.success === false) {
      toast.error(state.message)
      if (state.errors?.compatible_film_ids) {
        toast.error(state.errors.compatible_film_ids[0])
      }
    }
  }, [state, router])

  const addPricingTier = () => setPricingTiers([...pricingTiers, { min_days: 1, price_per_day: 0 }])
  const removePricingTier = (index: number) => setPricingTiers(pricingTiers.filter((_, i) => i !== index))
  const updatePricingTier = (index: number, field: string, value: string | number) => {
    const updated = [...pricingTiers]
    updated[index] = { ...updated[index], [field]: value }
    setPricingTiers(updated)
  }

  const addSerialNumber = () => setSerialNumbers([...serialNumbers, { serial_number: "", status: "active" }])
  const removeSerialNumber = (index: number) => setSerialNumbers(serialNumbers.filter((_, i) => i !== index))
  const updateSerialNumber = (index: number, field: string, value: string) => {
    const updated = [...serialNumbers]
    updated[index] = { ...updated[index], [field]: value }
    setSerialNumbers(updated)
  }

  const addPackageItem = () => setPackageContents([...packageContents, { name: "" }])
  const removePackageItem = (index: number) => setPackageContents(packageContents.filter((_, i) => i !== index))
  const updatePackageItem = (index: number, value: string) => {
    const updated = [...packageContents]
    updated[index] = { ...updated[index], name: value }
    setPackageContents(updated)
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={camera?.id} />
      <input type="hidden" name="pricing_tiers" value={JSON.stringify(pricingTiers)} />
      <input type="hidden" name="serial_numbers" value={JSON.stringify(serialNumbers)} />
      <input type="hidden" name="package_contents" value={JSON.stringify(packageContents)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="compatible_film_ids" value={JSON.stringify(selectedFilmIds)} />

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Detaily produktu</CardTitle>
              <CardDescription>Základní informace o fotoaparátu.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Název</Label>
                <Input id="name" name="name" type="text" className="w-full" defaultValue={camera?.name} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Popis produktu</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={camera?.description || ""}
                  className="min-h-32"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="short_description">Krátký popis (zobrazen ve výpisu)</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  defaultValue={camera?.short_description || ""}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kompatibilní filmy</CardTitle>
              <CardDescription>Vyberte všechny filmy, které jsou s tímto fotoaparátem kompatibilní.</CardDescription>
            </CardHeader>
            <CardContent>
              <MultiSelect
                options={allFilms.map((film) => ({ value: film.id, label: film.name }))}
                selected={selectedFilmIds}
                onChange={setSelectedFilmIds}
                placeholder="Vyberte filmy..."
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ceník</CardTitle>
              <CardDescription>Ceny jsou vkládány včetně 21% DPH.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Min. počet dní</TableHead>
                    <TableHead>Cena / den</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingTiers.map((tier, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          value={tier.min_days}
                          onChange={(e) => updatePricingTier(index, "min_days", Number.parseInt(e.target.value) || 1)}
                          placeholder="např. 1"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={tier.price_per_day}
                          onChange={(e) =>
                            updatePricingTier(index, "price_per_day", Number.parseInt(e.target.value) || 0)
                          }
                          placeholder="Cena v Kč"
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" size="icon" variant="ghost" onClick={() => removePricingTier(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
              <Button type="button" size="sm" variant="ghost" className="gap-1" onClick={addPricingTier}>
                <PlusCircle className="h-3.5 w-3.5" />
                Přidat cenovou hladinu
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Součást balení</CardTitle>
              <CardDescription>Položky, které jsou součástí výpůjčky.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {packageContents.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) => updatePackageItem(index, e.target.value)}
                      placeholder="např. Baterie, Návod, Popruh"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removePackageItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1 justify-start"
                  onClick={addPackageItem}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Přidat položku
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Status a kategorie</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={camera?.status || "draft"}>
                  <SelectTrigger id="status" aria-label="Vybrat status">
                    <SelectValue placeholder="Vybrat status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="active">Aktivní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="category">Kategorie</Label>
                <Select name="category_id" defaultValue={camera?.category_id || ""}>
                  <SelectTrigger id="category" aria-label="Vybrat kategorii">
                    <SelectValue placeholder="Vybrat kategorii" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sklad a Kauce</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="stock">Počet kusů k zapůjčení</Label>
                <Input id="stock" name="stock" type="number" defaultValue={camera?.stock || 0} min="0" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="deposit">Vratná kauce (0% DPH)</Label>
                <Input id="deposit" name="deposit" type="number" defaultValue={camera?.deposit || 0} min="0" />
              </div>
              <div className="grid gap-3">
                <Label>Výrobní čísla</Label>
                {serialNumbers.map((sn, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      value={sn.serial_number}
                      onChange={(e) => updateSerialNumber(index, "serial_number", e.target.value)}
                      placeholder="Výrobní číslo"
                    />
                    <div className="flex items-center gap-1">
                      <Select value={sn.status} onValueChange={(value) => updateSerialNumber(index, "status", value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Aktivní</SelectItem>
                          <SelectItem value="serviced">Servisováno</SelectItem>
                          <SelectItem value="retired">Vyřazeno</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeSerialNumber(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1 justify-start"
                  onClick={addSerialNumber}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Přidat výrobní číslo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Obrázky produktu</CardTitle>
              <CardDescription>Přidejte fotografie pro prezentaci.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onImagesChange={setImages} itemId={camera?.id} bucket="camera-images" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" type="button" asChild>
          <Link href="/cameras">Zrušit</Link>
        </Button>
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending ? "Ukládání..." : "Uložit produkt"}
        </Button>
      </div>
    </form>
  )
}
