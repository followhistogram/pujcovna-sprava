"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Zod schema for validation
const SmtpSettingsSchema = z.object({
  host: z.string().min(1, "Host je povinný."),
  port: z.coerce.number().int().positive("Port musí být kladné číslo."),
  secure: z.preprocess((val) => val === "on" || val === true, z.boolean()),
  username: z.string().min(1, "Uživatelské jméno je povinné."),
  password: z.string().optional(), // Optional, so it's not updated if left blank
  from_email: z.string().email("Neplatný formát e-mailu."),
  from_name: z.string().min(1, "Jméno odesílatele je povinné."),
})

export async function getSmtpSettings() {
  const supabase = createClient()
  const { data } = await supabase.from("smtp_settings").select("*").limit(1).single()
  return data
}

export async function updateSmtpSettings(prevState: any, formData: FormData) {
  const supabase = createClient()

  const validatedFields = SmtpSettingsSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Chyba validace. Zkontrolujte zadané údaje.",
    }
  }

  const { password, ...rest } = validatedFields.data

  const dataToUpsert: { [key: string]: any } = rest

  // Only include password in the update if a new one was provided
  if (password && password.length > 0) {
    // NOTE: In a real-world application, you must encrypt the password before saving it.
    dataToUpsert.password = password
  }

  const existingSettings = await getSmtpSettings()

  let result
  if (existingSettings) {
    result = await supabase.from("smtp_settings").update(dataToUpsert).eq("id", existingSettings.id).select().single()
  } else {
    result = await supabase.from("smtp_settings").insert(dataToUpsert).select().single()
  }

  if (result.error) {
    return { message: `Chyba při ukládání: ${result.error.message}` }
  }

  revalidatePath("/settings")
  return { message: "Nastavení SMTP úspěšně uloženo.", errors: {} }
}

// Schema for email template validation
const EmailTemplateSchema = z.object({
  name: z.string(),
  subject: z.string().min(1, "Předmět je povinný."),
  body: z.string().min(1, "Tělo e-mailu je povinné."),
})

export async function getEmailTemplate(name: string) {
  const supabase = createClient()
  const { data } = await supabase.from("email_templates").select("*").eq("name", name).limit(1).single()
  return data
}

export async function updateEmailTemplate(prevState: any, formData: FormData) {
  const supabase = createClient()

  const validatedFields = EmailTemplateSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Chyba validace. Zkontrolujte zadané údaje.",
    }
  }

  const { name, ...rest } = validatedFields.data

  const { error } = await supabase.from("email_templates").update(rest).eq("name", name)

  if (error) {
    return { message: `Chyba při ukládání šablony: ${error.message}` }
  }

  revalidatePath("/settings")
  return { message: "Šablona e-mailu byla úspěšně uložena.", errors: {} }
}
