import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Camera, Edit } from "lucide-react"
import { getCameras } from "@/lib/data"

export const dynamic = "force-dynamic"

function CamerasSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function CamerasContent() {
  const cameras = await getCameras()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fotoaparáty</h1>
          <p className="text-muted-foreground">Správa fotoaparátů v půjčovně</p>
        </div>
        <Button asChild>
          <Link href="/cameras/new">
            <Plus className="mr-2 h-4 w-4" />
            Přidat fotoaparát
          </Link>
        </Button>
      </div>

      {cameras.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádné fotoaparáty</h3>
            <p className="text-muted-foreground text-center mb-4">
              Zatím nemáte žádné fotoaparáty. Přidejte první fotoaparát pro začátek.
            </p>
            <Button asChild>
              <Link href="/cameras/new">
                <Plus className="mr-2 h-4 w-4" />
                Přidat fotoaparát
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cameras.map((camera) => (
            <Card key={camera.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{camera.name}</CardTitle>
                    <CardDescription>
                      {camera.brand} {camera.model}
                    </CardDescription>
                  </div>
                  <Badge variant={camera.is_available ? "default" : "secondary"}>
                    {camera.is_available ? "Dostupný" : "Nedostupný"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {camera.image_url && (
                  <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    <img
                      src={camera.image_url || "/placeholder.svg"}
                      alt={camera.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Denní sazba:</span>
                    <span className="font-medium">{camera.daily_rate} Kč</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kauce:</span>
                    <span className="font-medium">{camera.deposit} Kč</span>
                  </div>
                  {camera.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{camera.description}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/cameras/edit/${camera.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Upravit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CamerasPage() {
  return (
    <Suspense fallback={<CamerasSkeleton />}>
      <CamerasContent />
    </Suspense>
  )
}
