"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createReview, updateReview } from "@/app/actions/reviews"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "./star-rating"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import type { ReviewFormData } from "@/app/types/reviews"

interface ReviewFormProps {
  consultationId: string
  existingReview?: {
    id: string
    rating: number
    comment: string
    is_anonymous: boolean
  }
  onSuccess?: () => void
}

export function ReviewForm({ consultationId, existingReview, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [isAnonymous, setIsAnonymous] = useState(existingReview?.is_anonymous || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    const formData: ReviewFormData = {
      consultation_id: consultationId,
      rating,
      comment,
      is_anonymous: isAnonymous,
    }

    try {
      const result = existingReview ? await updateReview(existingReview.id, formData) : await createReview(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: existingReview ? "Review updated" : "Review submitted",
          description: existingReview ? "Your review has been updated successfully" : "Thank you for your feedback!",
          variant: "default",
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/dashboard/reviews")
          router.refresh()
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <div className="py-2">
          <StarRating rating={rating} interactive size="lg" onChange={setRating} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this expert..."
          className="min-h-[120px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
        />
        <Label htmlFor="anonymous" className="text-sm font-normal">
          Post anonymously
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  )
}

