"use client"

import Image from "next/image"
import { useState } from "react"

interface AccessibleImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  longDescription?: string
}

export function AccessibleImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  longDescription,
}: AccessibleImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="relative">
      {!isLoaded && !error && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-muted ${className}`}
          style={{ width, height }}
          aria-hidden="true"
        >
          <div className="animate-pulse h-full w-full bg-muted-foreground/10"></div>
        </div>
      )}

      {error ? (
        <div
          className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
          style={{ width, height }}
          role="img"
          aria-label={alt}
        >
          Image failed to load
        </div>
      ) : (
        <>
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            priority={priority}
          />
          {longDescription && (
            <details className="mt-1 text-sm text-muted-foreground">
              <summary className="cursor-pointer">Image description</summary>
              <p className="mt-1 pl-4">{longDescription}</p>
            </details>
          )}
        </>
      )}
    </div>
  )
}

