import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CameraIcon, Plus, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DuplicateCameraButton } from "@/components/duplicate-camera-button"
import { DeleteCameraButton } from "@/components/delete-camera-button"

// Označit stránku jako dynamickou
export const dynamic = "force-dynamic"

interface CameraType {
  id: string
  name: string
  brand: string
  model: string
  year: number | null
  condition: string
  daily_rate: number
  weekly_rate: number | null
  monthly_rate: number | null
  description: string | null
  images: string[] | null
  is_available: boolean
  created_at: string
  updated_at: string
  compatible_films: Array<{
    id: string
    name: string
    brand: string
  }> | null
}

async function getCameras(): Promise<CameraType[]> {
  try {
    const supabase = await createClient()

    const { data: cameras, error } = await supabase
      .from("cameras")
      .select(`
        *,
        compatible_films:camera_films(
          film:films(
            id,
            name,
            brand
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching cameras:", error)
      return []
    }

    // Transformace dat pro kompatibilní filmy
    const transformedCameras =
      cameras?.map((camera: any) => ({
        ...camera,
        compatible_films: camera.compatible_films?.map((cf: any) => cf.film).filter(Boolean) || [],
      })) || []

    return transformedCameras
  } catch (error) {
    console.error("Error in getCameras:", error)
    return []
  }
}

function CameraCard({ camera }: { camera: CameraType }) {
  const primaryImage = camera.images && camera.images.length > 0 ? camera.images[0] : null

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
        {primaryImage ? (
          <Image
            src={primaryImage || "/placeholder.svg"}
            alt={camera.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <CameraIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={camera.is_available ? "default" : "secondary"}>
            {camera.is_available ? "Dostupný" : "Nedostupný"}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{camera.name}</CardTitle>
            <CardDescription>
              {camera.brand} {camera.model}
              {camera.year && ` (${camera.year})`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stav:</span>
            <Badge variant="outline">{camera.condition}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Denní sazba:</span>
            <span className="font-medium">{camera.daily_rate} Kč</span>
          </div>

          {camera.compatible_films && camera.compatible_films.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Kompatibilní filmy:</span>
              <div className="flex flex-wrap gap-1">
                {camera.compatible_films.slice(0, 3).map((film) => (
                  <Badge key={film.id} variant="secondary" className="text-xs">
                    {film.brand} {film.name}
                  </Badge>
                ))}
                {camera.compatible_films.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{camera.compatible_films.length - 3} dalších
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/cameras/edit/${camera.id}`}>
                <Edit className="h-4 w-4 mr-1" />
                Upravit
              </Link>
            </Button>
            <DuplicateCameraButton cameraId={camera.id} />
            <DeleteCameraButton cameraId={camera.id} cameraName={camera.name} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CamerasLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function CamerasList() {
  const cameras = await getCameras()

  if (cameras.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CameraIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Žádné fotoaparáty</h3>
          <p className="text-muted-foreground mb-4">Zatím nemáte žádné fotoaparáty v systému.</p>
          <Button asChild>
            <Link href="/cameras/new">
              <Plus className="h-4 w-4 mr-2" />
              Přidat první fotoaparát
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  )
}

export default function CamerasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fotoaparáty</h1>
          <p className="text-muted-foreground">Správa vašich polaroidových fotoaparátů</p>
        </div>
        <Button asChild>
          <Link href="/cameras/new">
            <Plus className="h-4 w-4 mr-2" />
            Nový fotoaparát
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CamerasLoading />}>
        <CamerasList />
      </Suspense>
    </div>
  )
}
