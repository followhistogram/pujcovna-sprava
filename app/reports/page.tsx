"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { revenueData, utilizationData } from "@/lib/data"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#ff7a03", "#ff9c4a", "#ffb67a", "#ffd0aa", "#ffeadd"]

export default function ReportsPage() {
  const handleExport = () => {
    // Implementace exportu do CSV
    console.log("Exportuji data do CSV...")
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Reporty a statistiky</CardTitle>
            <CardDescription>Finanční přehledy a statistiky vytíženosti.</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="ml-auto gap-1 bg-transparent" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Exportovat vše (CSV)
          </Button>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Finanční přehled</CardTitle>
            <CardDescription>Měsíční tržby za posledních 6 měsíců.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  formatter={(value: number) => [`${value.toLocaleString("cs-CZ")} Kč`, "Tržby"]}
                  labelFormatter={(label) => `Měsíc: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" name="Tržby" fill="#ff7a03" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vytíženost dle typů fotoaparátů</CardTitle>
            <CardDescription>Podíl jednotlivých modelů na celkovém počtu výpůjček.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [`${value} výpůjček`, "Počet"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
