"use client"

import { useState } from "react"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  differenceInDays,
  isWeekend,
  max,
  min,
} from "date-fns"
import { cs } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Reservation, Camera } from "@/lib/types"
import { TimelinePopoverContent } from "./timeline-popover-content"

interface CameraTimelineCalendarProps {
  reservations: (Reservation & {
    items: Array<{
      item_id: string
      item_type: "camera" | "film" | "accessory"
      name: string
      quantity: number
    }>
  })[]
  cameras: Camera[]
}

const statusColors: Record<Reservation["status"], string> = {
  new: "bg-gray-400 border-gray-500",
  confirmed: "bg-blue-500 border-blue-600",
  ready_for_dispatch: "bg-sky-500 border-sky-600",
  active: "bg-green-500 border-green-600",
  returned: "bg-indigo-500 border-indigo-600",
  completed: "bg-purple-500 border-purple-600",
  canceled: "bg-red-500 border-red-600",
}

export function CameraTimelineCalendar({ reservations, cameras }: CameraTimelineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  })

  // Map reservations to their respective cameras
  const reservationsByCamera = cameras.map((camera) => ({
    ...camera,
    reservations: reservations.filter((res) =>
      res.items.some((item) => item.item_type === "camera" && item.item_id === camera.id),
    ),
  }))

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Časová osa vytíženosti</CardTitle>
            <CardDescription>Přehled rezervací pro jednotlivé fotoaparáty.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleToday}
              className="hidden sm:inline-flex h-8 px-3 text-xs bg-transparent"
            >
              Dnes
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {format(currentDate, "LLLL yyyy", { locale: cs })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div
          className="grid gap-y-1"
          style={{
            gridTemplateColumns: `minmax(180px, 1fr) repeat(${daysInMonth.length}, minmax(32px, 1fr))`,
          }}
        >
          {/* Header row for dates */}
          <div className="sticky left-0 z-10 font-semibold text-xs text-muted-foreground p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            Fotoaparát
          </div>
          {daysInMonth.map((day) => (
            <div
              key={day.toString()}
              className={cn("text-center text-xs p-2 border-l", isToday(day) && "bg-primary/10 text-primary font-bold")}
            >
              <div className="text-muted-foreground">{format(day, "E", { locale: cs })[0]}</div>
              <div>{format(day, "d")}</div>
            </div>
          ))}

          {/* Camera rows */}
          {reservationsByCamera.map((camera, index) => (
            <div key={camera.id} className="contents" style={{ gridRow: index + 2 }}>
              <div
                className="sticky left-0 z-10 text-sm font-medium p-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 truncate"
                title={camera.name}
              >
                {camera.name}
              </div>

              {/* Background cells for each day */}
              {daysInMonth.map((day) => (
                <div
                  key={day.toString()}
                  className={cn(
                    "border-l border-t",
                    isToday(day) && "bg-primary/10",
                    isWeekend(day) && !isToday(day) && "bg-muted/50",
                  )}
                ></div>
              ))}

              {/* Reservations for this camera */}
              {camera.reservations.map((reservation) => {
                const startDate = new Date(reservation.rental_start_date)
                const endDate = new Date(reservation.rental_end_date)

                if (!isSameMonth(startDate, currentDate) && !isSameMonth(endDate, currentDate)) {
                  // Reservation is not in the current month at all
                  if (startDate < firstDayOfMonth && endDate > lastDayOfMonth) {
                    // Spans the whole month
                  } else {
                    return null
                  }
                }

                const visibleStartDate = max([startDate, firstDayOfMonth])
                const visibleEndDate = min([endDate, lastDayOfMonth])

                const startDay = visibleStartDate.getDate()
                const duration = differenceInDays(visibleEndDate, visibleStartDate) + 1

                const startColumn = startDay + 1 // +1 for camera name column

                return (
                  <Popover key={reservation.id}>
                    <PopoverTrigger asChild>
                      <div
                        className={cn(
                          "h-8 flex items-center p-2 rounded-md text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity my-1 border",
                          statusColors[reservation.status],
                        )}
                        style={{
                          gridColumn: `${startColumn} / span ${duration}`,
                          gridRow: index + 2,
                        }}
                      >
                        <p className="truncate">{reservation.customer_name}</p>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <TimelinePopoverContent reservation={reservation} />
                    </PopoverContent>
                  </Popover>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
