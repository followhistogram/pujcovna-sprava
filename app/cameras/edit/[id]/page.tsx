import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import CameraForm from "@/components/camera-form"
import { notFound } from "next/navigation"
import type { Film } from "@/lib/types"

export default async function CameraEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const isNew = params.id === "new"

  const categoriesPromise = supabase.from("categories").select("id, name")
  const filmsPromise = supabase.from("films").select("id, name")

  let cameraData = null
  if (!isNew) {
    const { data } = await supabase
      .from("cameras")
      .select(
        `
        *,
        pricing_tiers(*),
        serial_numbers(*),
        camera_compatible_films ( films ( id, name ) )
      `,
      )
      .eq("id", params.id)
      .single()

    if (data) {
      const compatible_films = data.camera_compatible_films.map((join_entry: any) => join_entry.films)

      cameraData = {
        ...data,
        compatible_films,
        package_contents: data.package_contents
          ? typeof data.package_contents === "string"
            ? JSON.parse(data.package_contents)
            : data.package_contents
          : [],
        images: data.images ? (typeof data.images === "string" ? JSON.parse(data.images) : data.images) : [],
      }
    }

    if (!cameraData) {
      notFound()
    }
  }

  const [{ data: categories }, { data: allFilms }] = await Promise.all([categoriesPromise, filmsPromise])

  return (
    <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" asChild>
          <Link href="/cameras">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Zpět</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {isNew ? "Nový fotoaparát" : cameraData?.name}
        </h1>
      </div>
      <CameraForm camera={cameraData} categories={categories || []} allFilms={(allFilms as Film[]) || []} />
    </div>
  )
}
