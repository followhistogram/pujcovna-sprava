import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/server"
import type { CameraWithCategory } from "@/lib/types"
import { DeleteCameraButton } from "@/components/delete-camera-button"
import { DuplicateCameraButton } from "@/components/duplicate-camera-button"
import { ImageWithFallback } from "@/components/ImageWithFallback"

export default async function CamerasPage() {
  const supabase = await createClient()

  let cameras: CameraWithCategory[] = []
  let error: string | null = null

  /* ---------- DATA FETCH ---------- */

  try {
    const { data, error: fetchError } = await supabase
      .from("cameras")
      .select(
        `
        *,
        categories (
          name
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("Error fetching cameras:", fetchError)
      error = fetchError.message || "Chyba při načítání fotoaparátů"
    } else {
      cameras = (data as CameraWithCategory[]) || []
    }
  } catch (err) {
    console.error("Unexpected error:", err)
    error = "Neočekávaná chyba při načítání dat"
  }

  const getFirstValidImage = (camera: CameraWithCategory): string | null => {
    try {
      if (camera.images) {
        const images =
          typeof camera.images === "string"
            ? JSON.parse(camera.images)
            : camera.images
        if (Array.isArray(images) && images.length > 0) {
          return (
            images.find(
              (img: string) =>
                img &&
                !img.includes("/placeholder.svg") &&
                !img.includes("undefined") &&
                img.trim() !== "",
            ) || null
          )
        }
      }
    } catch (parseError) {
      console.error("Error parsing images for camera:", camera.id, parseError)
    }
    return null
  }

  /* ---------- UI ---------- */

  const PageHeader = () => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fotoaparáty</h1>
        <p className="text-muted-foreground">Správa fotoaparátů v půjčovně</p>
      </div>
      {!error && (
        <Button asChild>
          <Link href="/cameras/edit/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Přidat fotoaparát
          </Link>
        </Button>
      )}
    </div>
  )

  /* ---------- CHYBOVÁ VĚTEV ---------- */

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />

        <Card>
          <CardHeader>
            <CardTitle>Chyba při načítání</CardTitle>
            <CardDescription>
              Nepodařilo se načíst seznam fotoaparátů.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/">Zpět na hlavní stránku</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ---------- ÚSPĚŠNÁ VĚTEV ---------- */

  return (
    <div className="space-y-6">
      <PageHeader />

      <Card>
        <CardContent>
          {cameras.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Zatím nemáte žádné fotoaparáty.
              </p>
              <Button asChild>
                <Link href="/cameras/edit/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Přidat první fotoaparát
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Obrázek</span>
                  </TableHead>
                  <TableHead>Název</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="hidden md:table-cell">Kauce</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Skladem
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Akce</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {cameras.map((camera) => {
                  const imageUrl = getFirstValidImage(camera)

                  return (
                    <TableRow key={camera.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="relative h-16 w-16">
                          <ImageWithFallback
                            src={imageUrl ?? ""}
                            alt={camera.name}
                            className="aspect-square rounded-md object-cover"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {camera.name}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            camera.status === "active" ? "outline" : "secondary"
                          }
                        >
                          {camera.status === "active" ? "Aktivní" : "Koncept"}
                        </Badge>
                      </TableCell>

                      <TableCell>{camera.categories?.name || "N/A"}</TableCell>

                      <TableCell className="hidden md:table-cell">
                        {camera.deposit
                          ? `${camera.deposit.toLocaleString("cs-CZ")} Kč`
                          : "0 Kč"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {camera.stock || 0} ks
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Akce</DropdownMenuLabel>

                            <DropdownMenuItem asChild>
                              <Link href={`/cameras/edit/${camera.id}`}>
                                Upravit
                              </Link>
                            </DropdownMenuItem>

                            <DuplicateCameraButton cameraId={camera.id} />
                            <DeleteCameraButton
                              cameraId={camera.id}
                              cameraName={camera.name}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
