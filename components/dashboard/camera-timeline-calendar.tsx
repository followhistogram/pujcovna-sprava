"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight, Calendar, Camera } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, isToday, isWeekend } from "date-fns"
import { cs } from "date-fns/locale"
import type { Camera as CameraType } from "@/lib/types"

interface Reservation {
  id: string
  short_id: string
  customer_name: string
  rental_start_date: string
  rental_end_date: string
  status: string
  items: Array<{
    item_id: string
    item_type: string
    quantity: number
  }>
}

interface CameraTimelineCalendarProps {
  reservations: Reservation[]
  cameras: CameraType[]
}

export function CameraTimelineCalendar({ reservations, cameras }: CameraTimelineCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const getReservationsForCamera = (cameraId: string) => {
    return reservations.filter((reservation) =>
      reservation.items.some((item) => item.item_type === "camera" && item.item_id === cameraId),
    )
  }

  const getReservationForDay = (cameraId: string, day: Date) => {
    const cameraReservations = getReservationsForCamera(cameraId)
    return cameraReservations.find((reservation) => {
      const startDate = new Date(reservation.rental_start_date)
      const endDate = new Date(reservation.rental_end_date)
      return day >= startDate && day <= endDate
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500"
      case "ready_for_dispatch":
        return "bg-yellow-500"
      case "active":
        return "bg-green-500"
      case "returned":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Potvrzeno"
      case "ready_for_dispatch":
        return "K odeslání"
      case "active":
        return "Aktivní"
      case "returned":
        return "Vráceno"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Časová osa rezervací
            </CardTitle>
            <CardDescription>Přehled vytíženosti fotoaparátů v čase</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Dnes
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header s dny */}
          <div className="grid grid-cols-8 gap-2">
            <div className="font-medium text-sm text-muted-foreground">Fotoaparát</div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`text-center text-sm font-medium p-2 rounded ${
                  isToday(day)
                    ? "bg-primary text-primary-foreground"
                    : isWeekend(day)
                      ? "bg-muted text-muted-foreground"
                      : ""
                }`}
              >
                <div>{format(day, "EEE", { locale: cs })}</div>
                <div className="text-xs">{format(day, "d.M.")}</div>
              </div>
            ))}
          </div>

          {/* Řádky s fotoaparáty */}
          <div className="space-y-2">
            {cameras.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-8 w-8 mx-auto mb-2" />
                <p>Žádné fotoaparáty k zobrazení</p>
              </div>
            ) : (
              cameras.map((camera) => (
                <div key={camera.id} className="grid grid-cols-8 gap-2 items-center">
                  <div className="font-medium text-sm truncate" title={camera.name}>
                    {camera.name}
                  </div>
                  {days.map((day) => {
                    const reservation = getReservationForDay(camera.id, day)
                    return (
                      <div key={day.toISOString()} className="h-8 flex items-center justify-center">
                        {reservation ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div
                                className={`w-full h-6 rounded cursor-pointer ${getStatusColor(
                                  reservation.status,
                                )} opacity-80 hover:opacity-100 transition-opacity`}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <div className="font-medium">{reservation.customer_name}</div>
                                <div className="text-sm text-muted-foreground">Rezervace #{reservation.short_id}</div>
                                <div className="text-sm">
                                  {format(new Date(reservation.rental_start_date), "d. M. yyyy", {
                                    locale: cs,
                                  })}{" "}
                                  -{" "}
                                  {format(new Date(reservation.rental_end_date), "d. M. yyyy", {
                                    locale: cs,
                                  })}
                                </div>
                                <Badge variant="outline">{getStatusLabel(reservation.status)}</Badge>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="w-full h-6 bg-gray-100 dark:bg-gray-800 rounded opacity-30" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
