import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, PlusCircle, MoreHorizontal, TrendingUp, TrendingDown, History } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/server"
import type { Film, Accessory } from "@/lib/types"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteInventoryItemButton } from "@/components/delete-inventory-item-button"
import { StockAdjustmentButton } from "@/components/stock-adjustment-button"
import { InventoryHistoryTab } from "@/components/inventory-history-tab"

// Označit stránku jako dynamickou
export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const supabase = await createClient()

  let films: Film[] = []
  let accessories: Accessory[] = []
  let recentLogs: any[] = []

  try {
    const { data: filmsData } = await supabase.from("films").select("*")
    const { data: accessoriesData } = await supabase.from("accessories").select("*")

    films = (filmsData as Film[]) || []
    accessories = (accessoriesData as Accessory[]) || []

    // Get recent stock changes for dashboard
    const { data: recentLogsData } = await supabase
      .from("inventory_logs")
      .select("*")
      .eq("change_type", "stock_change")
      .order("created_at", { ascending: false })
      .limit(5)

    recentLogs = recentLogsData || []
  } catch (error) {
    console.error("Error fetching inventory data:", error)
  }

  const lowStockFilms = films.filter((f) => f.stock < f.low_stock_threshold)

  return (
    <div className="grid gap-4">
      {lowStockFilms.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nízký stav zásob!</AlertTitle>
          <AlertDescription>
            U {lowStockFilms.length} typů filmů dochází zásoby. Doplňte je co nejdříve. (
            {lowStockFilms.map((f) => f.name).join(", ")})
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Changes Widget */}
      {recentLogs && recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Nedávné změny skladu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs.slice(0, 3).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {log.change_amount > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{log.item_name}</span>
                    <span className="text-muted-foreground">
                      {log.old_value} → {log.new_value} ks
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString("cs-CZ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Skladové hospodářství</CardTitle>
            <CardDescription>Přehled filmů a příslušenství s historií změn.</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="ml-auto gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                Přidat položku
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/inventory/edit/film/new">Přidat film</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/inventory/edit/accessory/new">Přidat příslušenství</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="films">
            <TabsList>
              <TabsTrigger value="films">Filmy</TabsTrigger>
              <TabsTrigger value="accessories">Příslušenství</TabsTrigger>
              <TabsTrigger value="history">Historie změn</TabsTrigger>
            </TabsList>

            <TabsContent value="films" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Název filmu</TableHead>
                    <TableHead>Skladem</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead>Snímků/balení</TableHead>
                    <TableHead>
                      <span className="sr-only">Akce</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {films.map((film) => (
                    <TableRow
                      key={film.id}
                      className={film.stock < film.low_stock_threshold ? "bg-destructive/10" : ""}
                    >
                      <TableCell className="font-medium">
                        <div>
                          {film.name}
                          {film.stock < film.low_stock_threshold && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Nízký stav
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{film.stock} ks</TableCell>
                      <TableCell>{film.price ? `${film.price.toLocaleString("cs-CZ")} Kč` : "—"}</TableCell>
                      <TableCell>{film.shots_per_pack ? `${film.shots_per_pack} ks` : "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Otevřít menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/inventory/edit/film/${film.id}`}>Upravit</Link>
                            </DropdownMenuItem>
                            <StockAdjustmentButton
                              itemId={film.id}
                              itemName={film.name}
                              itemType="film"
                              currentStock={film.stock}
                            />
                            <DeleteInventoryItemButton
                              itemId={film.id}
                              itemName={film.name}
                              itemType="film"
                              tableName="films"
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {films.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Žádné filmy nenalezeny.{" "}
                        <Link href="/inventory/edit/film/new" className="text-primary hover:underline">
                          Přidat první film
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="accessories" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Název</TableHead>
                    <TableHead>Skladem</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead>Nákupní cena</TableHead>
                    <TableHead>
                      <span className="sr-only">Akce</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessories.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-medium">{acc.name}</TableCell>
                      <TableCell>{acc.stock} ks</TableCell>
                      <TableCell>{acc.price ? `${acc.price.toLocaleString("cs-CZ")} Kč` : "—"}</TableCell>
                      <TableCell>
                        {acc.purchase_price ? `${acc.purchase_price.toLocaleString("cs-CZ")} Kč` : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Otevřít menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/inventory/edit/accessory/${acc.id}`}>Upravit</Link>
                            </DropdownMenuItem>
                            <StockAdjustmentButton
                              itemId={acc.id}
                              itemName={acc.name}
                              itemType="accessory"
                              currentStock={acc.stock}
                            />
                            <DeleteInventoryItemButton
                              itemId={acc.id}
                              itemName={acc.name}
                              itemType="accessory"
                              tableName="accessories"
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accessories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Žádné příslušenství nenalezeno.{" "}
                        <Link href="/inventory/edit/accessory/new" className="text-primary hover:underline">
                          Přidat první příslušenství
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <InventoryHistoryTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
