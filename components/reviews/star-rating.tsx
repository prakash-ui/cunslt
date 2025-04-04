"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [currentRating, setCurrentRating] = useState(rating)

  useEffect(() => {
    setCurrentRating(rating)
  }, [rating])

  const handleClick = (index: number) => {
    if (!interactive) return

    const newRating = index + 1
    setCurrentRating(newRating)
    onChange?.(newRating)
  }

  const handleMouseEnter = (index: number) => {
    if (!interactive) return
    setHoverRating(index + 1)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(0)
  }

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4"
      case "lg":
        return "h-8 w-8"
      case "md":
      default:
        return "h-6 w-6"
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(maxRating)].map((_, index) => {
        const isActive = index < (hoverRating || currentRating)

        return (
          <Star
            key={index}
            className={cn(
              getSizeClass(),
              "cursor-default transition-all",
              isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              interactive && "cursor-pointer",
            )}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          />
        )
      })}
    </div>
  )
}

