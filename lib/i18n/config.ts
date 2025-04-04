export const defaultLocale = "en"

export const locales = ["en", "es", "fr", "de", "ja"]

export const localeNames = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
}

export type Locale = (typeof locales)[number]

export interface Dictionary {
  [key: string]: string | Dictionary
}

export function getNestedValue(obj: Dictionary, path: string): string {
  const keys = path.split(".")
  let result: any = obj

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key]
    } else {
      return path // Return the path if the key doesn't exist
    }
  }

  return typeof result === "string" ? result : path
}

