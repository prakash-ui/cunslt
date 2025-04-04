"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CountryFilterProps {
  countries: string[]
  onChange: (country: string | null) => void
  defaultValue?: string | null
}

export function CountryFilter({ countries, onChange, defaultValue = null }: CountryFilterProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(defaultValue)

  useEffect(() => {
    setSelectedCountry(defaultValue)
  }, [defaultValue])

  const handleCountryChange = (value: string) => {
    const country = value === "any" ? null : value
    setSelectedCountry(country)
    onChange(country)
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Country</Label>
      <Select value={selectedCountry === null ? "any" : selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Any country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any country</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

