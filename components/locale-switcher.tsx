"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { i18n } from "@/i18n-config"
import type { Locale } from "@/i18n-config"

const languageNames: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
}

interface LocaleSwitcherProps {
  locale: Locale
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = useCallback(
    (newLocale: string) => {
      if (!pathname) return

      // Create the new pathname with the selected locale
      const segments = pathname.split("/")
      segments[1] = newLocale
      const newPathname = segments.join("/")

      // Navigate to the new pathname
      router.push(newPathname)
      router.refresh()
    },
    [pathname, router],
  )

  return (
    <Select defaultValue={locale} onValueChange={switchLocale}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {i18n.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {languageNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

