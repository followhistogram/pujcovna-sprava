"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Reservation, ReservationStatus } from "@/lib/types"
import { ReservationStatusBadge } from "./reservation-status-badge"
import { useState } from "react"
import { updateReservationStatus } from "@/app/reservations/actions"
import { toast } from "sonner"
import { MoreHorizontal, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, Package, Truck, RotateCcw, XCircle, Clock, AlertTriangle } from "lucide-react"
import { IssueInvoiceButton } from "./issue-invoice-button"
import { FileText } from "lucide-react"
import { OrderShippingButton } from "./order-shipping-button"

type StatusAction = {
  status: ReservationStatus
  label: string
  icon: React.ElementType
  variant: "default" | "secondary" | "destructive" | "outline"
  description: string
}

const statusActions: Record<ReservationStatus, StatusAction[]> = {
  new: [
    {
      status: "confirmed",
      label: "Potvrdit rezervaci",
      icon: CheckCircle,
      variant: "default",
      description: "Rezervace je potvrzena a připravena k expedici",
    },
    {
      status: "canceled",
      label: "Stornovat",
      icon: XCircle,
      variant: "destructive",
      description: "Zrušit rezervaci",
    },
  ],
  confirmed: [
    {
      status: "ready_for_dispatch",
      label: "Připraveno k expedici",
      icon: Package,
      variant: "default",
      description: "Vybavení je připraveno a zabaleno",
    },
    {
      status: "canceled",
      label: "Stornovat",
      icon: XCircle,
      variant: "destructive",
      description: "Zrušit rezervaci",
    },
  ],
  ready_for_dispatch: [
    {
      status: "active",
      label: "Vydat zákazníkovi",
      icon: Truck,
      variant: "default",
      description: "Vybavení bylo předáno zákazníkovi",
    },
    {
      status: "confirmed",
      label: "Vrátit do potvrzeno",
      icon: RotateCcw,
      variant: "outline",
      description: "Vrátit do stavu potvrzeno",
    },
  ],
  active: [
    {
      status: "returned",
      label: "Označit jako vráceno",
      icon: CheckCircle,
      variant: "default",
      description: "Zákazník vrátil vybavení",
    },
  ],
  returned: [
    {
      status: "completed",
      label: "Dokončit rezervaci",
      icon: CheckCircle,
      variant: "default",
      description: "Rezervace je kompletně dokončena",
    },
    {
      status: "active",
      label: "Vrátit do aktivní",
      icon: RotateCcw,
      variant: "outline",
      description: "Vrátit do aktivního stavu",
    },
  ],
  completed: [],
  canceled: [],
}

export function ReservationStatusCard({
  reservation,
  onStatusChange,
}: {
  reservation: Reservation | null
  onStatusChange?: (newStatus: ReservationStatus) => void
}) {
  const [isUpdating, setIsUpdating] = useState(false)
  const currentStatus = reservation?.status || "new"
  const availableActions = statusActions[currentStatus] || []

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (!reservation?.id) return

    setIsUpdating(true)
    try {
      const result = await updateReservationStatus(reservation.id, newStatus)
      if (result.success) {
        toast.success(result.message)
        onStatusChange?.(newStatus)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Nepodařilo se změnit stav rezervace")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusInfo = (status: ReservationStatus) => {
    const statusInfo = {
      new: {
        icon: Clock,
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        description: "Nová rezervace čeká na potvrzení",
      },
      confirmed: {
        icon: CheckCircle,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        description: "Rezervace je potvrzena, připravte vybavení",
      },
      ready_for_dispatch: {
        icon: Package,
        color: "text-sky-500",
        bgColor: "bg-sky-100",
        description: "Vybavení je připraveno k předání",
      },
      active: {
        icon: Truck,
        color: "text-green-500",
        bgColor: "bg-green-100",
        description: "Vybavení je u zákazníka",
      },
      returned: {
        icon: RotateCcw,
        color: "text-indigo-500",
        bgColor: "bg-indigo-100",
        description: "Vybavení bylo vráceno, zkontrolujte stav",
      },
      completed: {
        icon: CheckCircle,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
        description: "Rezervace je kompletně dokončena",
      },
      canceled: {
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-100",
        description: "Rezervace byla stornována",
      },
    }
    return statusInfo[status] || statusInfo.new
  }

  const statusInfo = getStatusInfo(currentStatus)
  const StatusIcon = statusInfo.icon

  return (
    <Card>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${statusInfo.bgColor}`}>
                <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.color}`} />
              </div>
              <ReservationStatusBadge status={currentStatus} />
            </div>
            {availableActions.length > 0 && (
              <div className="flex items-center gap-1">
                {availableActions.slice(0, 1).map((action) => {
                  const ActionIcon = action.icon
                  return (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleStatusChange(action.status)}
                      disabled={isUpdating}
                      className="h-7 px-2 text-xs"
                    >
                      <ActionIcon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  )
                })}
                {availableActions.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 px-1.5 bg-transparent">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableActions.slice(1).map((action) => {
                        const ActionIcon = action.icon
                        return (
                          <DropdownMenuItem
                            key={action.status}
                            onClick={() => handleStatusChange(action.status)}
                            disabled={isUpdating}
                          >
                            <ActionIcon className="h-4 w-4 mr-2" />
                            {action.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>

          {/* Status Description */}
          <p className="text-xs text-muted-foreground pl-8">{statusInfo.description}</p>

          {/* Status-specific alerts */}
          {currentStatus === "active" && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                Vrácení do: {reservation && new Date(reservation.rental_end_date).toLocaleDateString("cs-CZ")}
              </div>
            </div>
          )}

          {currentStatus === "returned" && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Zkontrolujte vrácené vybavení před dokončením
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            {/* Invoice Section */}
            <div>
              {reservation?.invoice_url ? (
                <Button asChild size="sm" variant="outline" className="w-full h-8 bg-transparent">
                  <a href={reservation.invoice_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-xs">Faktura</span>
                  </a>
                </Button>
              ) : (
                <div className="w-full">
                  <IssueInvoiceButton reservationId={reservation?.id || ""} />
                </div>
              )}
            </div>

            {/* Shipping Section */}
            <div>
              {reservation?.shipment_label_url ? (
                <Button asChild size="sm" variant="outline" className="w-full h-8 bg-transparent">
                  <a href={reservation.shipment_label_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-xs">Štítek</span>
                  </a>
                </Button>
              ) : reservation?.delivery_method === "delivery" ? (
                <OrderShippingButton reservationId={reservation?.id || ""} />
              ) : (
                <Button size="sm" variant="outline" disabled className="w-full h-8 bg-transparent">
                  <Truck className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Osobní odběr</span>
                </Button>
              )}
            </div>
          </div>

          {/* Manual Status Change - Collapsible */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 py-1">
              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              Změnit stav
            </summary>
            <div className="mt-2 pl-4">
              <Select
                value={currentStatus}
                onValueChange={(value: ReservationStatus) => handleStatusChange(value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nová</SelectItem>
                  <SelectItem value="confirmed">Potvrzená</SelectItem>
                  <SelectItem value="ready_for_dispatch">K expedici</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="returned">Vrácena</SelectItem>
                  <SelectItem value="completed">Dokončena</SelectItem>
                  <SelectItem value="canceled">Stornována</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}
