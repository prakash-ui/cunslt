"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "./star-rating"
import { getExpertReviewStats } from "@/app/actions/reviews"
import type { ReviewStats } from "@/app/types/reviews"

interface ReviewStatsProps {
  expertId: string
  initialStats?: ReviewStats
}

export function ReviewStatsComponent({ expertId, initialStats }: ReviewStatsProps) {
  const [stats, setStats] = useState<ReviewStats | null>(initialStats || null)
  const [isLoading, setIsLoading] = useState(!initialStats)

  useEffect(() => {
    if (!initialStats) {
      const fetchStats = async () => {
        setIsLoading(true)
        try {
          const result = await getExpertReviewStats(expertId)
          if ("stats" in result) {
            setStats(result.stats)
          }
        } catch (error) {
          console.error("Error fetching review stats:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchStats()
    }
  }, [expertId, initialStats])

  if (isLoading) {
    return <div className="text-center py-4">Loading statistics...</div>
  }

  if (!stats) {
    return <div className="text-center py-4">No review statistics available</div>
  }

  const { average_rating, total_reviews, rating_distribution } = stats

  // Calculate percentages for the progress bars
  const getPercentage = (count: number) => {
    return total_reviews > 0 ? (count / total_reviews) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{average_rating.toFixed(1)}</h3>
          <div className="flex items-center mt-1">
            <StarRating rating={average_rating} size="sm" />
            <span className="ml-2 text-sm text-gray-500">
              {total_reviews} {total_reviews === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center">
            <div className="w-12 text-sm">{rating} star</div>
            <Progress
              value={getPercentage(rating_distribution[rating as keyof typeof rating_distribution])}
              className="h-2 mx-2 flex-1"
            />
            <div className="w-12 text-sm text-right">
              {rating_distribution[rating as keyof typeof rating_distribution]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

