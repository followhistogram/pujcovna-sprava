"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Reservation } from "@/lib/types"

interface FinancialSummaryCardProps {
  reservation: Reservation
  transactions?: any[]
}

export function FinancialSummaryCard({ reservation, transactions = [] }: FinancialSummaryCardProps) {
  const rentalTotal = reservation.rental_total || 0
  const salesTotal = reservation.sales_total || 0
  const depositTotal = reservation.deposit_total || 0
  const totalPrice = reservation.total_price || 0

  // Vypočítej uhrazenou částku z transakcí
  const amountPaid = transactions.reduce((total, transaction) => {
    return total + (transaction.amount || 0)
  }, 0)

  const remainingAmount = totalPrice - amountPaid

  const isFullyPaid = remainingAmount <= 0
  const hasOverpayment = remainingAmount < 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finanční rekapitulace</CardTitle>
        <CardDescription>Přehled všech částek a plateb</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rozpis položek */}
        <div className="space-y-2">
          {rentalTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pronájem fotoaparátů</span>
              <span>{rentalTotal.toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}
          {salesTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prodej (filmy, příslušenství)</span>
              <span>{salesTotal.toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}
          {depositTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vratná kauce</span>
              <span>{depositTotal.toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Celková částka */}
        <div className="flex justify-between font-semibold">
          <span>Celkem k platbě</span>
          <span>{totalPrice.toLocaleString("cs-CZ")} Kč</span>
        </div>

        <Separator />

        {/* Stav plateb */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uhrazeno</span>
            <span className="text-green-600 font-medium">{Math.abs(amountPaid).toLocaleString("cs-CZ")} Kč</span>
          </div>

          {remainingAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Zbývá k úhradě</span>
              <span className="text-orange-600 font-medium">{remainingAmount.toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}

          {hasOverpayment && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Přeplatek</span>
              <span className="text-red-600 font-medium">{Math.abs(remainingAmount).toLocaleString("cs-CZ")} Kč</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="pt-2">
          {isFullyPaid ? (
            hasOverpayment ? (
              <Badge variant="destructive" className="w-full justify-center">
                Přeplaceno
              </Badge>
            ) : (
              <Badge variant="default" className="w-full justify-center bg-green-600 hover:bg-green-700">
                Plně uhrazeno
              </Badge>
            )
          ) : (
            <Badge variant="secondary" className="w-full justify-center">
              Částečně uhrazeno
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
