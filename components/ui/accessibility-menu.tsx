"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accessibility, ZoomIn, Type, Contrast, Moon, Sun } from "lucide-react"

export function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [dyslexicFont, setDyslexicFont] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const applyAccessibilitySettings = () => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`

    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }

    // Apply dyslexic font
    if (dyslexicFont) {
      document.documentElement.classList.add("dyslexic-font")
    } else {
      document.documentElement.classList.remove("dyslexic-font")
    }

    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save settings to localStorage
    localStorage.setItem(
      "accessibility",
      JSON.stringify({
        fontSize,
        highContrast,
        reducedMotion,
        dyslexicFont,
        darkMode,
      }),
    )
  }

  // Load settings from localStorage on component mount
  useState(() => {
    const savedSettings = localStorage.getItem("accessibility")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setFontSize(settings.fontSize || 100)
      setHighContrast(settings.highContrast || false)
      setReducedMotion(settings.reducedMotion || false)
      setDyslexicFont(settings.dyslexicFont || false)
      setDarkMode(settings.darkMode || false)

      // Apply saved settings
      document.documentElement.style.fontSize = `${settings.fontSize}%`
      if (settings.highContrast) document.documentElement.classList.add("high-contrast")
      if (settings.reducedMotion) document.documentElement.classList.add("reduced-motion")
      if (settings.dyslexicFont) document.documentElement.classList.add("dyslexic-font")
      if (settings.darkMode) document.documentElement.classList.add("dark")
    }
  })

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-4 right-4 z-50"
                aria-label="Accessibility options"
              >
                <Accessibility className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Accessibility options</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
          <DialogDescription>
            Customize your experience to make the site more accessible for your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ZoomIn className="h-4 w-4" />
                <Label htmlFor="font-size">Font Size: {fontSize}%</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFontSize(100)
                  applyAccessibilitySettings()
                }}
              >
                Reset
              </Button>
            </div>
            <Slider
              id="font-size"
              min={75}
              max={200}
              step={5}
              value={[fontSize]}
              onValueChange={(value) => {
                setFontSize(value[0])
                applyAccessibilitySettings()
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Contrast className="h-4 w-4" />
            <Label htmlFor="high-contrast">High Contrast</Label>
            <div className="flex-1"></div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={(checked) => {
                setHighContrast(checked)
                applyAccessibilitySettings()
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M12 16V16.01M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Label htmlFor="reduced-motion">Reduced Motion</Label>
            <div className="flex-1"></div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={(checked) => {
                setReducedMotion(checked)
                applyAccessibilitySettings()
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Type className="h-4 w-4" />
            <Label htmlFor="dyslexic-font">Dyslexia-friendly Font</Label>
            <div className="flex-1"></div>
            <Switch
              id="dyslexic-font"
              checked={dyslexicFont}
              onCheckedChange={(checked) => {
                setDyslexicFont(checked)
                applyAccessibilitySettings()
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <div className="flex-1"></div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked)
                applyAccessibilitySettings()
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

