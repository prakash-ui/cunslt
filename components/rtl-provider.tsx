"use client"

import type React from "react"

import { useEffect } from "react"
import type { Locale } from "@/i18n-config"

interface RTLProviderProps {
  locale: Locale
  children: React.ReactNode
}

export function RTLProvider({ locale, children }: RTLProviderProps) {
  useEffect(() => {
    // Set the dir attribute on the html element
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"

    // Add a class to the body for RTL-specific styling
    if (locale === "ar") {
      document.body.classList.add("rtl")
    } else {
      document.body.classList.remove("rtl")
    }

    return () => {
      // Clean up
      document.body.classList.remove("rtl")
    }
  }, [locale])

  return <>{children}</>
}

