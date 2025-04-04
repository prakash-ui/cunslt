"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/ui/star-rating"
import { ReviewResponseForm } from "@/components/expert/review-response-form"
import { getInitials } from "@/lib/utils"
import { useEffect } from "react"
import { getExpertReviewsWithResponses } from "@/app/actions/reviews"

export default function ExpertReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getExpertReviewsWithResponses()
        setReviews(data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
        <p>Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">You don't have any reviews yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user_image || ""} alt={review.user_name} />
                      <AvatarFallback>{getInitials(review.user_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.user_name}</p>
                      <p className="text-sm text-muted-foreground">{review.created_at}</p>
                      <p className="text-sm text-muted-foreground">
                        Consultation on {review.booking_date} ({review.booking_time})
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.comment && (
                  <div>
                    <p className="font-medium text-sm mb-1">Review:</p>
                    <p>{review.comment}</p>
                  </div>
                )}

                {review.response ? (
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">Your Response:</p>
                      <p className="text-xs text-muted-foreground">{review.response.created_at}</p>
                    </div>
                    <p className="text-sm mb-2">{review.response.response}</p>

                    {respondingTo === review.id ? (
                      <ReviewResponseForm
                        reviewId={review.id}
                        existingResponse={review.response.response}
                        onCancel={() => setRespondingTo(null)}
                      />
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setRespondingTo(review.id)}>
                        Edit Response
                      </Button>
                    )}
                  </div>
                ) : respondingTo === review.id ? (
                  <ReviewResponseForm reviewId={review.id} onCancel={() => setRespondingTo(null)} />
                ) : (
                  <Button onClick={() => setRespondingTo(review.id)}>Respond to Review</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

