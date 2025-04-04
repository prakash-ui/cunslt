"use client"

import { useState } from "react"
import { Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAccessibility } from "@/contexts/accessibility-context"

export function AccessibilitySettings() {
  const [open, setOpen] = useState(false)
  const { preferences, updatePreference, resetPreferences } = useAccessibility()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Accessibility Settings">
          <Accessibility className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
          <DialogDescription>Customize your experience to make the platform more accessible.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => updatePreference("reducedMotion", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreference("highContrast", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text">Larger Text</Label>
              <p className="text-sm text-muted-foreground">Increase text size for better readability</p>
            </div>
            <Switch
              id="large-text"
              checked={preferences.largeText}
              onCheckedChange={(checked) => updatePreference("largeText", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader">Screen Reader Optimized</Label>
              <p className="text-sm text-muted-foreground">Enhance compatibility with screen readers</p>
            </div>
            <Switch
              id="screen-reader"
              checked={preferences.screenReader}
              onCheckedChange={(checked) => updatePreference("screenReader", checked)}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetPreferences}>
            Reset to Default
          </Button>
          <Button onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

