"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { orderShipping } from "@/app/reservations/actions"
import { toast } from "sonner"
import { Truck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function OrderShippingButton({ reservationId }: { reservationId: string }) {
  const [isOrdering, setIsOrdering] = useState(false)
  const router = useRouter()

  const handleOrderShipping = async () => {
    if (!reservationId) {
      toast.error("Chybí ID rezervace.")
      return
    }
    setIsOrdering(true)
    try {
      const result = await orderShipping(reservationId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Došlo k neočekávané chybě při objednávání dopravy.")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <Button
      onClick={handleOrderShipping}
      disabled={isOrdering}
      size="sm"
      variant="outline"
      className="w-full bg-transparent"
    >
      {isOrdering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Truck className="h-4 w-4 mr-2" />}
      {isOrdering ? "Objednávám..." : "Objednat dopravu"}
    </Button>
  )
}
