"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateReservationStatus } from "@/app/reservations/actions"
import { ReservationStatus } from "@/lib/types"
import type { Reservation } from "@/lib/types"

const initialState = {
  message: "",
  error: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládání..." : "Uložit změnu"}
    </Button>
  )
}

export function ReservationStatusUpdater({ reservation }: { reservation: Reservation }) {
  const [state, formAction] = useFormState(updateReservationStatus, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.error) {
        toast.error(state.message)
      } else {
        toast.success(state.message)
      }
    }
  }, [state])

  return (
    <form action={formAction} className="flex items-center gap-4">
      <input type="hidden" name="id" value={reservation.id} />
      <Select name="status" defaultValue={reservation.status}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Vyberte stav" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ReservationStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SubmitButton />
    </form>
  )
}
