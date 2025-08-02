import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SmtpSettingsForm } from "@/components/smtp-settings-form"
import { getSmtpSettings } from "@/app/settings/actions"

export default async function SettingsPage() {
  const smtpSettings = await getSmtpSettings()

  return (
    <div className="space-y-6">
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
    </div>
  )
}
