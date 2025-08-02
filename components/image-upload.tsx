"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { uploadInventoryImage, deleteInventoryImage } from "@/lib/supabase/storage"
import { toast } from "sonner"

type ImageUploadProps = {
  images: string[]
  onImagesChange: (images: string[]) => void
  itemId?: string
  bucket: "camera-images" | "inventory-images"
}

export default function ImageUpload({ images, onImagesChange, itemId, bucket }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !itemId) return

    setUploading(true)
    const newImages = [...images]

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`Soubor ${file.name} není obrázek`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Soubor ${file.name} je příliš velký (max 5MB)`)
          continue
        }

        const imageUrl = await uploadInventoryImage(file, itemId, bucket)
        if (imageUrl) {
          newImages.push(imageUrl)
          toast.success(`Obrázek ${file.name} byl nahrán`)
        } else {
          toast.error(`Nepodařilo se nahrát ${file.name}`)
        }
      }
      onImagesChange(newImages)
    } catch (error) {
      toast.error("Chyba při nahrávání obrázků")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    if (imageUrl.includes("/placeholder.svg")) {
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      return
    }

    setDeletingIndex(index)
    try {
      const success = await deleteInventoryImage(imageUrl, bucket)
      if (success) {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
        toast.success("Obrázek byl smazán")
      } else {
        toast.error("Nepodařilo se smazat obrázek")
      }
    } catch (error) {
      toast.error("Chyba při mazání obrázku")
    } finally {
      setDeletingIndex(null)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <Image
              alt={`Image ${index + 1}`}
              className="aspect-square w-full rounded-md object-cover"
              height="120"
              src={img || "/placeholder.svg"}
              width="120"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
              disabled={deletingIndex === index}
            >
              {deletingIndex === index ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
            </Button>
          </div>
        ))}
        <Label
          htmlFor="image-upload"
          className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="sr-only">Nahrát obrázky</span>
        </Label>
      </div>
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFileUpload}
        disabled={uploading || !itemId}
      />
      <p className="text-xs text-muted-foreground">{!itemId && "Nejprve uložte položku pro nahrání obrázků."}</p>
    </div>
  )
}
