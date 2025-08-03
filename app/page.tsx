import { StatsCards } from "@/components/dashboard/stats-cards"
import { CameraTimelineCalendar } from "@/components/dashboard/camera-timeline-calendar"
import { UpcomingDispatches } from "@/components/dashboard/upcoming-dispatches"
import { ExpectedReturns } from "@/components/dashboard/expected-returns"

// Označit stránku jako dynamickou
export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Přehled vašeho půjčovacího systému</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <CameraTimelineCalendar />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingDispatches />
        <ExpectedReturns />
      </div>
    </div>
  )
}
