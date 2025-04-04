"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageSquare,
  Trash,
  Edit,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { StarRating } from "./star-rating"
import { ReviewResponseForm } from "./review-response-form"
import { ReviewReportDialog } from "./review-report-dialog"
// import { markReviewHelpful, deleteReview, deleteReviewResponse } from "@/app/actions/reviews"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReviewCardProps {
  review: any
  currentUserId?: string
  isExpert?: boolean
  isAdmin?: boolean
  onEdit?: (reviewId: string) => void
  onDeleted?: () => void
}

export function ReviewCard({
  review,
  currentUserId,
  isExpert = false,
  isAdmin = false,
  onEdit,
  onDeleted,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingResponse, setIsDeletingResponse] = useState(false)
  const [helpfulState, setHelpfulState] = useState<"helpful" | "unhelpful" | null>(null)

  useEffect(() => {
    if (currentUserId && review.review_helpful) {
      const userMark = review.review_helpful.find((mark: any) => mark.user_id === currentUserId)

      if (userMark) {
        setHelpfulState(userMark.is_helpful ? "helpful" : "unhelpful")
      }
    }
  }, [review, currentUserId])

  const isReviewOwner = currentUserId === review.client_id
  const isReviewForCurrentExpert = isExpert && currentUserId === review.expert_id
  const canRespond = isReviewForCurrentExpert && !review.review_responses?.[0]
  const canDeleteResponse = isReviewForCurrentExpert || isAdmin

  const handleMarkHelpful = async (isHelpful: boolean) => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to mark reviews as helpful",
        variant: "destructive",
      })
      return
    }

    // try {
    //   const result = await markReviewHelpful(review.id, isHelpful)
    //   if (result.error) {
    //     toast({ title: "Error", description: result.error, variant: "destructive" })
    //   } else if (result.removed) {
    //     setHelpfulState(null)
    //   } else {
    //     setHelpfulState(isHelpful ? "helpful" : "unhelpful")
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "An unexpected error occurred",
    //     variant: "destructive",
    //   })
    // }
  }

  // const handleDeleteReview = async () => {
  //   if (!currentUserId || (!isReviewOwner && !isAdmin)) return
  //   setIsDeleting(true)

  //   try {
  //     const result = await deleteReview(review.id)
  //     if (result.error) {
  //       toast({ title: "Error", description: result.error, variant: "destructive" })
  //     } else {
  //       toast({ title: "Review deleted", description: "The review has been deleted successfully" })
  //       if (onDeleted) onDeleted()
  //     }
  //   } catch (error) {
  //     toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
  //   } finally {
  //     setIsDeleting(false)
  //   }
  // }

  // const handleDeleteResponse = async (responseId: string) => {
  //   if (!currentUserId || !canDeleteResponse) return
  //   setIsDeletingResponse(true)

  //   try {
  //     const result = await deleteReviewResponse(responseId)
  //     if (result.error) {
  //       toast({ title: "Error", description: result.error, variant: "destructive" })
  //     } else {
  //       toast({ title: "Response deleted", description: "Your response has been deleted successfully" })
  //       if (onDeleted) onDeleted()
  //     }
  //   } catch (error) {
  //     toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
  //   } finally {
  //     setIsDeletingResponse(false)
  //   }
  // }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D" />
              <AvatarFallback> || "U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium"> "Anonymous User"</div>
              <div className="flex items-center mt-1">
                <StarRating rating={5} size="sm" />
                <span className="ml-2 text-sm text-gray-500">
                  {formatDistanceToNow(new Date("2023/05/05"), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {(isReviewOwner || isAdmin) && (
            <div className="flex space-x-2">
              {isReviewOwner && onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(review.id)} title="Edit review">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Delete review">
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this review? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {}} // replace with handleDeleteReview when uncommented
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="mt-4">{review.comment}</div>

        {review.review_responses?.[0] && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <div className="flex items-start justify-between">
              <div className="font-medium">Expert Response</div>

              {canDeleteResponse && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Delete response">
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Response</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this response? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {}} // replace with handleDeleteResponse(...) when uncommented
                        disabled={isDeletingResponse}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {isDeletingResponse ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="mt-2 text-sm">{review.review_responses[0].response}</div>
            <div className="mt-2 text-xs text-gray-500">
              {formatDistanceToNow(new Date(review.review_responses[0].created_at), { addSuffix: true })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={helpfulState === "helpful" ? "text-green-600" : ""}
            onClick={() => handleMarkHelpful(true)}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={helpfulState === "unhelpful" ? "text-red-600" : ""}
            onClick={() => handleMarkHelpful(false)}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Not Helpful
          </Button>
        </div>

        <div className="flex space-x-4">
          {canRespond && (
            <Button variant="ghost" size="sm" onClick={() => setShowResponseForm(!showResponseForm)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Button>
          )}
          {!isReviewOwner && !isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => setShowReportDialog(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          )}
        </div>
      </CardFooter>

      {showResponseForm && (
        <div className="px-6 pb-6">
          <ReviewResponseForm
            reviewId={review.id}
            onSuccess={() => {
              setShowResponseForm(false)
              if (onDeleted) onDeleted()
            }}
            onCancel={() => setShowResponseForm(false)}
          />
        </div>
      )}

      <ReviewReportDialog reviewId={review.id} open={showReportDialog} onOpenChange={setShowReportDialog} />
    </Card>
  )
}
