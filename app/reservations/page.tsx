import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { ReservationsTable } from "@/components/reservations-table"

// Označit stránku jako dynamickou
export const dynamic = "force-dynamic"

function ReservationsLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rezervace</CardTitle>
            <CardDescription>Správa všech rezervací v systému</CardDescription>
          </div>
          <Button disabled>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nová rezervace
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReservationsPage() {
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

      <Suspense fallback={<ReservationsLoading />}>
        <ReservationsTable />
      </Suspense>
    </div>
  )
}
