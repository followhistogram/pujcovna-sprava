"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createInvoice } from "@/app/reservations/actions"
import { toast } from "sonner"
import { FileText, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function IssueInvoiceButton({ reservationId }: { reservationId: string }) {
  const [isIssuing, setIsIssuing] = useState(false)
  const router = useRouter()

  const handleIssueInvoice = async () => {
    if (!reservationId) {
      toast.error("Chybí ID rezervace.")
      return
    }
    setIsIssuing(true)
    try {
      const result = await createInvoice(reservationId)
      if (result.success) {
        toast.success(result.message)
        router.refresh() // Refresh the page to show the new invoice link
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Došlo k neočekávané chybě při vystavování faktury.")
    } finally {
      setIsIssuing(false)
    }
  }

  return (
    <Button
      onClick={handleIssueInvoice}
      disabled={isIssuing}
      size="sm"
      variant="outline"
      className="w-full bg-transparent"
    >
      {isIssuing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
      {isIssuing ? "Vystavuji..." : "Fakturu"}
    </Button>
  )
}
