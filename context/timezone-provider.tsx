"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserTimezone, formatDateToTimezone, convertDateBetweenTimezones } from "@/utils/timezone"

type TimezoneContextType = {
  timezone: string
  setTimezone: (timezone: string) => void
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
  convertDate: (date: Date | string, fromTimezone: string) => Date
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: "UTC",
  setTimezone: () => {},
  formatDate: () => "",
  convertDate: (date) => new Date(date),
})

export const useTimezone = () => useContext(TimezoneContext)

interface TimezoneProviderProps {
  children: ReactNode
  initialTimezone?: string
}

export function TimezoneProvider({ children, initialTimezone }: TimezoneProviderProps) {
  const [timezone, setTimezone] = useState(initialTimezone || getUserTimezone())

  // Save timezone preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_timezone", timezone)
    }
  }, [timezone])

  // Load timezone preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTimezone = localStorage.getItem("preferred_timezone")
      if (savedTimezone) {
        setTimezone(savedTimezone)
      }
    }
  }, [])

  // Format date in the current timezone
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    return formatDateToTimezone(date, timezone, options)
  }

  // Convert date from another timezone to the current timezone
  const convertDate = (date: Date | string, fromTimezone: string): Date => {
    return convertDateBetweenTimezones(date, fromTimezone, timezone)
  }

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, formatDate, convertDate }}>
      {children}
    </TimezoneContext.Provider>
  )
}

