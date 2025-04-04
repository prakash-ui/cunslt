"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"
import { createReview } from "@/app/actions/reviews"
import { toast } from "@/hooks/use-toast"

interface ReviewFormProps {
  bookingId: string
  expertId: string
  expertName: string
}

export function ReviewForm({ bookingId, expertId, expertName }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("bookingId", bookingId)
      formData.append("expertId", expertId)
      formData.append("rating", rating.toString())
      formData.append("comment", comment)

      await createReview(formData)

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      router.push("/bookings?success=review-submitted")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Rate your consultation with {expertName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Rating</label>
            <StarRating rating={rating} size="lg" interactive onRatingChange={setRating} />
          </div>
          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium">
              Comment (optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this expert..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

