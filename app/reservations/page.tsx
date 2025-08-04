import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { ReservationsTable } from "@/components/reservations-table"

export const dynamic = "force-dynamic"

export default async function ReservationsPage() {
  const supabase = await createClient()

  let reservations: any[] = []
  let error: any = null

  try {
    const { data, error: fetchError } = await supabase
      .from("reservations")
      .select(`
        *,
        items:reservation_items(*)
      `)
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("Error fetching reservations:", fetchError)
      error = fetchError
    } else {
      reservations = data || []
    }
  } catch (err) {
    console.error("Unexpected error:", err)
    error = err
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rezervace</h1>
          <p className="text-muted-foreground">Správa všech rezervací v systému</p>
        </div>
        <Button asChild>
          <Link href="/reservations/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nová rezervace
          </Link>
        </Button>
      </div>

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
            {error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chyba při načítání rezervací. Zkuste obnovit stránku.</p>
              </div>
            ) : (
              <ReservationsTable reservations={reservations} />
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
