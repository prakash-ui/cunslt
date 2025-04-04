"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"

interface PriceRangeFilterProps {
  minPrice: number
  maxPrice: number
  onChange: (min: number, max: number) => void
  defaultMin?: number
  defaultMax?: number
}

export function PriceRangeFilter({ minPrice, maxPrice, onChange, defaultMin, defaultMax }: PriceRangeFilterProps) {
  const [range, setRange] = useState<[number, number]>([defaultMin ?? minPrice, defaultMax ?? maxPrice])

  useEffect(() => {
    // Only update if the props change significantly
    if (Math.abs(minPrice - range[0]) > 1 || Math.abs(maxPrice - range[1]) > 1) {
      setRange([defaultMin ?? minPrice, defaultMax ?? maxPrice])
    }
  }, [minPrice, maxPrice, defaultMin, defaultMax])

  const handleChange = (values: number[]) => {
    const [min, max] = values as [number, number]
    setRange([min, max])
    onChange(min, max)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Price Range</Label>
        <div className="flex justify-between mt-1 text-sm text-gray-500">
          <span>{formatCurrency(range[0])}</span>
          <span>{formatCurrency(range[1])}</span>
        </div>
      </div>

      <Slider
        defaultValue={range}
        min={minPrice}
        max={maxPrice}
        step={5}
        value={range}
        onValueChange={handleChange}
        className="mt-6"
      />
    </div>
  )
}

