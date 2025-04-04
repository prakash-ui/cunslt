"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
          <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            We're sorry, but we encountered a critical error. Our team has been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to homepage
            </Button>
          </div>
          {error.digest && <p className="text-xs text-muted-foreground mt-8">Error reference: {error.digest}</p>}
        </div>
      </body>
    </html>
  )
}

