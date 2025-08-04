import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: films, error } = await supabase
      .from("films")
      .select(`
        id,
        name,
        type,
        description,
        price,
        shots_per_pack,
        stock
      `)
      .gt("stock", 0)
      .order("name")

    if (error) {
      console.error("Error fetching films:", error)
      return NextResponse.json({ films: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ films: films || [] })
  } catch (error) {
    console.error("Error in films API:", error)
    return NextResponse.json({ films: [], error: "Internal server error" }, { status: 500 })
  }
}
