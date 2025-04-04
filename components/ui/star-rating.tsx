import { Star, StarHalf } from "lucide-react"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  // Calculate full and half stars
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  // Determine star size based on prop
  const starSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size]

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          // Full star
          return <Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
        } else if (i === fullStars && hasHalfStar) {
          // Half star
          return <StarHalf key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
        } else {
          // Empty star
          return <Star key={i} className={`${starSize} text-muted-foreground`} />
        }
      })}
    </div>
  )
}

