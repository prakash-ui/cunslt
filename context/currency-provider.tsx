"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { currencies, defaultCurrency, convertCurrency, formatCurrency } from "@/utils/currency"

type CurrencyContextType = {
  currency: string
  setCurrency: (currency: string) => void
  convert: (amount: number, fromCurrency?: string) => Promise<number>
  format: (amount: number, options?: { locale?: string }) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrency: () => {},
  convert: async () => 0,
  format: () => "",
})

export const useCurrency = () => useContext(CurrencyContext)

interface CurrencyProviderProps {
  children: ReactNode
  initialCurrency?: string
}

export function CurrencyProvider({ children, initialCurrency = defaultCurrency }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState(initialCurrency)

  // Save currency preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_currency", currency)
    }
  }, [currency])

  // Load currency preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCurrency = localStorage.getItem("preferred_currency")
      if (savedCurrency && currencies.some((c) => c.code === savedCurrency)) {
        setCurrency(savedCurrency)
      }
    }
  }, [])

  // Convert amount from any currency to the current currency
  const convert = async (amount: number, fromCurrency = "USD"): Promise<number> => {
    try {
      return await convertCurrency(amount, fromCurrency, currency)
    } catch (error) {
      console.error("Currency conversion error:", error)
      return amount
    }
  }

  // Format amount in the current currency
  const format = (amount: number, options?: { locale?: string }): string => {
    return formatCurrency(amount, currency, options?.locale)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>{children}</CurrencyContext.Provider>
  )
}

