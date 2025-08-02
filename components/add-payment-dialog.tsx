"use client"

import { useActionState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addPaymentTransaction } from "@/app/reservations/actions"
import { toast } from "sonner"

interface AddPaymentDialogProps {
  reservationId: string
  isOpen: boolean
  onClose: () => void
  transactionType: "payment" | "refund"
}

export function AddPaymentDialog({ reservationId, isOpen, onClose, transactionType }: AddPaymentDialogProps) {
  const [state, formAction, isPending] = useActionState(addPaymentTransaction, null)

  // Automaticky zavři dialog po úspěšném přidání platby
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      onClose()
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state, onClose])

  const handleSubmit = async (formData: FormData) => {
    formData.set("reservationId", reservationId)
    formData.set("transactionType", transactionType)
    await formAction(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionType === "payment" ? "Přidat platbu" : "Vytvořit refundaci"}</DialogTitle>
          <DialogDescription>
            {transactionType === "payment"
              ? "Zaznamenejte novou platbu od zákazníka."
              : "Vytvořte refundaci pro zákazníka."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Částka (Kč)</Label>
            <Input id="amount" name="amount" type="number" step="1" min="0" placeholder="0" required />
          </div>

          <div className="space-y-3">
            <Label>Způsob platby</Label>
            <RadioGroup name="paymentMethod" defaultValue="card" className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Karta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Hotovost</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer">Převod</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Jinak</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (volitelné)</Label>
            <Input
              id="description"
              name="description"
              placeholder={transactionType === "payment" ? "Záloha, doplatek..." : "Důvod refundace..."}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Referenční číslo (volitelné)</Label>
            <Input id="referenceNumber" name="referenceNumber" placeholder="Číslo transakce, faktury..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Poznámky (volitelné)</Label>
            <Textarea id="notes" name="notes" placeholder="Další informace..." rows={3} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Ukládání..." : transactionType === "payment" ? "Přidat platbu" : "Vytvořit refundaci"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
