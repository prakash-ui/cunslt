import { getExpertReviews, getExpertReviewStats } from "@/app/actions/reviews"
import { ReviewStatsComponent } from "@/components/reviews/review-stats"
import { ReviewList } from "@/components/reviews/review-list"
import { getCurrentUser } from "@/app/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpertReviewsSectionProps {
  expertId: string
}

export async function ExpertReviewsSection({ expertId }: ExpertReviewsSectionProps) {
  const statsResult = await getExpertReviewStats(expertId)
  const reviewsResult = await getExpertReviews(expertId, 1, 5)
  const currentUser = await getCurrentUser()

  const stats = "stats" in statsResult ? statsResult.stats : null
  const reviews = "reviews" in reviewsResult ? reviewsResult.reviews : []
  const pagination = "pagination" in reviewsResult ? reviewsResult.pagination : null

  const hasReviews = reviews && reviews.length > 0

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ratings & Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <ReviewStatsComponent expertId={expertId} initialStats={stats} />
            </div>
            <div className="md:col-span-2">
              {hasReviews ? (
                <ReviewList
                  expertId={expertId}
                  currentUserId={currentUser?.id}
                  initialReviews={reviews}
                  initialPagination={pagination}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to leave a review!</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

