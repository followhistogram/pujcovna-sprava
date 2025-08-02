import { Badge } from "@/components/ui/badge"
import type { ReservationStatus } from "@/lib/types"

type StatusConfig = {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  colorClass: string
}

const statusConfig: Record<ReservationStatus, StatusConfig> = {
  new: { label: "Nová", variant: "secondary", colorClass: "bg-gray-400" },
  confirmed: { label: "Potvrzená", variant: "default", colorClass: "bg-blue-500" },
  ready_for_dispatch: { label: "K expedici", variant: "default", colorClass: "bg-sky-500" },
  active: { label: "Aktivní", variant: "default", colorClass: "bg-green-500" },
  returned: { label: "Vrácena", variant: "secondary", colorClass: "bg-indigo-500" },
  completed: { label: "Ukončena", variant: "secondary", colorClass: "bg-purple-500" },
  canceled: { label: "Stornována", variant: "destructive", colorClass: "bg-red-500" },
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const config = statusConfig[status] || statusConfig.new

  return (
    <Badge variant={config.variant} className="flex items-center gap-2 bg-transparent text-black">
      <span className={`h-2 w-2 rounded-full ${config.colorClass}`}></span>
      <span>{config.label}</span>
    </Badge>
  )
}
