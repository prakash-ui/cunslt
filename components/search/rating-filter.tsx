"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Star } from "lucide-react"

interface RatingFilterProps {
  onChange: (rating: number | null) => void
  defaultValue?: number | null
}

export function RatingFilter({ onChange, defaultValue = null }: RatingFilterProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(defaultValue)

  const handleRatingChange = (value: string) => {
    const rating = value === "any" ? null : Number.parseInt(value, 10)
    setSelectedRating(rating)
    onChange(rating)
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Minimum Rating</Label>
      <RadioGroup
        value={selectedRating === null ? "any" : selectedRating.toString()}
        onValueChange={handleRatingChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="any" id="rating-any" />
          <Label htmlFor="rating-any" className="text-sm font-normal cursor-pointer">
            Any rating
          </Label>
        </div>

        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center space-x-2">
            <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
            <Label
              htmlFor={`rating-${rating}`}
              className="flex items-center space-x-1 text-sm font-normal cursor-pointer"
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span>{rating === 5 ? "only" : "& up"}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

