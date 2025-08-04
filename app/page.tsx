import { Suspense } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import {
  StatsCardsSkeleton,
  TimelineSkeleton,
  UpcomingDispatchesSkeleton,
  ExpectedReturnsSkeleton,
} from "@/components/skeletons"
import CameraTimelineCalendar from "@/components/dashboard/camera-timeline-calendar"
import UpcomingDispatches from "@/components/dashboard/upcoming-dispatches"
import ExpectedReturns from "@/components/dashboard/expected-returns"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <Suspense fallback={<TimelineSkeleton />}>
        <CameraTimelineCalendar />
      </Suspense>

      <div className="grid gap-8 md:grid-cols-2">
        <Suspense fallback={<UpcomingDispatchesSkeleton />}>
          <UpcomingDispatches />
        </Suspense>
        <Suspense fallback={<ExpectedReturnsSkeleton />}>
          <ExpectedReturns />
        </Suspense>
      </div>
    </div>
  )
}
