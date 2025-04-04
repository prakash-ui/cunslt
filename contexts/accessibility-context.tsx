"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type AccessibilityPreferences = {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
}

type AccessibilityContextType = {
  preferences: AccessibilityPreferences
  updatePreference: (key: keyof AccessibilityPreferences, value: boolean) => void
  resetPreferences: () => void
}

const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReader: false,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem("accessibility-preferences")
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (error) {
        console.error("Failed to parse accessibility preferences:", error)
      }
    }

    // Check for system preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setPreferences((prev) => ({ ...prev, reducedMotion: true }))
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("accessibility-preferences", JSON.stringify(preferences))

    // Apply preferences to document
    document.documentElement.classList.toggle("a11y-reduced-motion", preferences.reducedMotion)
    document.documentElement.classList.toggle("a11y-high-contrast", preferences.highContrast)
    document.documentElement.classList.toggle("a11y-large-text", preferences.largeText)
    document.documentElement.classList.toggle("a11y-screen-reader", preferences.screenReader)
  }, [preferences])

  const updatePreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

