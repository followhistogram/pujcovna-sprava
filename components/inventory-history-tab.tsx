"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getInventoryLogs } from "@/app/inventory/actions"
import { TrendingUp, TrendingDown, Plus, Edit, Trash2, DollarSign, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

type InventoryLog = {
  id: string
  created_at: string
  item_type: "film" | "accessory"
  item_id: string
  item_name: string
  change_type: "created" | "updated" | "deleted" | "stock_change" | "price_change"
  field_changed?: string
  old_value?: string
  new_value?: string
  change_amount?: number
  notes?: string
}

export function InventoryHistoryTab() {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await getInventoryLogs(undefined, undefined, 100)
      if (result.success) {
        setLogs(result.data)
      }
    } catch (error) {
      console.error("Error loading logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getChangeIcon = (changeType: string, changeAmount?: number) => {
    switch (changeType) {
      case "created":
        return <Plus className="h-4 w-4 text-green-500" />
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "stock_change":
        return changeAmount && changeAmount > 0 ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )
      case "price_change":
        return <DollarSign className="h-4 w-4 text-blue-500" />
      default:
        return <Edit className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeTypeLabel = (changeType: string) => {
    const labels = {
      created: "Vytvořeno",
      updated: "Upraveno",
      deleted: "Smazáno",
      stock_change: "Změna skladu",
      price_change: "Změna ceny",
    }
    return labels[changeType as keyof typeof labels] || changeType
  }

  const getChangeDescription = (log: InventoryLog) => {
    switch (log.change_type) {
      case "stock_change":
        return `${log.old_value} → ${log.new_value} ks (${log.change_amount > 0 ? "+" : ""}${log.change_amount})`
      case "price_change":
        const field = log.field_changed === "purchase_price" ? "Nákupní" : "Prodejní"
        return `${field}: ${log.old_value ? `${Number.parseInt(log.old_value).toLocaleString("cs-CZ")} Kč` : "—"} → ${log.new_value ? `${Number.parseInt(log.new_value).toLocaleString("cs-CZ")} Kč` : "—"}`
      case "updated":
        if (log.field_changed === "name") {
          return `Název: "${log.old_value}" → "${log.new_value}"`
        }
        return log.notes || "Aktualizace položky"
      case "created":
        return "Nová položka přidána do skladu"
      case "deleted":
        return log.notes || "Položka odstraněna ze skladu"
      default:
        return log.notes || "Změna položky"
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.change_type === filter
    const matchesSearch =
      search === "" ||
      log.item_name.toLowerCase().includes(search.toLowerCase()) ||
      log.notes?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Group logs by date
  const groupedLogs = filteredLogs.reduce(
    (groups, log) => {
      const date = new Date(log.created_at).toLocaleDateString("cs-CZ")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(log)
      return groups
    },
    {} as Record<string, InventoryLog[]>,
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Načítání historie...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historie změn skladu
          </CardTitle>
          <CardDescription>Kompletní přehled všech změn v posledním roce</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat podle názvu nebo poznámky..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Typ změny" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny změny</SelectItem>
                <SelectItem value="stock_change">Změny skladu</SelectItem>
                <SelectItem value="price_change">Změny cen</SelectItem>
                <SelectItem value="created">Nové položky</SelectItem>
                <SelectItem value="updated">Úpravy</SelectItem>
                <SelectItem value="deleted">Smazané</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter((l) => l.change_type === "stock_change" && l.change_amount > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Navýšení</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((l) => l.change_type === "stock_change" && l.change_amount < 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Snížení</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter((l) => l.change_type === "price_change").length}
              </div>
              <div className="text-sm text-muted-foreground">Změny cen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {logs.filter((l) => l.change_type === "created").length}
              </div>
              <div className="text-sm text-muted-foreground">Nové položky</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {Object.entries(groupedLogs).map(([date, dayLogs]) => (
          <Card key={date}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{date}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="mt-0.5">{getChangeIcon(log.change_type, log.change_amount)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.item_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.item_type === "film" ? "Film" : "Příslušenství"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getChangeTypeLabel(log.change_type)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{getChangeDescription(log)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString("cs-CZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              {search || filter !== "all"
                ? "Žádné záznamy neodpovídají vašemu filtru."
                : "Zatím žádné změny v historii."}
            </div>
            {(search || filter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setFilter("all")
                }}
                className="mt-2"
              >
                Vymazat filtry
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
