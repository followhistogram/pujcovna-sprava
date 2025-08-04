import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SmtpSettingsForm } from "@/components/smtp-settings-form"
import { getSmtpSettings, getEmailTemplate } from "@/app/settings/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailTemplateForm } from "@/components/email-template-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  let smtpSettings = null
  let reservationConfirmationTemplate = null

  try {
    smtpSettings = await getSmtpSettings()
    reservationConfirmationTemplate = await getEmailTemplate("reservation_confirmation")
  } catch (error) {
    console.error("Error loading settings:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nastavení</h1>
        <p className="text-muted-foreground">Konfigurace systému a integrace</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Profil & SMTP</TabsTrigger>
          <TabsTrigger value="templates">E-mailové šablony</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Správa vašeho profilu a obecných notifikací.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Celé jméno</Label>
                  <Input id="fullName" defaultValue="Admin Půjčovny" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@pujcovna.cz" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Notifikace</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-new-reservation" defaultChecked />
                    <label
                      htmlFor="email-new-reservation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email o nové rezervaci
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-low-stock" defaultChecked />
                    <label
                      htmlFor="email-low-stock"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email o nízkém stavu zásob
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sms-urgent" />
                    <label
                      htmlFor="sms-urgent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      SMS pro urgentní události (např. storno na poslední chvíli)
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Uložit změny profilu</Button>
            </CardFooter>
          </Card>
          <SmtpSettingsForm settings={smtpSettings} />
        </TabsContent>
        <TabsContent value="templates">
          {reservationConfirmationTemplate ? (
            <EmailTemplateForm template={reservationConfirmationTemplate} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Chyba</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Šablona pro potvrzení rezervace nebyla nalezena. Spusťte prosím SQL skript pro její vytvoření.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
