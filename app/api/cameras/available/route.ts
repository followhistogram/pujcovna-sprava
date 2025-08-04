import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: cameras, error } = await supabase
      .from("cameras")
      .select(`
        id,
        name,
        description,
        deposit,
        pricing_tiers,
        package_contents,
        status
      `)
      .eq("status", "active")
      .order("name")

    if (error) {
      console.error("Error fetching cameras:", error)
      return NextResponse.json({ cameras: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cameras: cameras || [] })
  } catch (error) {
    console.error("Error in cameras API:", error)
    return NextResponse.json({ cameras: [], error: "Internal server error" }, { status: 500 })
  }
}
