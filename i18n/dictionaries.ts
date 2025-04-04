import type { Locale } from "./config"

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  fr: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  de: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  zh: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  ar: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  hi: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  pt: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  ru: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
  ja: () => import("./dictionaries/en.json").then((module) => module.default), // Fallback to English for now
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en()
}

