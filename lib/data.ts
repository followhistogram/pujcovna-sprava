import { createClient } from "@/lib/supabase/server"
import type { Camera, Film, Accessory, Reservation } from "@/lib/types"

export async function getCameras(): Promise<Camera[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("cameras").select("*").order("name")

    if (error) {
      console.error("Error fetching cameras:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCameras:", error)
    return []
  }
}

export async function getFilms(): Promise<Film[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("films").select("*").order("name")

    if (error) {
      console.error("Error fetching films:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getFilms:", error)
    return []
  }
}

export async function getAccessories(): Promise<Accessory[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("accessories").select("*").order("name")

    if (error) {
      console.error("Error fetching accessories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAccessories:", error)
    return []
  }
}

export async function getReservations(): Promise<Reservation[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        items:reservation_items(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reservations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getReservations:", error)
    return []
  }
}

export async function getReservation(id: string): Promise<Reservation | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        items:reservation_items(*),
        transactions:payment_transactions(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching reservation:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getReservation:", error)
    return null
  }
}
