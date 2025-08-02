"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { saveInventoryItem } from "@/app/inventory/actions"
import type { InventoryItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import FilmForm from "./film-form"
import AccessoryForm from "./accessory-form"

type InventoryItemFormProps = {
  item: Partial<InventoryItem> | null
  type: "film" | "accessory"
}

export default function InventoryItemForm({ item, type }: InventoryItemFormProps) {
  const router = useRouter()
  const saveAction = saveInventoryItem.bind(null, type)
  const [state, formAction, isPending] = useActionState(saveAction, null)
  const [images, setImages] = useState<string[]>((item?.images && Array.isArray(item.images) ? item.images : []) || [])

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      if (state.isNew && state.itemId) {
        router.push(`/inventory/edit/${type}/${state.itemId}`)
      }
    } else if (state?.success === false) {
      toast.error(state.message)
    }
  }, [state, router, type])

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={item?.id} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {type === "film" ? (
        <FilmForm film={item} images={images} onImagesChange={setImages} />
      ) : (
        <AccessoryForm accessory={item} images={images} onImagesChange={setImages} />
      )}

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" type="button" asChild>
          <Link href="/inventory">Zrušit</Link>
        </Button>
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending ? "Ukládání..." : "Uložit položku"}
        </Button>
      </div>
    </form>
  )
}
