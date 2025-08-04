import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DeleteInventoryItemButton } from "@/components/delete-inventory-item-button"
import { StockAdjustmentButton } from "@/components/stock-adjustment-button"
import { InventoryHistoryTab } from "@/components/inventory-history-tab"

export const dynamic = "force-dynamic"

async function FilmsTable() {
  const supabase = await createClient()

  try {
    const { data: films } = await supabase.from("films").select("*").order("name", { ascending: true })

    if (!films) return <div>Žádné filmy nenalezeny</div>

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Název</TableHead>
            <TableHead>Sklad</TableHead>
            <TableHead>Cena</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Akce</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {films.map((film) => (
            <TableRow key={film.id}>
              <TableCell className="font-medium">{film.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {film.stock} ks
                  {film.stock <= 5 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </div>
              </TableCell>
              <TableCell>{film.price ? `${film.price} Kč` : "N/A"}</TableCell>
              <TableCell>
                <Badge variant={film.stock > 0 ? "outline" : "secondary"}>
                  {film.stock > 0 ? "Skladem" : "Vyprodáno"}
                </Badge>
              </TableCell>
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
                      <Link href={`/inventory/edit/film/${film.id}`}>Upravit</Link>
                    </DropdownMenuItem>
                    <StockAdjustmentButton
                      itemType="film"
                      itemId={film.id}
                      itemName={film.name}
                      currentStock={film.stock}
                    />
                    <DeleteInventoryItemButton tableName="films" itemId={film.id} itemName={film.name} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  } catch (error) {
    console.error("Error loading films:", error)
    return <div>Chyba při načítání filmů</div>
  }
}

async function AccessoriesTable() {
  const supabase = await createClient()

  try {
    const { data: accessories } = await supabase.from("accessories").select("*").order("name", { ascending: true })

    if (!accessories) return <div>Žádné příslušenství nenalezeno</div>

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Název</TableHead>
            <TableHead>Sklad</TableHead>
            <TableHead>Cena</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Akce</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessories.map((accessory) => (
            <TableRow key={accessory.id}>
              <TableCell className="font-medium">{accessory.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {accessory.stock} ks
                  {accessory.stock <= 5 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                </div>
              </TableCell>
              <TableCell>{accessory.price ? `${accessory.price} Kč` : "N/A"}</TableCell>
              <TableCell>
                <Badge variant={accessory.stock > 0 ? "outline" : "secondary"}>
                  {accessory.stock > 0 ? "Skladem" : "Vyprodáno"}
                </Badge>
              </TableCell>
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
                      <Link href={`/inventory/edit/accessory/${accessory.id}`}>Upravit</Link>
                    </DropdownMenuItem>
                    <StockAdjustmentButton
                      itemType="accessory"
                      itemId={accessory.id}
                      itemName={accessory.name}
                      currentStock={accessory.stock}
                    />
                    <DeleteInventoryItemButton
                      tableName="accessories"
                      itemId={accessory.id}
                      itemName={accessory.name}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  } catch (error) {
    console.error("Error loading accessories:", error)
    return <div>Chyba při načítání příslušenství</div>
  }
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sklad</h1>
          <p className="text-muted-foreground">Správa filmů a příslušenství</p>
        </div>
      </div>

      <Tabs defaultValue="films" className="space-y-4">
        <TabsList>
          <TabsTrigger value="films">Filmy</TabsTrigger>
          <TabsTrigger value="accessories">Příslušenství</TabsTrigger>
          <TabsTrigger value="history">Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="films">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Filmy</CardTitle>
                <CardDescription>Správa filmů na skladě</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/inventory/edit/film/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Přidat film</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Načítání filmů...</div>}>
                <FilmsTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessories">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Příslušenství</CardTitle>
                <CardDescription>Správa příslušenství na skladě</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/inventory/edit/accessory/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Přidat příslušenství</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Načítání příslušenství...</div>}>
                <AccessoriesTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <InventoryHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
