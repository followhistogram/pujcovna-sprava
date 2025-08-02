"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const pricingTierSchema = z.object({
  min_days: z.coerce.number().int().min(1, "Minimální počet dní je povinný."),
  price_per_day: z.coerce.number().min(0, "Cena musí být nezáporná"),
})

const serialNumberSchema = z.object({
  serial_number: z.string().min(1, "Výrobní číslo je povinné"),
  status: z.enum(["active", "serviced", "retired"]).default("active"),
})

const packageItemSchema = z.object({
  name: z.string().min(1, "Název položky je povinný"),
})

const cameraSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Název musí mít alespoň 3 znaky."),
  status: z.enum(["draft", "active"]),
  category_id: z.string().uuid("Musíte vybrat platnou kategorii."),
  stock: z.coerce.number().int().min(0, "Sklad musí být nezáporné číslo."),
  deposit: z.coerce.number().int().min(0, "Kauce musí být nezáporné číslo."),
  description: z.string().optional(),
  short_description: z.string().optional(),
  pricing_tiers: z.array(pricingTierSchema).optional(),
  serial_numbers: z.array(serialNumberSchema).optional(),
  package_contents: z.array(packageItemSchema).optional(),
  images: z.array(z.string().url()).optional(),
  compatible_film_ids: z.array(z.string().uuid()).min(1, "Musíte vybrat alespoň jeden kompatibilní film."),
})

export async function saveCamera(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Parse JSON data
  let pricingTiers = []
  let serialNumbers = []
  let packageContents = []
  let images = []
  let compatible_film_ids = []

  try {
    const pricingTiersJson = formData.get("pricing_tiers") as string
    const serialNumbersJson = formData.get("serial_numbers") as string
    const packageContentsJson = formData.get("package_contents") as string
    const imagesJson = formData.get("images") as string
    const compatibleFilmIdsJson = formData.get("compatible_film_ids") as string

    if (pricingTiersJson) pricingTiers = JSON.parse(pricingTiersJson)
    if (serialNumbersJson) serialNumbers = JSON.parse(serialNumbersJson)
    if (packageContentsJson) packageContents = JSON.parse(packageContentsJson)
    if (imagesJson) images = JSON.parse(imagesJson)
    if (compatibleFilmIdsJson) compatible_film_ids = JSON.parse(compatibleFilmIdsJson)
  } catch (error) {
    console.error("Error parsing JSON data:", error)
    return {
      success: false,
      message: "Chyba při zpracování dat formuláře.",
    }
  }

  const validatedFields = cameraSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    status: formData.get("status"),
    category_id: formData.get("category_id"),
    stock: formData.get("stock"),
    deposit: formData.get("deposit"),
    description: formData.get("description"),
    short_description: formData.get("short_description"),
    pricing_tiers: pricingTiers,
    serial_numbers: serialNumbers,
    package_contents: packageContents,
    images: images,
    compatible_film_ids: compatible_film_ids,
  })

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors)
    return {
      success: false,
      message: "Formulář obsahuje chyby.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, compatible_film_ids: filmIds, ...cameraData } = validatedFields.data

  try {
    let cameraId = id
    const isNewCamera = !id

    // Prepare basic camera data
    const basicCameraData = {
      name: cameraData.name,
      status: cameraData.status,
      category_id: cameraData.category_id,
      stock: cameraData.stock,
      deposit: cameraData.deposit,
      description: cameraData.description || null,
      short_description: cameraData.short_description || null,
    }

    // Try to add new fields, but don't fail if they don't exist
    const cameraDataToSave: any = { ...basicCameraData }

    try {
      cameraDataToSave.package_contents = JSON.stringify(cameraData.package_contents || [])
      cameraDataToSave.images = JSON.stringify(cameraData.images || [])
    } catch (error) {
      console.log("New columns not available yet, using basic data only")
    }

    // Save or update camera
    if (id) {
      const { error } = await supabase.from("cameras").update(cameraDataToSave).eq("id", id)
      if (error) {
        console.error("Update error:", error)
        throw error
      }
    } else {
      const { data, error } = await supabase.from("cameras").insert(cameraDataToSave).select().single()
      if (error) {
        console.error("Insert error:", error)
        throw error
      }
      cameraId = data.id
    }

    // Handle compatible film IDs
    if (filmIds && cameraId) {
      // Delete existing compatible film IDs
      const { error: deleteError } = await supabase.from("camera_compatible_films").delete().eq("camera_id", cameraId)
      if (deleteError) {
        console.error("Error deleting compatible film IDs:", deleteError)
      }

      // Insert new compatible film IDs
      if (filmIds.length > 0) {
        const relationsToInsert = filmIds.map((film_id) => ({
          camera_id: cameraId,
          film_id,
        }))

        if (relationsToInsert.length > 0) {
          const { error } = await supabase.from("camera_compatible_films").insert(relationsToInsert)
          if (error) {
            console.error("Error inserting compatible film IDs:", error)
            throw error
          }
        }
      }
    }

    // Handle pricing tiers
    if (cameraData.pricing_tiers && cameraId) {
      // Delete existing pricing tiers
      const { error: deleteError } = await supabase.from("pricing_tiers").delete().eq("camera_id", cameraId)
      if (deleteError) {
        console.error("Error deleting pricing tiers:", deleteError)
      }

      // Insert new pricing tiers
      if (cameraData.pricing_tiers.length > 0) {
        const tiersToInsert = cameraData.pricing_tiers
          .filter((tier) => tier.min_days && tier.price_per_day > 0)
          .map((tier) => ({
            camera_id: cameraId,
            min_days: tier.min_days,
            price_per_day: tier.price_per_day,
          }))

        if (tiersToInsert.length > 0) {
          const { error } = await supabase.from("pricing_tiers").insert(tiersToInsert)
          if (error) {
            console.error("Error inserting pricing tiers:", error)
            throw error
          }
        }
      }
    }

    // Handle serial numbers
    if (cameraData.serial_numbers && cameraId) {
      // Delete existing serial numbers
      const { error: deleteError } = await supabase.from("serial_numbers").delete().eq("camera_id", cameraId)
      if (deleteError) {
        console.error("Error deleting serial numbers:", deleteError)
      }

      // Insert new serial numbers
      if (cameraData.serial_numbers.length > 0) {
        const numbersToInsert = cameraData.serial_numbers
          .filter((sn) => sn.serial_number.trim())
          .map((sn) => ({
            camera_id: cameraId,
            serial_number: sn.serial_number.trim(),
            status: sn.status || "active",
          }))

        if (numbersToInsert.length > 0) {
          const { error } = await supabase.from("serial_numbers").insert(numbersToInsert)
          if (error) {
            console.error("Error inserting serial numbers:", error)
            throw error
          }
        }
      }
    }

    revalidatePath("/cameras")
    revalidatePath(`/cameras/edit/${cameraId}`)

    return {
      success: true,
      message: "Fotoaparát byl úspěšně uložen.",
      cameraId: cameraId,
      isNewCamera: isNewCamera,
    }
  } catch (error: any) {
    console.error("Supabase error:", error)
    return {
      success: false,
      message: `Nepodařilo se uložit data: ${error.message}`,
    }
  }
}

export async function deleteCamera(cameraId: string) {
  const supabase = createClient()

  try {
    // First delete related data (pricing tiers and serial numbers will be deleted automatically due to CASCADE)
    // But let's be explicit about it
    await supabase.from("pricing_tiers").delete().eq("camera_id", cameraId)
    await supabase.from("serial_numbers").delete().eq("camera_id", cameraId)
    await supabase.from("camera_compatible_films").delete().eq("camera_id", cameraId)

    // Delete the camera
    const { error } = await supabase.from("cameras").delete().eq("id", cameraId)

    if (error) {
      console.error("Delete error:", error)
      throw error
    }

    revalidatePath("/cameras")
    return { success: true, message: "Fotoaparát byl úspěšně smazán." }
  } catch (error: any) {
    console.error("Delete error:", error)
    return { success: false, message: `Nepodařilo se smazat fotoaparát: ${error.message}` }
  }
}

export async function duplicateCamera(cameraId: string) {
  const supabase = createClient()

  try {
    // Get the original camera with all related data
    const { data: originalCamera, error: fetchError } = await supabase
      .from("cameras")
      .select(`
        *,
        pricing_tiers(*),
        serial_numbers(*),
        camera_compatible_films(*)
      `)
      .eq("id", cameraId)
      .single()

    if (fetchError || !originalCamera) {
      throw new Error("Nepodařilo se načíst původní fotoaparát")
    }

    // Prepare new camera data
    const newCameraData = {
      name: `${originalCamera.name} (kopie)`,
      status: "draft" as const,
      category_id: originalCamera.category_id,
      stock: originalCamera.stock,
      deposit: originalCamera.deposit,
      description: originalCamera.description,
      short_description: originalCamera.short_description,
    }

    // Try to include new fields if they exist
    try {
      if (originalCamera.package_contents) {
        newCameraData.package_contents = originalCamera.package_contents
      }
      if (originalCamera.images) {
        newCameraData.images = originalCamera.images
      }
    } catch (error) {
      console.log("New columns not available for duplication")
    }

    // Insert new camera
    const { data: newCamera, error: insertError } = await supabase
      .from("cameras")
      .insert(newCameraData)
      .select()
      .single()

    if (insertError || !newCamera) {
      throw insertError || new Error("Nepodařilo se vytvořit kopii")
    }

    // Copy pricing tiers
    if (originalCamera.pricing_tiers && originalCamera.pricing_tiers.length > 0) {
      const newPricingTiers = originalCamera.pricing_tiers.map((tier: any) => ({
        camera_id: newCamera.id,
        min_days: tier.min_days,
        price_per_day: tier.price_per_day,
      }))

      const { error: tiersError } = await supabase.from("pricing_tiers").insert(newPricingTiers)
      if (tiersError) {
        console.error("Error copying pricing tiers:", tiersError)
      }
    }

    // Copy serial numbers (but make them unique)
    if (originalCamera.serial_numbers && originalCamera.serial_numbers.length > 0) {
      const newSerialNumbers = originalCamera.serial_numbers.map((sn: any, index: number) => ({
        camera_id: newCamera.id,
        serial_number: `${sn.serial_number}-COPY-${index + 1}`,
        status: sn.status || "active",
      }))

      const { error: serialError } = await supabase.from("serial_numbers").insert(newSerialNumbers)
      if (serialError) {
        console.error("Error copying serial numbers:", serialError)
      }
    }

    // Copy compatible film IDs
    if (originalCamera.camera_compatible_films && originalCamera.camera_compatible_films.length > 0) {
      const newFilmRelations = originalCamera.camera_compatible_films.map((film: any) => ({
        camera_id: newCamera.id,
        film_id: film.film_id,
      }))

      const { error: filmError } = await supabase.from("camera_compatible_films").insert(newFilmRelations)
      if (filmError) {
        console.error("Error copying compatible film IDs:", filmError)
      }
    }

    revalidatePath("/cameras")
    return { success: true, message: "Fotoaparát byl úspěšně duplikován.", newCameraId: newCamera.id }
  } catch (error: any) {
    console.error("Duplicate error:", error)
    return { success: false, message: `Nepodařilo se duplikovat fotoaparát: ${error.message}` }
  }
}
