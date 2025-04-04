"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { locales, localeNames } from "@/lib/i18n/config"

export function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Extract the current locale from the pathname
  const currentLocale =
    locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) || "en"

  const switchLanguage = (locale: string) => {
    // If we're on the default locale (no prefix) and switching to a different locale
    if (
      !pathname.startsWith("/en") &&
      !pathname.startsWith("/es") &&
      !pathname.startsWith("/fr") &&
      !pathname.startsWith("/de") &&
      !pathname.startsWith("/ja")
    ) {
      router.push(`/${locale}${pathname}`)
    } else {
      // Replace the current locale prefix with the new one
      const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${locale}`)
      router.push(newPathname)
    }

    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">{localeNames[currentLocale as keyof typeof localeNames]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={locale === currentLocale ? "bg-accent" : ""}
          >
            {localeNames[locale as keyof typeof localeNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

