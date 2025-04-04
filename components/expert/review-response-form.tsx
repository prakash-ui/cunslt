"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { respondToReview } from "@/app/actions/reviews"
import { toast } from "@/hooks/use-toast"

interface ReviewResponseFormProps {
  reviewId: string
  existingResponse?: string
  onCancel?: () => void
}

export function ReviewResponseForm({ reviewId, existingResponse = "", onCancel }: ReviewResponseFormProps) {
  const [response, setResponse] = useState(existingResponse)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!response.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("reviewId", reviewId)
      formData.append("response", response)

      await respondToReview(formData)

      toast({
        title: "Response submitted",
        description: "Your response has been published",
      })

      router.refresh()
      if (onCancel) onCancel()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit response",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Write your response to this review..."
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={4}
        required
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : existingResponse ? "Update Response" : "Submit Response"}
        </Button>
      </div>
    </form>
  )
}

