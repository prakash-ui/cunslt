"use client"

import { useState } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/i18n/language-provider"
import { locales } from "@/i18n/config"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const currentLocale = locales.find((l) => l.code === locale)

  const changeLanguage = (newLocale: string) => {
    setLocale(newLocale)
    setOpen(false)
    
    // Remove the current locale from pathname
    const currentPath = pathname
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/')
    
    // Redirect to new locale path
    if (newLocale === 'en') {
      router.push(pathWithoutLocale)
    } else {
      router.push(`/${newLocale}${pathWithoutLocale}`)
    }
    router.refresh() // Ensure page content updates
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-flex">{currentLocale?.name}</span>
          <span className="inline-flex md:hidden">{currentLocale?.flag}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => changeLanguage(l.code)}
            className="flex items-center gap-2"
          >
            <span className="mr-1">{l.flag}</span>
            <span>{l.name}</span>
            {locale === l.code && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}