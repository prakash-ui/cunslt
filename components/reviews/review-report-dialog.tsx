"use client"

import type React from "react"

import { useState } from "react"
import { reportReview } from "@/app/actions/reviews"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewReportDialogProps {
  reviewId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewReportDialog({ reviewId, open, onOpenChange }: ReviewReportDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for reporting this review",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await reportReview({
        review_id: reviewId,
        reason,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Report submitted",
          description: "Thank you for your report. Our team will review it shortly.",
        })

        setReason("")
        onOpenChange(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Review</DialogTitle>
          <DialogDescription>
            Please provide a reason for reporting this review. Our team will review your report and take appropriate
            action.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this review is inappropriate or violates our guidelines..."
            className="min-h-[100px] mt-4"
          />

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

