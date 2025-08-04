import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { ReservationsTable } from "@/components/reservations-table"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const dynamic = "force-dynamic"

interface Reservation {
  id: string
  created_at: string
  [key: string]: any
}

export default async function ReservationsPage() {
  let reservations: Reservation[] = []
  let error: string | null = null
  let supabaseClient = null

  try {
    // Kontrola, zda je Supabase správně nakonfigurován
    supabaseClient = await createClient()
    
    if (!supabaseClient) {
      throw new Error("Nepodařilo se vytvořit Supabase klienta")
    }

    console.log("Attempting to fetch reservations...")

    const { data, error: fetchError } = await supabaseClient
      .from("reservations")
      .select(`
        *,
        items:reservation_items(*)
      `)
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError)
      error = `Chyba databáze: ${fetchError.message}`
    } else if (data) {
      reservations = data
      console.log(`Successfully fetched ${data.length} reservations`)
    } else {
      console.warn("No data returned from Supabase")
      reservations = []
    }

  } catch (err) {
    console.error("Unexpected error in ReservationsPage:", err)
    error = err instanceof Error ? `Neočekávaná chyba: ${err.message}` : "Neznámá chyba při načítání dat"
  }

  // Pokud je chyba kritická, zobrazíme error stránku
  if (error && reservations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rezervace</h1>
            <p className="text-muted-foreground">Správa všech rezervací v systému</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Chyba při načítání
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Možné příčiny:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Chybí environment proměnné pro Supabase</li>
                <li>• Neplatné API klíče</li>
                <li>• Problémy s připojením k databázi</li>
                <li>• Chybná konfigurace RLS (Row Level Security)</li>
              </ul>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Obnovit stránku
              </Button>
              <Button asChild>
                <Link href="/reservations/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nová rezervace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error} - Zobrazují se dostupná data.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Vše ({reservations.length})</TabsTrigger>
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
            <CardDescription>
              Správa všech rezervací a jejich stavů.
              {reservations.length === 0 && !error && " (Zatím žádné rezervace)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 && !error ? (
              <div className="text-center py-12">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Žádné rezervace</h3>
                <p className="mt-2 text-muted-foreground">
                  Začněte vytvořením první rezervace.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/reservations/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Vytvořit rezervaci
                  </Link>
                </Button>
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
