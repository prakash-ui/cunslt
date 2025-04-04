"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewForm } from "./review-form"

interface ReviewPromptProps {
  consultationId: string
  expertName: string
  onDismiss?: () => void
}

export function ReviewPrompt({ consultationId, expertName, onDismiss }: ReviewPromptProps) {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate your consultation with {expertName}</CardTitle>
          <CardDescription>
            Your feedback helps other users make informed decisions and helps experts improve their services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm
            consultationId={consultationId}
            onSuccess={() => {
              if (onDismiss) onDismiss()
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How was your consultation?</CardTitle>
        <CardDescription>
          Your consultation is complete. Would you like to leave a review for {expertName}?
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onDismiss}>
          Maybe Later
        </Button>
        <Button onClick={() => setShowForm(true)}>Leave a Review</Button>
      </CardFooter>
    </Card>
  )
}

