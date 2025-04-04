"use client"

import { useEffect } from "react"
import { trackError } from "@/lib/analytics"

export function ErrorTracker() {
  useEffect(() => {
    // Track unhandled errors
    const handleError = (event: ErrorEvent) => {
      trackError(event.error || new Error(event.message))

      // Don't prevent the default error handling
      return false
    }

    // Track unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

      trackError(error)

      // Don't prevent the default error handling
      return false
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}

