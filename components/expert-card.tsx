import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/ui/star-rating"
import { RankingBadge } from "@/components/expert/ranking-badge"
import { formatCurrency, getInitials } from "@/lib/utils"
import { MapPin, CheckCircle } from "lucide-react"

interface ExpertCardProps {
  expert: {
    id: string
    title: string
    bio: string
    hourly_rate: number
    location: string
    rating: number
    review_count: number
    profile_image?: string
    is_verified: boolean
    ranking_score?: number
  }
}

export function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={expert.profile_image || ""} alt={expert.title} />
            <AvatarFallback>{getInitials(expert.title)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{expert.title}</h3>
              {expert.is_verified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{expert.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={expert.rating || 0} size="sm" />
              <span className="text-xs text-muted-foreground">({expert.review_count || 0})</span>
            </div>
            {expert.ranking_score !== undefined && expert.ranking_score > 0 && (
              <RankingBadge score={expert.ranking_score} />
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground line-clamp-3">{expert.bio}</p>
        </div>
        <div className="mt-4 text-lg font-bold text-primary">{formatCurrency(expert.hourly_rate)}/hour</div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/experts/${expert.id}`} className="w-full" prefetch={false}>
          <Button variant="default" className="w-full">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

