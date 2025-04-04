"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/ui/star-rating"
import { Skeleton } from "@/components/ui/skeleton"
import { getExpertRecommendations } from "@/app/actions/search"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

export function ExpertRecommendations() {
  const { toast } = useToast()
  const [experts, setExperts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const recommendedExperts = await getExpertRecommendations(4)
        setExperts(recommendedExperts)
      } catch (error) {
        console.error("Error fetching expert recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load expert recommendations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (experts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {experts.map((expert) => (
            <Link
              key={expert.id}
              href={`/experts/${expert.id}`}
              className="flex flex-col space-y-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={expert.user_profiles?.profile_image || ""} alt={expert.title} />
                  <AvatarFallback>
                    {expert.title
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium line-clamp-1">{expert.title}</p>
                  <div className="flex items-center">
                    <StarRating rating={expert.average_rating || 0} size="sm" />
                    <span className="ml-1 text-xs text-muted-foreground">({expert.review_count || 0})</span>
                  </div>
                </div>
              </div>
              <p className="text-sm line-clamp-2">{expert.bio}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-wrap gap-1">
                  {expert.skills?.slice(0, 2).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {expert.expert_rates?.hourly_rate && (
                  <span className="text-muted-foreground">{formatCurrency(expert.expert_rates.hourly_rate)}/hr</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

