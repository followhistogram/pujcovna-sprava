import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Film } from "lucide-react"

type StatsCardsProps = {
  totalDeposits: number
  filmForecast: { name: string; total_quantity: number }[]
}

export function StatsCards({ totalDeposits, filmForecast }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Konto kaucí</CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeposits.toLocaleString("cs-CZ")} Kč</div>
          <p className="text-xs text-muted-foreground">Součet aktivních kaucí</p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Potřeba filmů (příprava)</CardTitle>
          <Film className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {filmForecast.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              {filmForecast.map((film) => (
                <div key={film.name} className="text-center">
                  <div className="text-xl font-bold">{film.total_quantity} ks</div>
                  <p className="text-xs text-muted-foreground truncate">{film.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pt-2">Žádné filmy k přípravě.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
