import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const [camerasRes, filmsRes, accessoriesRes] = await Promise.all([
      supabase.from("cameras").select("*").eq("status", "active"),
      supabase.from("films").select("*").gt("stock", 0),
      supabase.from("accessories").select("*").gt("stock", 0),
    ])

    if (camerasRes.error || filmsRes.error || accessoriesRes.error) {
      console.error("Error fetching inventory:", {
        camerasError: camerasRes.error,
        filmsError: filmsRes.error,
        accessoriesError: accessoriesRes.error,
      })
      throw new Error("Failed to fetch inventory from database.")
    }

    return NextResponse.json({
      cameras: camerasRes.data || [],
      films: filmsRes.data || [],
      accessories: accessoriesRes.data || [],
    })
  } catch (error) {
    console.error("Error in /api/inventory/available:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to fetch available inventory", details: errorMessage }, { status: 500 })
  }
}
