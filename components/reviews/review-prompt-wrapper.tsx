"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ReviewPrompt } from "./review-prompt"

interface ReviewPromptWrapperProps {
  consultationId: string
  expertName: string
}

export function ReviewPromptWrapper({ consultationId, expertName }: ReviewPromptWrapperProps) {
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  if (!isVisible) {
    return null
  }

  return (
    <ReviewPrompt
      consultationId={consultationId}
      expertName={expertName}
      onDismiss={() => {
        setIsVisible(false)
        router.refresh()
      }}
    />
  )
}

