import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: accessories, error } = await supabase
      .from("accessories")
      .select(`
        id,
        name,
        description,
        price,
        stock
      `)
      .gt("stock", 0)
      .order("name")

    if (error) {
      console.error("Error fetching accessories:", error)
      return NextResponse.json({ accessories: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ accessories: accessories || [] })
  } catch (error) {
    console.error("Error in accessories API:", error)
    return NextResponse.json({ accessories: [], error: "Internal server error" }, { status: 500 })
  }
}
