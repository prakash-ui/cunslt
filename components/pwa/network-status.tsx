"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Show alert briefly when coming back online
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showAlert) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Alert variant={isOnline ? "default" : "destructive"} className="shadow-lg">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>{isOnline ? "Back Online" : "You're Offline"}</AlertTitle>
        <AlertDescription>
          {isOnline ? "Your connection has been restored." : "Please check your internet connection."}
        </AlertDescription>
      </Alert>
    </div>
  )
}

