import { getCachedData } from "./redis-cache"

// Supported currencies
export const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },
]

// Default currency
export const defaultCurrency = "USD"

// Fetch exchange rates from API
async function fetchExchangeRates(baseCurrency = "USD"): Promise<Record<string, number>> {
  try {
    // This would typically use a real API like Open Exchange Rates or Fixer.io
    // For demo purposes, we'll use a mock implementation

    // In a real implementation, you would use:
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
    // const data = await response.json()
    // return data.rates

    // Mock exchange rates (relative to USD)
    const mockRates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.5,
      CAD: 1.36,
      AUD: 1.52,
      INR: 83.12,
      CNY: 7.19,
      BRL: 5.05,
      MXN: 16.73,
    }

    // If base currency is not USD, recalculate rates
    if (baseCurrency !== "USD") {
      const baseRate = mockRates[baseCurrency]
      const newRates: Record<string, number> = {}

      for (const [currency, rate] of Object.entries(mockRates)) {
        newRates[currency] = rate / baseRate
      }

      return newRates
    }

    return mockRates
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    // Return a fallback with just the base currency at rate 1
    return { [baseCurrency]: 1 }
  }
}

// Get exchange rates with caching
export async function getExchangeRates(baseCurrency = "USD"): Promise<Record<string, number>> {
  const cacheKey = `exchange_rates:${baseCurrency}`

  return getCachedData(
    cacheKey,
    () => fetchExchangeRates(baseCurrency),
    // Cache for 24 hours
    60 * 60 * 24,
  )
}

// Convert amount from one currency to another
export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount

  const rates = await getExchangeRates(fromCurrency)
  const rate = rates[toCurrency]

  if (!rate) {
    throw new Error(`Exchange rate not available for ${toCurrency}`)
  }

  return amount * rate
}

// Format currency for display
export function formatCurrency(amount: number, currencyCode: string, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

