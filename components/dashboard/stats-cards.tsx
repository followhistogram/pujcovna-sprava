import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, AlertTriangle, Package } from "lucide-react"

interface StatsCardsProps {
  totalDeposits: number
  filmForecast: Array<{
    film_name: string
    total_needed: number
    current_stock: number
    shortage: number
  }>
}

export function StatsCards({ totalDeposits, filmForecast }: StatsCardsProps) {
  const lowStockFilms = filmForecast.filter((film) => film.shortage > 0)
  const totalShortage = lowStockFilms.reduce((sum, film) => sum + film.shortage, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Celkové kauce</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeposits.toLocaleString("cs-CZ")} Kč</div>
          <p className="text-xs text-muted-foreground">Aktuálně držené kauce</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktivní rezervace</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Právě probíhající výpůjčky</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nedostatek filmů</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalShortage}</div>
          <p className="text-xs text-muted-foreground">
            {lowStockFilms.length > 0 ? `${lowStockFilms.length} typů filmů` : "Vše v pořádku"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dostupné kamery</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Připravené k výpůjčce</p>
        </CardContent>
      </Card>
    </div>
  )
}
