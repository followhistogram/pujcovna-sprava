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
import { deleteCamera } from "@/app/cameras/actions"
import { toast } from "sonner"

type DeleteCameraButtonProps = {
  cameraId: string
  cameraName: string
}

export function DeleteCameraButton({ cameraId, cameraName }: DeleteCameraButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCamera(cameraId)
      if (result.success) {
        toast.success(result.message)
        setShowDialog(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Nepodařilo se smazat fotoaparát")
    } finally {
      setIsDeleting(false)
    }
  }

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
            <AlertDialogTitle>Smazat fotoaparát</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat fotoaparát "{cameraName}"? Tato akce je nevratná a smaže také všechny související
              data (ceník, výrobní čísla).
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
