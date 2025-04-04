"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Award } from "lucide-react"

interface RankingBadgeProps {
  score: number
  showTooltip?: boolean
  className?: string
}

export function RankingBadge({ score, showTooltip = true, className }: RankingBadgeProps) {
  // Determine ranking tier based on score
  const getTier = (score: number) => {
    if (score >= 4.5) return { name: "Elite Expert", color: "bg-purple-100 text-purple-800 border-purple-200" }
    if (score >= 4.0) return { name: "Top Expert", color: "bg-blue-100 text-blue-800 border-blue-200" }
    if (score >= 3.5) return { name: "Verified Expert", color: "bg-green-100 text-green-800 border-green-200" }
    if (score >= 3.0) return { name: "Rising Expert", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    return { name: "New Expert", color: "bg-gray-100 text-gray-800 border-gray-200" }
  }

  const tier = getTier(score)

  if (!showTooltip) {
    return (
      <Badge variant="outline" className={`${tier.color} ${className}`}>
        <Award className="h-3 w-3 mr-1" />
        {tier.name}
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${tier.color} ${className} cursor-help`}>
            <Award className="h-3 w-3 mr-1" />
            {tier.name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{tier.name}</p>
            <p className="text-sm">
              This expert has an overall ranking score of {score.toFixed(1)}/5.0 based on reviews, completion rate,
              response time, and other performance metrics.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

