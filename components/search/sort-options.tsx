"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SortOptionsProps {
  value: string
  onChange: (value: string) => void
}

export function SortOptions({ value, onChange }: SortOptionsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sort-by">Sort By</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="sort-by" className="w-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ranking">Best Match</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="price_low">Price: Low to High</SelectItem>
          <SelectItem value="price_high">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

