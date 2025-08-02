import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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

export default async function CamerasPage() {
  const supabase = createClient()
  const { data: cameras, error } = await supabase
    .from("cameras")
    .select(`*, categories (name)`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cameras:", error)
  }

  const camerasData = (cameras as CameraWithCategory[]) || []

  const getFirstValidImage = (camera: any) => {
    try {
      if (camera.images) {
        const images = typeof camera.images === "string" ? JSON.parse(camera.images) : camera.images
        if (Array.isArray(images) && images.length > 0) {
          // Find first valid image (not placeholder, not empty)
          const validImage = images.find(
            (img) => img && !img.includes("/placeholder.svg") && !img.includes("undefined") && img.trim() !== "",
          )
          return validImage || null
        }
      }
    } catch (error) {
      console.error("Error parsing images for camera:", camera.id, error)
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Fotoaparáty</CardTitle>
          <CardDescription>Správa a evidence všech fotoaparátů v systému.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/cameras/edit/new">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Přidat fotoaparát</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
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
              <TableHead className="hidden md:table-cell">Skladem</TableHead>
              <TableHead>
                <span className="sr-only">Akce</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camerasData.map((camera) => {
              const imageUrl = getFirstValidImage(camera)

              return (
                <TableRow key={camera.id}>
                  <TableCell className="hidden sm:table-cell">
                    {imageUrl ? (
                      <Image
                        alt={camera.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={imageUrl || "/placeholder.svg"}
                        width="64"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.parentElement?.querySelector(".fallback-icon")?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-16 h-16 bg-muted rounded-md flex items-center justify-center fallback-icon ${
                        imageUrl ? "hidden" : ""
                      }`}
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{camera.name}</TableCell>
                  <TableCell>
                    <Badge variant={camera.status === "active" ? "outline" : "secondary"}>
                      {camera.status === "active" ? "Aktivní" : "Koncept"}
                    </Badge>
                  </TableCell>
                  <TableCell>{camera.categories?.name || "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell">{camera.deposit.toLocaleString("cs-CZ")} Kč</TableCell>
                  <TableCell className="hidden md:table-cell">{camera.stock} ks</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akce</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/cameras/edit/${camera.id}`}>Upravit</Link>
                        </DropdownMenuItem>
                        <DuplicateCameraButton cameraId={camera.id} />
                        <DeleteCameraButton cameraId={camera.id} cameraName={camera.name} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
