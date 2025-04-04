"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <WifiOff className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-4">You're offline</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        It looks like you've lost your internet connection. Please check your connection and try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/">Go to Homepage</Link>
        </Button>
        <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

