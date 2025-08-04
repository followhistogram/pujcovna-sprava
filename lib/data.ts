import { createClient } from "@/lib/supabase/server"

export async function getRevenueData() {
  const supabase = await createClient()

  try {
    const { data } = await supabase
      .from("reservations")
      .select("total_price, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: true })

    return data || []
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return []
  }
}

export async function getUtilizationData() {
  const supabase = await createClient()

  try {
    const { data } = await supabase
      .from("reservations")
      .select("rental_start_date, rental_end_date, status")
      .in("status", ["confirmed", "active", "completed"])
      .order("rental_start_date", { ascending: true })

    return data || []
  } catch (error) {
    console.error("Error fetching utilization data:", error)
    return []
  }
}

// Mock data pro reports stránku - v produkci by se načítala z databáze
export const revenueData = [
  { name: "Leden", revenue: 45000 },
  { name: "Únor", revenue: 52000 },
  { name: "Březen", revenue: 48000 },
  { name: "Duben", revenue: 61000 },
  { name: "Květen", revenue: 55000 },
  { name: "Červen", revenue: 67000 },
]

export const utilizationData = [
  { name: "Polaroid SX-70", value: 35 },
  { name: "Instax Mini 11", value: 28 },
  { name: "Instax Wide 300", value: 22 },
  { name: "Polaroid Now", value: 18 },
  { name: "Instax Square SQ1", value: 15 },
]
