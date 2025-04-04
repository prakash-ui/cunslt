import type { Locale, Dictionary } from "./config"
import { defaultLocale } from "./config"

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  fr: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  de: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  ja: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    return await dictionaries[locale]()
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error)
    return await dictionaries[defaultLocale]()
  }
}

