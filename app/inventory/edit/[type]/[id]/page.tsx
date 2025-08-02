import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { InventoryItem } from "@/lib/types"
import InventoryItemForm from "@/components/inventory-item-form"

type PageProps = {
  params: {
    type: "film" | "accessory"
    id: string
  }
}

export default async function InventoryEditPage({ params }: PageProps) {
  const { type, id } = params
  const isNew = id === "new"
  const supabase = createClient()

  if (type !== "film" && type !== "accessory") {
    notFound()
  }

  const tableName = type === "film" ? "films" : "accessories"
  let item: Partial<InventoryItem> | null = null

  if (!isNew) {
    const { data } = await supabase.from(tableName).select("*").eq("id", id).single()
    if (!data) {
      notFound()
    }
    item = data
  }

  const pageTitle = isNew
    ? `Nový ${type === "film" ? "film" : "doplněk"}`
    : (item as InventoryItem)?.name || "Upravit položku"

  return (
    <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" asChild>
          <Link href="/inventory">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Zpět</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {pageTitle}
        </h1>
      </div>
      <InventoryItemForm item={item} type={type} />
    </div>
  )
}
