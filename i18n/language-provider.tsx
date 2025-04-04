"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { type Locale, defaultLocale } from "./config"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dictionary: Record<string, any>
}

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: () => "",
  dictionary: {},
})

export const useLanguage = () => useContext(LanguageContext)

interface LanguageProviderProps {
  children: ReactNode
  dictionary: Record<string, any>
  locale: Locale
}

export function LanguageProvider({ children, dictionary, locale }: LanguageProviderProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale)
  const [currentDictionary, setCurrentDictionary] = useState(dictionary)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setCurrentDictionary(dictionary)
    setCurrentLocale(locale)
  }, [dictionary, locale])

  const setLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return

    // Get the current path without the locale
    const pathWithoutLocale = pathname.replace(/^\/[^/]+/, "")

    // Navigate to the same path with the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  // Function to get a translation by key (supports nested keys like 'common.save')
  const t = (key: string): string => {
    const keys = key.split(".")
    let value = currentDictionary

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }

    return typeof value === "string" ? value : key
  }

  return (
    <LanguageContext.Provider value={{ locale: currentLocale, setLocale, t, dictionary: currentDictionary }}>
      {children}
    </LanguageContext.Provider>
  )
}

