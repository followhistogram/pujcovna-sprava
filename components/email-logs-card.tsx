import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/server"
import { AlertCircle, CheckCircle2 } from "lucide-react"

async function getEmailLogs(reservationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching email logs:", error)
    return []
  }
  return data
}

export async function EmailLogsCard({ reservationId }: { reservationId: string }) {
  const logs = await getEmailLogs(reservationId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historie e-mailů</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Zatím nebyly odeslány žádné e-maily.</p>
        ) : (
          <ul className="space-y-4">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start space-x-3">
                <div>
                  {log.status === "sent" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{log.subject}</p>
                    <Badge variant={log.status === "sent" ? "default" : "destructive"} className="capitalize">
                      {log.status === "sent" ? "Odesláno" : "Chyba"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString("cs-CZ")}</p>
                  {log.status === "failed" && log.error_message && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-red-500 mt-1 cursor-pointer truncate">
                            Důvod: {log.error_message}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{log.error_message}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
