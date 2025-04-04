"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff } from "lucide-react"

export default function OfflinePageClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <WifiOff className="h-16 w-16 text-gray-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">You're offline</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        It looks like you've lost your internet connection. Please check your connection and try again.
      </p>
      <div className="space-y-4">
        <Button onClick={() => window.location.reload()}>
          <Wifi className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <div>
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

