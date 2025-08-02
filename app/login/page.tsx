"use client"

import { useActionState } from "react"
import { signIn } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Film } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Film className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Přihlášení do administrace</CardTitle>
          <CardDescription>Zadejte své přihlašovací údaje</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="vas@email.cz" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Přihlašuji..." : "Přihlásit se"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
