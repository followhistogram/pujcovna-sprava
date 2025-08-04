"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, ExternalLink } from "lucide-react"
import { format } from "date-fns"

interface EmailLog {
  id: string
  created_at: string
  email_type: string
  recipient: string
  subject: string
  status: "sent" | "failed" | "pending"
  error_message?: string
}

interface EmailLogsCardProps {
  reservationId: string
  logs: EmailLog[]
}

export function EmailLogsCard({ reservationId, logs = [] }: EmailLogsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Odesláno"
      case "failed":
        return "Chyba"
      case "pending":
        return "Čeká"
      default:
        return status
    }
  }

  const getEmailTypeText = (type: string) => {
    const types: Record<string, string> = {
      confirmation: "Potvrzení rezervace",
      reminder: "Připomínka",
      invoice: "Faktura",
      shipping: "Informace o dopravě",
      return_reminder: "Připomínka vrácení",
    }
    return types[type] || type
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
              <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getEmailTypeText(log.email_type)}</span>
                    <Badge className={getStatusColor(log.status)}>{getStatusText(log.status)}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">Příjemce: {log.recipient}</div>
                  <div className="text-sm text-muted-foreground">Předmět: {log.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "d. M. yyyy HH:mm")}
                  </div>
                  {log.error_message && (
                    <div className="text-xs text-red-600 dark:text-red-400">Chyba: {log.error_message}</div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Zatím nebyly odeslány žádné e-maily</p>
            <p className="text-sm">E-maily se zobrazí po jejich odeslání</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
