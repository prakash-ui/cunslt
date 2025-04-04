import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReviewForm } from "@/components/review-form"

interface ReviewPageProps {
  params: {
    id: string
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const supabase = createClient()

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      id,
      expert_id,
      experts (
        title,
        user_profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (!booking) {
    notFound()
  }

  // Check if booking has already been reviewed
  const { data: existingReview } = await supabase.from("reviews").select("id").eq("booking_id", params.id).single()

  if (existingReview) {
    // Redirect to bookings page with message
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Already Reviewed</h1>
          <p className="mb-4">You have already submitted a review for this booking.</p>
          <a href="/bookings" className="text-primary hover:underline">
            Return to Bookings
          </a>
        </div>
      </div>
    )
  }

  const expertName =
    booking.experts.title || `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Leave a Review</h1>
        <ReviewForm bookingId={booking.id} expertId={booking.expert_id} expertName={expertName} />
      </div>
    </div>
  )
}

