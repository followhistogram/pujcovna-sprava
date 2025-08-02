import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { ReservationsTable } from "@/components/reservations-table"

export default async function ReservationsPage() {
  const supabase = createClient()
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(`
      *,
      items:reservation_items(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reservations:", error)
  }

  const reservationsData = (reservations as any[]) || []

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Vše</TabsTrigger>
          <TabsTrigger value="confirmed">Potvrzené</TabsTrigger>
          <TabsTrigger value="active">Aktivní</TabsTrigger>
          <TabsTrigger value="completed">Dokončené</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline">
            Exportovat
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/reservations/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Nová rezervace</span>
            </Link>
          </Button>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Rezervace</CardTitle>
          <CardDescription>Správa všech rezervací a jejich stavů.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationsTable reservations={reservationsData} />
        </CardContent>
      </Card>
    </Tabs>
  )
}
