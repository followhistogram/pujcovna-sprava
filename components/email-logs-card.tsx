import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

interface EmailLog {
  id: string
  reservation_id: string
  template_name: string
  recipient_email: string
  subject: string
  status: "sent" | "failed" | "pending"
  sent_at: string
  error_message?: string
  created_at: string
}

interface EmailLogsCardProps {
  reservationId: string
  logs: EmailLog[]
}

export function EmailLogsCard({ reservationId, logs }: EmailLogsCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Odesláno
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Chyba</Badge>
      case "pending":
        return <Badge variant="secondary">Čeká</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Historie e-mailů
        </CardTitle>
        <CardDescription>Přehled odeslaných e-mailů pro tuto rezervaci</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{log.subject}</p>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Příjemce: {log.recipient_email}</p>
                  <p className="text-sm text-muted-foreground mb-1">Šablona: {log.template_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.sent_at
                      ? `Odesláno: ${format(new Date(log.sent_at), "d. M. yyyy HH:mm", { locale: cs })}`
                      : `Vytvořeno: ${format(new Date(log.created_at), "d. M. yyyy HH:mm", { locale: cs })}`}
                  </p>
                  {log.error_message && <p className="text-xs text-red-600 mt-1">Chyba: {log.error_message}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Zatím nebyly odeslány žádné e-maily</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
