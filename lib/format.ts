import type { Locale } from "@/i18n-config"

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "numeric",
  }).format(date)
}

export function formatCurrency(amount: number, locale: Locale, currency = "USD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(number)
}

export function formatRelativeTime(date: Date, locale: Locale): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second")
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute")
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour")
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, "day")
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, "month")
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return rtf.format(-diffInYears, "year")
}

