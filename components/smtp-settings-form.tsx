"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { updateSmtpSettings } from "@/app/settings/actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

type SmtpSettings =
  | {
      id: string
      host: string | null
      port: number | null
      secure: boolean | null
      username: string | null
      from_email: string | null
      from_name: string | null
    }
  | null
  | undefined

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládání..." : "Uložit nastavení SMTP"}
    </Button>
  )
}

export function SmtpSettingsForm({ settings }: { settings: SmtpSettings }) {
  const initialState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(updateSmtpSettings, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors && Object.keys(state.errors).length > 0 ? "Chyba" : "Úspěch",
        description: state.message,
        variant: state.errors && Object.keys(state.errors).length > 0 ? "destructive" : "default",
      })
    }
  }, [state, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nastavení SMTP</CardTitle>
        <CardDescription>
          Konfigurace pro odesílání notifikačních e-mailů. Zadané heslo se uloží, ale pro bezpečnost se zde znovu
          nezobrazí.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="host">Host</Label>
              <Input id="host" name="host" defaultValue={settings?.host ?? ""} />
              {state.errors?.host && <p className="text-sm text-destructive">{state.errors.host[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" name="port" type="number" defaultValue={settings?.port ?? 587} />
              {state.errors?.port && <p className="text-sm text-destructive">{state.errors.port[0]}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Uživatelské jméno</Label>
              <Input id="username" name="username" defaultValue={settings?.username ?? ""} />
              {state.errors?.username && <p className="text-sm text-destructive">{state.errors.username[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Heslo</Label>
              <Input id="password" name="password" type="password" placeholder="Zadejte pro změnu" />
              {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from_email">E-mail odesílatele</Label>
              <Input id="from_email" name="from_email" type="email" defaultValue={settings?.from_email ?? ""} />
              {state.errors?.from_email && <p className="text-sm text-destructive">{state.errors.from_email[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="from_name">Jméno odesílatele</Label>
              <Input id="from_name" name="from_name" defaultValue={settings?.from_name ?? ""} />
              {state.errors?.from_name && <p className="text-sm text-destructive">{state.errors.from_name[0]}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="secure" name="secure" defaultChecked={settings?.secure ?? true} />
            <Label
              htmlFor="secure"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Použít zabezpečené připojení (SSL/TLS)
            </Label>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
