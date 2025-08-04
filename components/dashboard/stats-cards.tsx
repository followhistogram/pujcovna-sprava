import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, TrendingUp, Package } from "lucide-react"

interface StatsCardsProps {
  totalDeposits: number
  filmForecast: any[]
}

export function StatsCards({ totalDeposits, filmForecast }: StatsCardsProps) {
  const lowStockFilms = filmForecast.filter((film) => film.stock <= 5).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Celkové kauce</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeposits.toLocaleString("cs-CZ")} Kč</div>
          <p className="text-xs text-muted-foreground">Aktivní kauce v systému</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktivní rezervace</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">Aktuálně probíhající půjčení</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nízký stav filmů</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStockFilms}</div>
          <p className="text-xs text-muted-foreground">Filmů s nízkým stavem</p>
        </CardContent>
      </Card>
      
    </div>
  )
}
