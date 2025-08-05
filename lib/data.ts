// lib/data.ts - Fixed version with proper relationship handling

import { createClient } from "@/lib/supabase/server"

export interface AvailableItem {
  id: string
  name: string
  type: "camera" | "film" | "accessory"
  price_per_day: number
  description?: string
  available_quantity: number
}

export interface ReservationItem {
  id: string
  type: "camera" | "film" | "accessory"
  name: string
  quantity: number
  price_per_day: number
  total_price?: number
  description?: string
  inventory_item_id?: string
}

// Fixed fetchReservationById function with proper error handling
export async function fetchReservationById(id: string) {
  if (!id || id === "new") {
    throw new Error("Invalid reservation ID")
  }

  try {
    const supabase = await createClient()

    // First, fetch the reservation
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single()

    if (reservationError) {
      console.error("Supabase reservation error:", reservationError)
      throw new Error(`Database error: ${reservationError.message}`)
    }

    if (!reservation) {
      throw new Error("Reservation not found")
    }

    // Fetch reservation items separately
    const { data: items, error: itemsError } = await supabase
      .from("reservation_items")
      .select("*")
      .eq("reservation_id", id)

    if (itemsError) {
      console.error("Supabase items error:", itemsError)
      // Don't throw error for items, just log it
      console.warn("Could not fetch reservation items:", itemsError.message)
    }

    // Fetch payment transactions separately
    const { data: transactions, error: transactionsError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reservation_id", id)
      .order("created_at", { ascending: false })

    if (transactionsError) {
      console.error("Supabase transactions error:", transactionsError)
      // Don't throw error for transactions, just log it
      console.warn("Could not fetch payment transactions:", transactionsError.message)
    }

    // Combine the data
    const result = {
      ...reservation,
      items: items
        ? items.map((item: any) => ({
            ...item,
            price_per_day: Number(item.price_per_day) || 0,
            quantity: Number(item.quantity) || 0,
            total_price: Number(item.total_price) || 0,
          }))
        : [],
      transactions: transactions || [],
    }

    return result
  } catch (error) {
    console.error("Error in fetchReservationById:", error)
    throw error
  }
}

// DOČASNÁ funkce - vrátí mock data nebo načte z existujících tabulek
export async function fetchAvailableItems(): Promise<AvailableItem[]> {
  try {
    const supabase = await createClient()

    // Zkusíme zjistit jaké tabulky existují
    console.log("Fetching available items...")

    // Možnost 1: Zkus načíst z cameras, films, accessories tabulek
    const availableItems: AvailableItem[] = []

    // Zkusíme načíst fotoaparáty
    try {
      const { data: cameras, error: camerasError } = await supabase.from("cameras").select("*").eq("is_available", true)

      if (!camerasError && cameras) {
        cameras.forEach((camera) => {
          availableItems.push({
            id: camera.id,
            name: camera.name || camera.model || "Fotoaparát",
            type: "camera",
            price_per_day: Number(camera.price_per_day) || Number(camera.daily_rate) || 100,
            description: camera.description,
            available_quantity: Number(camera.quantity) || Number(camera.stock) || 1,
          })
        })
      }
    } catch (e) {
      console.log("Cameras table not found or error:", e)
    }

    // Zkusíme načíst filmy
    try {
      const { data: films, error: filmsError } = await supabase.from("films").select("*").eq("is_available", true)

      if (!filmsError && films) {
        films.forEach((film) => {
          availableItems.push({
            id: film.id,
            name: film.name || film.type || "Film",
            type: "film",
            price_per_day: Number(film.price_per_day) || Number(film.daily_rate) || 50,
            description: film.description,
            available_quantity: Number(film.quantity) || Number(film.stock) || 1,
          })
        })
      }
    } catch (e) {
      console.log("Films table not found or error:", e)
    }

    // Zkusíme načíst příslušenství
    try {
      const { data: accessories, error: accessoriesError } = await supabase
        .from("accessories")
        .select("*")
        .eq("is_available", true)

      if (!accessoriesError && accessories) {
        accessories.forEach((accessory) => {
          availableItems.push({
            id: accessory.id,
            name: accessory.name || "Příslušenství",
            type: "accessory",
            price_per_day: Number(accessory.price_per_day) || Number(accessory.daily_rate) || 25,
            description: accessory.description,
            available_quantity: Number(accessory.quantity) || Number(accessory.stock) || 1,
          })
        })
      }
    } catch (e) {
      console.log("Accessories table not found or error:", e)
    }

    // Pokud nemáme žádné položky, vytvoříme mock data pro testování
    if (availableItems.length === 0) {
      console.log("No items found in database, returning mock data")
      return getMockAvailableItems()
    }

    console.log(`Found ${availableItems.length} available items`)
    return availableItems
  } catch (error) {
    console.error("Error in fetchAvailableItems:", error)
    console.log("Returning mock data due to error")
    return getMockAvailableItems()
  }
}

// Mock data pro testování
function getMockAvailableItems(): AvailableItem[] {
  return [
    // Fotoaparáty
    {
      id: "camera-1",
      name: "Canon EOS R5",
      type: "camera",
      price_per_day: 800,
      description: "Profesionální zrcadlovka s plnoformátovým senzorem",
      available_quantity: 2,
    },
    {
      id: "camera-2",
      name: "Sony A7 III",
      type: "camera",
      price_per_day: 600,
      description: "Bezzrcadlovka s vynikajícím low-light výkonem",
      available_quantity: 3,
    },
    {
      id: "camera-3",
      name: "Nikon D850",
      type: "camera",
      price_per_day: 700,
      description: "Vysokorozlišovací DSLR pro studio i terén",
      available_quantity: 1,
    },

    // Filmy
    {
      id: "film-1",
      name: "Kodak Portra 400",
      type: "film",
      price_per_day: 350,
      description: "Profesionální portrétní barevný negativní film",
      available_quantity: 10,
    },
    {
      id: "film-2",
      name: "Fujifilm Pro 400H",
      type: "film",
      price_per_day: 400,
      description: "Prémiový barevný film s jemnými tóny",
      available_quantity: 5,
    },
    {
      id: "film-3",
      name: "Ilford HP5 Plus",
      type: "film",
      price_per_day: 250,
      description: "Klasický černobílý film s vysokou citlivostí",
      available_quantity: 8,
    },

    // Příslušenství
    {
      id: "acc-1",
      name: "Stativ Gitzo GT3543XLS",
      type: "accessory",
      price_per_day: 200,
      description: "Profesionální karbonový stativ",
      available_quantity: 4,
    },
    {
      id: "acc-2",
      name: "Flash Profoto B10",
      type: "accessory",
      price_per_day: 150,
      description: "Kompaktní studiový blesk s baterií",
      available_quantity: 6,
    },
    {
      id: "acc-3",
      name: "Objektiv 85mm f/1.4",
      type: "accessory",
      price_per_day: 300,
      description: "Portrétní objektiv s krásným bokeh",
      available_quantity: 2,
    },
  ]
}

// Funkce pro aktualizaci položek rezervace
export async function updateReservationItems(reservationId: string, items: ReservationItem[]) {
  try {
    const supabase = await createClient()

    // Začneme transakci - nejdříve smažeme existující položky
    const { error: deleteError } = await supabase.from("reservation_items").delete().eq("reservation_id", reservationId)

    if (deleteError) {
      throw new Error(`Error deleting existing items: ${deleteError.message}`)
    }

    // Přidáme nové položky
    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        reservation_id: reservationId,
        inventory_item_id: item.inventory_item_id,
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        price_per_day: item.price_per_day,
        total_price: item.total_price || item.price_per_day * item.quantity,
        description: item.description,
        created_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabase.from("reservation_items").insert(itemsToInsert)

      if (insertError) {
        throw new Error(`Error inserting new items: ${insertError.message}`)
      }
    }

    // Přepočítáme celkovou cenu rezervace
    const totalPrice = items.reduce((sum, item) => sum + (item.total_price || 0), 0)

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        total_price: totalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservationId)

    if (updateError) {
      console.error("Error updating reservation total:", updateError)
      // Neházneme chybu, protože položky jsou už uložené
    }

    return { success: true, totalPrice }
  } catch (error) {
    console.error("Error in updateReservationItems:", error)
    throw error
  }
}

// Funkce pro zjištění struktury databáze
export async function getTableStructure() {
  try {
    const supabase = await createClient()

    // Zkusíme různé možné názvy tabulek
    const possibleTables = ["inventory", "cameras", "films", "accessories", "products", "items", "equipment", "gear"]

    const existingTables = []

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        if (!error) {
          existingTables.push(tableName)
          console.log(`Table ${tableName} exists`)
        }
      } catch (e) {
        // Tabulka neexistuje
      }
    }

    return existingTables
  } catch (error) {
    console.error("Error checking table structure:", error)
    return []
  }
}

// Helper function to fetch payment transactions for a reservation
export async function fetchPaymentTransactions(reservationId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payment transactions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in fetchPaymentTransactions:", error)
    return []
  }
}
