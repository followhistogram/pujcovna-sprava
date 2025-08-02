"use client"

import { useState } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { adjustStock } from "@/app/inventory/actions"
import { toast } from "sonner"
import { Plus, Minus } from "lucide-react"

type StockAdjustmentButtonProps = {
  itemId: string
  itemName: string
  itemType: "film" | "accessory"
  currentStock: number
}

export function StockAdjustmentButton({ itemId, itemName, itemType, currentStock }: StockAdjustmentButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [adjustment, setAdjustment] = useState(0)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (adjustment === 0) {
      toast.error("Zadejte změnu skladu")
      return
    }

    if (!reason.trim()) {
      toast.error("Zadejte důvod změny")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await adjustStock(itemType, itemId, adjustment, reason)
      if (result.success) {
        toast.success(result.message)
        setShowDialog(false)
        setAdjustment(0)
        setReason("")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Nepodařilo se upravit sklad")
    } finally {
      setIsSubmitting(false)
    }
  }

  const newStock = Math.max(0, currentStock + adjustment)

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setShowDialog(true)
        }}
      >
        Upravit sklad
      </DropdownMenuItem>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upravit stav skladu</DialogTitle>
            <DialogDescription>
              Upravte stav skladu pro "{itemName}". Aktuálně: {currentStock} ks
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adjustment">Změna skladu</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustment(Math.max(-currentStock, adjustment - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="adjustment"
                  type="number"
                  value={adjustment}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 0
                    setAdjustment(Math.max(-currentStock, value))
                  }}
                  className="text-center"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setAdjustment(adjustment + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Nový stav: {newStock} ks
                {adjustment > 0 && <span className="text-green-600"> (+{adjustment})</span>}
                {adjustment < 0 && <span className="text-red-600"> ({adjustment})</span>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Důvod změny</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="např. Nákup nových zásob, Poškození, Inventura..."
                className="min-h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || adjustment === 0 || !reason.trim()}>
              {isSubmitting ? "Ukládání..." : "Uložit změnu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
