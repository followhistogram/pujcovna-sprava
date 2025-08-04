"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from "lucide-react"
import Image from "next/image"

type ImageUrlManagerProps = {
  images: string[]
  onImagesChange: (images: string[]) => void
}

export default function ImageUrlManager({ images, onImagesChange }: ImageUrlManagerProps) {
  const handleAddImage = () => {
    onImagesChange([...images, ""])
  }

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    onImagesChange(newImages)
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative group aspect-square">
            <Image
              alt={`Obrázek ${index + 1}`}
              className="aspect-square w-full rounded-md object-cover"
              height="120"
              src={img || "/placeholder.svg"}
              width="120"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <Label>URL obrázků</Label>
        {images.map((url, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveImage(index)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Odstranit obrázek</span>
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="ghost" className="gap-1 justify-start" onClick={handleAddImage}>
        <PlusCircle className="h-3.5 w-3.5" />
        Přidat URL obrázku
      </Button>
    </div>
  )
}
