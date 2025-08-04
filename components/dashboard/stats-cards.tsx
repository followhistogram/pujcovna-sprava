import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDashboardStats } from "@/lib/data"
import { Camera, Users, CreditCard, FileWarningIcon as PackageWarning } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export async function StatsCards() {
  const { totalCameras, activeReservations, monthlyRevenue, lowStockItems } = await fetchDashboardStats()

  const stats = [
    {
      title: "Měsíční tržby",
      value: formatCurrency(monthlyRevenue),
      icon: CreditCard,
      description: "Tržby z dokončených rezervací",
    },
    {
      title: "Aktivní rezervace",
      value: activeReservations,
      icon: Users,
      description: "Počet právě probíhajících výpůjček",
    },
    {
      title: "Fotoaparáty v systému",
      value: totalCameras,
      icon: Camera,
      description: "Celkový počet dostupných fotoaparátů",
    },
    {
      title: "Nízké zásoby",
      value: lowStockItems,
      icon: PackageWarning,
      description: "Položky, které je třeba doobjednat",
    },
  ]

  return (
    <>
      {stats.map(({ title, value, icon: Icon, description }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
