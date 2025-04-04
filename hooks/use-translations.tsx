"use client"

import { useCallback } from "react"
import { getNestedValue, type Dictionary } from "@/lib/i18n/config"

export function useTranslations(dictionary: Dictionary) {
  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = getNestedValue(dictionary, key)

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{{${paramKey}}}`, paramValue)
        })
      }

      return value
    },
    [dictionary],
  )

  return { t }
}

