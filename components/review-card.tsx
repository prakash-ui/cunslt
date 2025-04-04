import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/ui/star-rating"
import { getInitials } from "@/lib/utils"

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment?: string
    created_at: string
    user_name: string
    user_image?: string
    response?: {
      id: string
      response: string
      created_at: string
    } | null
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user_image || ""} alt={review.user_name} />
              <AvatarFallback>{getInitials(review.user_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.user_name}</p>
              <p className="text-sm text-muted-foreground">{review.created_at}</p>
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>
        {review.comment && <p className="mt-4">{review.comment}</p>}

        {review.response && (
          <div className="mt-6 pt-4 border-t">
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium">Response from expert</p>
              <p className="text-xs text-muted-foreground mb-2">{review.response.created_at}</p>
              <p className="text-sm">{review.response.response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

