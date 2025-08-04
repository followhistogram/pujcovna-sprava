import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/inventory/available
 * Vrací dostupné fotoaparáty, filmy a příslušenství.
 */
export async function GET() {
  // createClient je synchronní, žádné await!
  const supabase = createClient()

  try {
    // Paralelní dotazy pro vyšší výkon
    const [camerasRes, filmsRes, accessoriesRes] = await Promise.all([
      supabase.from("cameras").select("*").eq("status", "active"),
      supabase.from("films").select("*").gt("stock", 0),
      supabase.from("accessories").select("*").gt("stock", 0),
    ])

    // Ošetření chyb z databáze
    if (camerasRes.error || filmsRes.error || accessoriesRes.error) {
      console.error("Error fetching inventory:", {
        camerasError: camerasRes.error,
        filmsError: filmsRes.error,
        accessoriesError: accessoriesRes.error,
      })
      throw new Error("Failed to fetch inventory from database.")
    }

    // Úspěšná odpověď
    return NextResponse.json({
      cameras: camerasRes.data ?? [],
      films: filmsRes.data ?? [],
      accessories: accessoriesRes.data ?? [],
    })
  } catch (error) {
    console.error("Error in /api/inventory/available:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch available inventory", details: message },
      { status: 500 },
    )
  }
}
