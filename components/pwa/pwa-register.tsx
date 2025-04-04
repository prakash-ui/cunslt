"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PWARegister() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches

    if (isStandalone) {
      return // App is already installed
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the default browser install prompt
      e.preventDefault()
      // Save the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install button
      setIsInstallable(true)
    })

    // Clean up
    return () => {
      window.removeEventListener("beforeinstallprompt", () => {})
    }
  }, [])

  const handleInstallClick = () => {
    setShowInstallPrompt(true)
  }

  const handleInstallConfirm = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt
      setDeferredPrompt(null)
      setIsInstallable(false)
    })

    setShowInstallPrompt(false)
  }

  if (!isInstallable) return null

  return (
    <>
      <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1" onClick={handleInstallClick}>
        <Download className="h-4 w-4" />
        Install App
      </Button>

      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Cunslt App</DialogTitle>
            <DialogDescription>Install Cunslt on your device for a better experience. You'll get:</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Faster Access</h4>
                <p className="text-sm text-muted-foreground">Launch directly from your home screen</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Offline Support</h4>
                <p className="text-sm text-muted-foreground">Access some features even without internet</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Native Experience</h4>
                <p className="text-sm text-muted-foreground">Enjoy a more app-like experience</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstallPrompt(false)}>
              Not Now
            </Button>
            <Button onClick={handleInstallConfirm}>Install</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

