"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Banknote, Building2, HelpCircle } from "lucide-react"
import { AddPaymentDialog } from "@/components/add-payment-dialog"
import { DeleteTransactionButton } from "@/components/delete-transaction-button"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

interface PaymentTransaction {
  id: string
  amount: number
  payment_method: "card" | "cash" | "bank_transfer" | "other"
  transaction_type: "payment" | "refund"
  description?: string
  reference_number?: string
  notes?: string
  created_at: string
}

interface PaymentTransactionsCardProps {
  reservationId: string
  transactions: PaymentTransaction[]
  totalPrice: number
  totalPaid: number
}

const paymentMethodIcons = {
  card: CreditCard,
  cash: Banknote,
  bank_transfer: Building2,
  other: HelpCircle,
}

const paymentMethodLabels = {
  card: "Karta",
  cash: "Hotovost",
  bank_transfer: "Převod",
  other: "Jinak",
}

export function PaymentTransactionsCard({
  reservationId,
  transactions,
  totalPrice,
  totalPaid,
}: PaymentTransactionsCardProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isAddRefundOpen, setIsAddRefundOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platební transakce</CardTitle>
        <CardDescription>Historie všech plateb a refundací</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Zatím nebyly zaznamenány žádné platby</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const Icon = paymentMethodIcons[transaction.payment_method]
              const isRefund = transaction.transaction_type === "refund"
              const amount = Math.abs(transaction.amount)

              return (
                <div key={transaction.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {transaction.description || (isRefund ? "Refundace" : "Platba")}
                      </span>
                      <Badge variant={isRefund ? "destructive" : "default"} className="text-xs">
                        {isRefund ? "Refundace" : "Platba"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(transaction.created_at), "d.M.yyyy HH:mm", { locale: cs })} •{" "}
                      {paymentMethodLabels[transaction.payment_method]}
                    </div>
                    {transaction.reference_number && (
                      <div className="text-xs text-muted-foreground mt-1">Ref: {transaction.reference_number}</div>
                    )}
                    {transaction.notes && <div className="text-xs text-muted-foreground mt-1">{transaction.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${isRefund ? "text-red-600" : "text-green-600"}`}>
                        {isRefund ? "-" : "+"}
                        {amount.toLocaleString("cs-CZ")} Kč
                      </div>
                    </div>
                    <DeleteTransactionButton transactionId={transaction.id} reservationId={reservationId} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={() => setIsAddPaymentOpen(true)} size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Přidat platbu
          </Button>
          <Button variant="outline" onClick={() => setIsAddRefundOpen(true)} size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Refundace
          </Button>
        </div>

        <AddPaymentDialog
          reservationId={reservationId}
          isOpen={isAddPaymentOpen}
          onClose={() => setIsAddPaymentOpen(false)}
          transactionType="payment"
        />
        <AddPaymentDialog
          reservationId={reservationId}
          isOpen={isAddRefundOpen}
          onClose={() => setIsAddRefundOpen(false)}
          transactionType="refund"
        />
      </CardContent>
    </Card>
  )
}

// Update in AddPaymentDialog component
// import { useState } from "react"
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/components/ui/use-toast"

// interface AddPaymentDialogProps {
//   reservationId: string
//   isOpen: boolean
//   onClose: () => void
//   transactionType: "payment" | "refund"
// }

// export function AddPaymentDialog({ reservationId, isOpen, onClose, transactionType }: AddPaymentDialogProps) {
//   const [amount, setAmount] = useState("")
//   const [description, setDescription] = useState("")
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       // Code to add payment or refund
//       onClose()
//     } catch (error) {
//       toast({
//         title: "Chyba",
//         description: "Nepodařilo se přidat transakci.",
//         variant: "destructive",
//       })
//       onClose()
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogTrigger asChild>
//         <Button variant="outline">Trigger</Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>{transactionType === "payment" ? "Přidat platbu" : "Refundace"}</DialogTitle>
//           <DialogDescription>
//             {transactionType === "payment" ? "Zadejte detaily platby." : "Zadejte detaily refundace."}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="amount">Částka</Label>
//             <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="description">Popis</Label>
//             <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
//           </div>
//           <Button type="submit">{transactionType === "payment" ? "Přidat platbu" : "Refundace"}</Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
