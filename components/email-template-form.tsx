"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { updateEmailTemplate } from "@/app/settings/actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

type EmailTemplate = {
  id: string
  name: string
  subject: string | null
  body: string | null
}

const placeholders = [
  {
    placeholder: "{{short_id}}",
    description: "Krátké ID rezervace (např. R-1001)",
  },
  {
    placeholder: "{{customer_name}}",
    description: "Celé jméno zákazníka",
  },
  {
    placeholder: "{{rental_start_date}}",
    description: "Datum začátku výpůjčky",
  },
  {
    placeholder: "{{rental_end_date}}",
    description: "Datum konce výpůjčky",
  },
  {
    placeholder: "{{total_price}}",
    description: "Celková cena rezervace",
  },
  {
    placeholder: "{{items_list}}",
    description: "HTML seznam položek v rezervaci",
  },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládání..." : "Uložit šablonu"}
    </Button>
  )
}

export function EmailTemplateForm({ template }: { template: EmailTemplate }) {
  const initialState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(updateEmailTemplate, initialState)
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form action={dispatch} className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Úprava šablony: Potvrzení rezervace</CardTitle>
            <CardDescription>
              Upravte obsah e-mailu, který se automaticky odesílá zákazníkovi po vytvoření nové rezervace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="hidden" name="name" value={template.name} />
            <div className="space-y-2">
              <Label htmlFor="subject">Předmět e-mailu</Label>
              <Input id="subject" name="subject" defaultValue={template.subject ?? ""} />
              {state.errors?.subject && <p className="text-sm text-destructive">{state.errors.subject[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Tělo e-mailu (HTML)</Label>
              <Textarea id="body" name="body" defaultValue={template.body ?? ""} rows={20} className="font-mono" />
              {state.errors?.body && <p className="text-sm text-destructive">{state.errors.body[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Dostupné zástupné znaky</CardTitle>
            <CardDescription>
              Tyto znaky budou v e-mailu automaticky nahrazeny skutečnými daty z rezervace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {placeholders.map((p) => (
                <li key={p.placeholder}>
                  <code className="font-bold bg-muted px-1 py-0.5 rounded">{p.placeholder}</code>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
