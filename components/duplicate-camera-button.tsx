"use client"

import { useState } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { duplicateCamera } from "@/app/cameras/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type DuplicateCameraButtonProps = {
  cameraId: string
}

export function DuplicateCameraButton({ cameraId }: DuplicateCameraButtonProps) {
  const [isDuplicating, setIsDuplicating] = useState(false)
  const router = useRouter()

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const result = await duplicateCamera(cameraId)
      if (result.success) {
        toast.success(result.message)
        if (result.newCameraId) {
          router.push(`/cameras/edit/${result.newCameraId}`)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Nepodařilo se duplikovat fotoaparát")
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        handleDuplicate()
      }}
      disabled={isDuplicating}
    >
      {isDuplicating ? "Duplikování..." : "Duplikovat"}
    </DropdownMenuItem>
  )
}
