import { createClient } from "@/lib/supabase/client"

export async function uploadCameraImage(file: File, cameraId: string): Promise<string | null> {
  const supabase = createClient()

  // Create unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${cameraId}/${Date.now()}.${fileExt}`

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("camera-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return null
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("camera-images").getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Upload error:", error)
    return null
  }
}

export async function deleteCameraImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Handle different URL formats
    let filePath: string | null = null

    // Check if it's a placeholder image
    if (imageUrl.includes("/placeholder.svg") || imageUrl.startsWith("/placeholder")) {
      console.log("Skipping deletion of placeholder image")
      return true
    }

    // Check if it's a valid URL
    try {
      const url = new URL(imageUrl)

      // Extract file path from Supabase storage URL
      if (url.pathname.includes("/camera-images/")) {
        filePath = url.pathname.split("/camera-images/")[1]
      } else if (url.pathname.includes("/storage/v1/object/public/camera-images/")) {
        filePath = url.pathname.split("/storage/v1/object/public/camera-images/")[1]
      }
    } catch (urlError) {
      // If it's not a valid URL, it might be just a file path
      if (imageUrl.startsWith("camera-images/")) {
        filePath = imageUrl.replace("camera-images/", "")
      } else if (imageUrl.includes("/")) {
        // Try to extract path from various formats
        const parts = imageUrl.split("/")
        const cameraImagesIndex = parts.findIndex((part) => part === "camera-images")
        if (cameraImagesIndex !== -1 && cameraImagesIndex < parts.length - 1) {
          filePath = parts.slice(cameraImagesIndex + 1).join("/")
        }
      }
    }

    if (!filePath) {
      console.error("Could not extract file path from URL:", imageUrl)
      return false
    }

    console.log("Attempting to delete file:", filePath)

    const { error } = await supabase.storage.from("camera-images").remove([filePath])

    if (error) {
      console.error("Storage delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete error:", error)
    return false
  }
}

export async function listCameraImages(cameraId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("camera-images").list(cameraId)

    if (error) {
      console.error("List error:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("List error:", error)
    return []
  }
}

export async function uploadInventoryImage(
  file: File,
  itemId: string,
  bucket: "camera-images" | "inventory-images",
): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${itemId}/${Date.now()}.${fileExt}`

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })
    if (error) throw error
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return publicUrl
  } catch (error) {
    console.error("Upload error:", error)
    return null
  }
}

export async function deleteInventoryImage(
  imageUrl: string,
  bucket: "camera-images" | "inventory-images",
): Promise<boolean> {
  const supabase = createClient()
  try {
    const url = new URL(imageUrl)
    const filePath = url.pathname.split(`/${bucket}/`)[1]
    if (!filePath) return false
    const { error } = await supabase.storage.from(bucket).remove([filePath])
    return !error
  } catch (error) {
    console.error("Delete error:", error)
    return false
  }
}
