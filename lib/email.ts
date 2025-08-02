import nodemailer from "nodemailer"
import { createClient } from "@/lib/supabase/server"
import type { Reservation, ReservationItem } from "@/lib/types"

// Helper to generate an HTML list from reservation items
function generateItemsList(items: ReservationItem[]): string {
  return items.map((item) => `<li>${item.quantity}x ${item.name} - ${item.unit_price} Kč/ks</li>`).join("")
}

// Helper to format dates
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Main function to parse and replace placeholders
function parseTemplate(template: string, data: Record<string, any>): string {
  let parsedTemplate = template

  // Handle complex placeholders first
  if (data.items && template.includes("{{items_list}}")) {
    parsedTemplate = parsedTemplate.replace("{{items_list}}", generateItemsList(data.items))
  }

  // Handle simple placeholders
  for (const key in data) {
    const placeholder = `{{${key}}}`
    let value = data[key]

    // Format dates if they match common keys
    if ((key === "rental_start_date" || key === "rental_end_date") && typeof value === "string") {
      value = formatDate(value)
    }

    // Ensure value is a string or number before replacing
    if (typeof value === "string" || typeof value === "number") {
      parsedTemplate = parsedTemplate.replace(new RegExp(placeholder, "g"), String(value))
    }
  }

  return parsedTemplate
}

async function logEmail(
  supabase: ReturnType<typeof createClient>,
  logData: {
    reservation_id?: string
    template_name: string
    recipient: string
    subject: string
    status: "sent" | "failed"
    error_message?: string
    provider_message_id?: string
  },
) {
  const { error } = await supabase.from("email_logs").insert(logData)
  if (error) {
    console.error("Failed to log email:", error)
  }
}

export async function sendEmail({
  templateName,
  recipient,
  data,
}: {
  templateName: string
  recipient: string
  data: Partial<Reservation> & { items?: ReservationItem[] }
}) {
  const supabase = createClient()

  // 1. Fetch SMTP settings
  const { data: smtpSettings, error: smtpError } = await supabase.from("smtp_settings").select("*").limit(1).single()

  if (smtpError || !smtpSettings) {
    console.error("Email Error: SMTP settings not found.", smtpError)
    return { success: false, message: "Chyba: Nastavení SMTP nebylo nalezeno." }
  }

  // 2. Fetch email template
  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("*")
    .eq("name", templateName)
    .eq("is_active", true)
    .limit(1)
    .single()

  if (templateError || !template || !template.subject || !template.body) {
    console.error(`Email Error: Template "${templateName}" not found or is incomplete.`, templateError)
    return { success: false, message: `Chyba: Šablona "${templateName}" nebyla nalezena nebo je neúplná.` }
  }

  // 3. Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpSettings.host,
    port: smtpSettings.port,
    secure: smtpSettings.secure,
    auth: {
      user: smtpSettings.username,
      pass: smtpSettings.password, // Password should be decrypted if stored encrypted
    },
  })

  // 4. Parse subject and body
  const subject = parseTemplate(template.subject, data)
  const html = parseTemplate(template.body, data)

  // 5. Define mail options
  const mailOptions = {
    from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
    to: recipient,
    subject: subject,
    html: html,
  }

  // 6. Send email and log the result
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email "${templateName}" sent to ${recipient}. Message ID: ${info.messageId}`)
    await logEmail(supabase, {
      reservation_id: data.id,
      template_name: templateName,
      recipient,
      subject,
      status: "sent",
      provider_message_id: info.messageId,
    })
    return { success: true, message: "E-mail byl úspěšně odeslán." }
  } catch (error: any) {
    console.error(`Email Error: Failed to send email to ${recipient}.`, error)
    await logEmail(supabase, {
      reservation_id: data.id,
      template_name: templateName,
      recipient,
      subject,
      status: "failed",
      error_message: error.message,
    })
    return { success: false, message: `Chyba při odesílání e-mailu: ${error.message}` }
  }
}
