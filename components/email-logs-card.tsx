"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

interface EmailLog {
  id: string
  template_name: string
  recipient: string
  subject: string
  status: "sent" | "failed" | "pending"
  sent_at: string
  error_message?: string
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
        return <Mail className="h-4 w-4" />
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

  const getTemplateName = (templateName: string) => {
    const templates = {
      reservation_confirmation: "Potvrzení rezervace",
      payment_reminder: "Připomínka platby",
      dispatch_notification: "Oznámení o expedici",
      return_reminder: "Připomínka vrácení",
    }
    return templates[templateName as keyof typeof templates] || templateName
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Historie e-mailů
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Zatím nebyly odeslány žádné e-maily</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-1">{getStatusIcon(log.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-medium truncate">{getTemplateName(log.template_name)}</h4>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Příjemce: {log.recipient}</p>
                  <p className="text-sm text-muted-foreground mb-2">Předmět: {log.subject}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.sent_at), "d. M. yyyy HH:mm", { locale: cs })}
                    </p>
                  </div>
                  {log.error_message && <p className="text-xs text-red-600 mt-1">Chyba: {log.error_message}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
