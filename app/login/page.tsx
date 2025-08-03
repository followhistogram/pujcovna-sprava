import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Film } from "lucide-react"
import { login } from "./actions"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Film className="h-6 w-6" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Přihlášení do administrace</h2>
          <p className="mt-2 text-sm text-muted-foreground">Půjčovna Polaroidů</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Přihlášení</CardTitle>
            <CardDescription>Zadejte své přihlašovací údaje pro vstup do systému</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@pujcovna.cz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Heslo</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" name="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Zapamatovat si mě
                </Label>
              </div>

              {searchParams?.message && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {searchParams.message}
                </div>
              )}

              <Button type="submit" className="w-full">
                Přihlásit se
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
