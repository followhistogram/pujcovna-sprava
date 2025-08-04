// components/ImageWithFallback.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

export function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}
