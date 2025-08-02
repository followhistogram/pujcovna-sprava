"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ReservationItem } from "@/lib/types"

export function ReservationSummaryCard({ items }: { items: Partial<ReservationItem>[] }) {
  const [summary, setSummary] = useState({
    rental: 0, // Pouze fotoaparáty
    sales: 0, // Filmy + příslušenství
    deposit: 0, // Kauce
    total: 0,
  })

  useEffect(() => {
    const rental = items
      .filter((item) => item.item_type === "camera")
      .reduce((acc, item) => acc + (item.unit_price || 0) * (item.quantity || 0), 0)

    const sales = items
      .filter((item) => item.item_type === "film" || item.item_type === "accessory")
      .reduce((acc, item) => acc + (item.unit_price || 0) * (item.quantity || 0), 0)

    const deposit = items.reduce((acc, item) => acc + (item.deposit || 0) * (item.quantity || 0), 0)

    setSummary({
      rental,
      sales,
      deposit,
      total: rental + sales + deposit,
    })
  }, [items])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rekapitulace</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center">
          <div>Půjčovné (fotoaparáty)</div>
          <div className="ml-auto font-medium">{summary.rental.toLocaleString("cs-CZ")} Kč</div>
        </div>
        <div className="flex items-center">
          <div>Prodej (filmy + příslušenství)</div>
          <div className="ml-auto font-medium">{summary.sales.toLocaleString("cs-CZ")} Kč</div>
        </div>
        <div className="flex items-center">
          <div>Vratná kauce</div>
          <div className="ml-auto font-medium">{summary.deposit.toLocaleString("cs-CZ")} Kč</div>
        </div>
        <Separator />
        <div className="flex items-center text-base font-semibold">
          <div>Celkem k platbě</div>
          <div className="ml-auto">{summary.total.toLocaleString("cs-CZ")} Kč</div>
        </div>
      </CardContent>
    </Card>
  )
}
