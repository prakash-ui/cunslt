export const defaultLocale = "en"

export const locales = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
]

export type Locale = (typeof locales)[number]["code"]

export const getLocaleDirection = (locale: Locale) => {
  return locale === "ar" ? "rtl" : "ltr"
}

export const getLocaleFromPathname = (pathname: string): Locale => {
  const segments = pathname.split("/")
  const localeSegment = segments[1]

  if (locales.some((l) => l.code === localeSegment)) {
    return localeSegment as Locale
  }

  return defaultLocale
}

