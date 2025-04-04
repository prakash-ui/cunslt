"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { submitArticleFeedback } from "@/app/actions/knowledge-base"
import { toast } from "@/components/ui/use-toast"

interface ArticleFeedbackProps {
  articleId: string
}

export function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFeedback = async (helpful: boolean) => {
    setIsHelpful(helpful)
  }

  const handleSubmit = async () => {
    if (isHelpful === null) return

    setIsSubmitting(true)

    try {
      const result = await submitArticleFeedback(articleId, isHelpful, comment)

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Thank you for your feedback!",
          description: "Your input helps us improve our knowledge base.",
        })
      } else {
        toast({
          title: "Error submitting feedback",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="mt-8 rounded-lg border p-4 text-center">
        <p className="text-muted-foreground">Thank you for your feedback!</p>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-lg border p-4">
      <h3 className="mb-4 text-center font-medium">Was this article helpful?</h3>

      <div className="mb-4 flex justify-center gap-4">
        <Button variant={isHelpful === true ? "default" : "outline"} size="sm" onClick={() => handleFeedback(true)}>
          <ThumbsUp className="mr-2 h-4 w-4" />
          Yes
        </Button>
        <Button variant={isHelpful === false ? "default" : "outline"} size="sm" onClick={() => handleFeedback(false)}>
          <ThumbsDown className="mr-2 h-4 w-4" />
          No
        </Button>
      </div>

      {isHelpful !== null && (
        <>
          <Textarea
            placeholder={isHelpful ? "What did you find most helpful?" : "How can we improve this article?"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4"
            rows={3}
          />

          <div className="flex justify-center">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Submit Feedback
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

