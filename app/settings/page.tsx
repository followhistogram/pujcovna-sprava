import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SmtpSettingsForm } from "@/components/smtp-settings-form"
import { EmailTemplateForm } from "@/components/email-template-form"
import { createClient } from "@/lib/supabase/server"

// Označit stránku jako dynamickou
export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createClient()

  // Načtení SMTP nastavení
  let smtpSettings = null
  try {
    const { data } = await supabase.from("smtp_settings").select("*").single()
    smtpSettings = data
  } catch (error) {
    console.error("Error fetching SMTP settings:", error)
  }

  // Načtení e-mailových šablon
  let emailTemplates: any[] = []
  try {
    const { data } = await supabase.from("email_templates").select("*").order("name")
    emailTemplates = data || []
  } catch (error) {
    console.error("Error fetching email templates:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nastavení</h1>
        <p className="text-muted-foreground">Konfigurace systému a integrace</p>
      </div>

      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList>
          <TabsTrigger value="smtp">SMTP Server</TabsTrigger>
          <TabsTrigger value="email-templates">E-mailové šablony</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Server</CardTitle>
              <CardDescription>Nastavení pro odesílání e-mailových notifikací zákazníkům</CardDescription>
            </CardHeader>
            <CardContent>
              <SmtpSettingsForm initialData={smtpSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates">
          <Card>
            <CardHeader>
              <CardTitle>E-mailové šablony</CardTitle>
              <CardDescription>Správa textů pro automatické e-mailové notifikace</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplateForm templates={emailTemplates} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
