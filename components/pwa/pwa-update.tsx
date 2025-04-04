"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Toast, ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function PWAUpdate() {
  const [showUpdateToast, setShowUpdateToast] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker)
                setShowUpdateToast(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      waitingWorker.addEventListener("statechange", () => {
        if (waitingWorker.state === "activated") {
          window.location.reload()
        }
      })
    }
  }

  if (!showUpdateToast) return null

  return (
    <ToastProvider>
      <Toast open={showUpdateToast} onOpenChange={setShowUpdateToast}>
        <div className="flex items-start gap-2">
          <RefreshCw className="h-4 w-4 mt-0.5" />
          <div className="grid gap-1">
            <ToastTitle>Update Available</ToastTitle>
            <ToastDescription>
              A new version of Cunslt is available. Update now for the latest features and improvements.
            </ToastDescription>
          </div>
        </div>
        <ToastAction asChild altText="Update Now">
          <Button size="sm" variant="default" onClick={handleUpdate}>
            Update Now
          </Button>
        </ToastAction>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

