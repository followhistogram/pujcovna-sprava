"use client"

import { useState } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteInventoryItem } from "@/app/inventory/actions"
import { toast } from "sonner"

type DeleteInventoryItemButtonProps = {
  itemId: string
  itemName: string
  itemType: "film" | "accessory"
  tableName: "films" | "accessories"
}

export function DeleteInventoryItemButton({ itemId, itemName, itemType, tableName }: DeleteInventoryItemButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteInventoryItem(tableName, itemId)
      if (result.success) {
        toast.success(result.message)
        setShowDialog(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(`Nepodařilo se smazat ${itemType === "film" ? "film" : "příslušenství"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const itemTypeLabel = itemType === "film" ? "film" : "příslušenství"

  return (
    <>
      <DropdownMenuItem
        className="text-destructive"
        onSelect={(e) => {
          e.preventDefault()
          setShowDialog(true)
        }}
      >
        Smazat
      </DropdownMenuItem>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat {itemTypeLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat {itemTypeLabel} "{itemName}"? Tato akce je nevratná.
              {itemType === "film" && (
                <span className="block mt-2 text-amber-600">
                  Pozor: Pokud je tento film přiřazen k nějakému fotoaparátu, může to způsobit problémy.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Mazání..." : "Smazat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
