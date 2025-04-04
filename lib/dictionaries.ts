import "server-only"
import type { Locale } from "../i18n-config"

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  es: () => import("../dictionaries/es.json").then((module) => module.default),
  fr: () => import("../dictionaries/fr.json").then((module) => module.default),
  de: () => import("../dictionaries/de.json").then((module) => module.default),
  ar: () => import("../dictionaries/ar.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  try {
    return dictionaries[locale]?.() ?? dictionaries.en()
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error)
    return dictionaries.en()
  }
}

