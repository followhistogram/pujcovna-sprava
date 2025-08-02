"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronDown, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ReservationStatusBadge } from "@/components/reservation-status-badge"
import type { Reservation } from "@/lib/types"

type ReservationsTableProps = {
  reservations: (Reservation & { items?: any[] })[]
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filteredReservations = reservations.filter((reservation) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      reservation.short_id.toLowerCase().includes(searchLower) ||
      reservation.customer_name.toLowerCase().includes(searchLower) ||
      reservation.customer_email?.toLowerCase().includes(searchLower) ||
      reservation.customer_phone?.toLowerCase().includes(searchLower)
    )
  })

  const toggleRowExpansion = (reservationId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(reservationId)) {
      newExpanded.delete(reservationId)
    } else {
      newExpanded.add(reservationId)
    }
    setExpandedRows(newExpanded)
  }

  const renderTable = (data: (Reservation & { items?: any[] })[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>ID Rezervace</TableHead>
          <TableHead>Zákazník</TableHead>
          <TableHead>Kontakt</TableHead>
          <TableHead>Termín</TableHead>
          <TableHead>Celková cena</TableHead>
          <TableHead>Stav platby</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Akce</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((reservation) => (
            <>
              <TableRow key={reservation.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRowExpansion(reservation.id)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedRows.has(reservation.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-mono">
                  <Link href={`/reservations/${reservation.id}`} className="hover:underline">
                    {reservation.short_id}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{reservation.customer_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div>{reservation.customer_email}</div>
                  <div>{reservation.customer_phone}</div>
                </TableCell>
                <TableCell>
                  {new Date(reservation.rental_start_date).toLocaleDateString("cs-CZ")} -{" "}
                  {new Date(reservation.rental_end_date).toLocaleDateString("cs-CZ")}
                </TableCell>
                <TableCell>{reservation.total_price.toLocaleString("cs-CZ")} Kč</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{reservation.amount_paid.toLocaleString("cs-CZ")} Kč</div>
                    <div className="text-muted-foreground text-xs">
                      z {reservation.total_price.toLocaleString("cs-CZ")} Kč
                    </div>
                    <div className="mt-1">
                      {reservation.amount_paid >= reservation.total_price ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Zaplaceno
                        </span>
                      ) : reservation.amount_paid > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Částečně
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Nezaplaceno
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/reservations/${reservation.id}`}>Zobrazit detail</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Stornovat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {expandedRows.has(reservation.id) && (
                <TableRow>
                  <TableCell colSpan={9} className="bg-muted/50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Položky rezervace:</h4>
                        <div className="text-sm space-y-1">
                          {reservation.items && reservation.items.length > 0 ? (
                            reservation.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span>
                                  {item.name} ({item.quantity}x)
                                </span>
                                <span>{(item.unit_price * item.quantity).toLocaleString("cs-CZ")} Kč</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted-foreground">Žádné položky</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Detaily:</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Doprava:</span>{" "}
                            {reservation.delivery_method === "pickup"
                              ? "Osobní odběr"
                              : reservation.delivery_method === "delivery"
                                ? "Doprava na adresu"
                                : "Neuvedeno"}
                          </div>
                          <div>
                            <span className="font-medium">Platba:</span>{" "}
                            {reservation.payment_method === "card"
                              ? "Kartou online"
                              : reservation.payment_method === "bank_transfer"
                                ? "Bankovním převodem"
                                : reservation.payment_method === "cash"
                                  ? "Hotově při převzetí"
                                  : "Neuvedeno"}
                          </div>
                          <div>
                            <span className="font-medium">Zaplaceno:</span>{" "}
                            {reservation.amount_paid.toLocaleString("cs-CZ")} Kč z{" "}
                            {reservation.total_price.toLocaleString("cs-CZ")} Kč
                          </div>
                          {reservation.customer_notes && (
                            <div>
                              <span className="font-medium">Poznámka zákazníka:</span> {reservation.customer_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              {searchTerm ? "Žádné rezervace neodpovídají vašemu vyhledávání." : "Žádné rezervace v tomto stavu."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat podle ID, jména, telefonu nebo e-mailu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Zobrazeno: {filteredReservations.length} z {reservations.length}
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Vše ({filteredReservations.length})</TabsTrigger>
          <TabsTrigger value="confirmed">
            Potvrzené (
            {filteredReservations.filter((r) => r.status === "confirmed" || r.status === "ready_for_dispatch").length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktivní ({filteredReservations.filter((r) => r.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Dokončené ({filteredReservations.filter((r) => r.status === "completed" || r.status === "returned").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderTable(filteredReservations)}</TabsContent>
        <TabsContent value="confirmed">
          {renderTable(
            filteredReservations.filter((r) => r.status === "confirmed" || r.status === "ready_for_dispatch"),
          )}
        </TabsContent>
        <TabsContent value="active">
          {renderTable(filteredReservations.filter((r) => r.status === "active"))}
        </TabsContent>
        <TabsContent value="completed">
          {renderTable(filteredReservations.filter((r) => r.status === "completed" || r.status === "returned"))}
        </TabsContent>
      </Tabs>
    </>
  )
}
