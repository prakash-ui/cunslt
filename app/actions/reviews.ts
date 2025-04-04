"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createReview({
  consultationId,
  rating,
  comment,
}: {
  consultationId: string
  rating: number
  comment: string
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if consultation exists and belongs to the user
    const consultation = await db.consultation.findUnique({
      where: {
        id: consultationId,
        userId: user.id,
        status: "completed",
      },
      include: {
        expert: true,
      },
    })

    if (!consultation) {
      return { success: false, error: "Consultation not found or not completed" }
    }

    // Check if review already exists
    const existingReview = await db.review.findFirst({
      where: {
        consultationId,
        userId: user.id,
      },
    })

    if (existingReview) {
      return { success: false, error: "You have already reviewed this consultation" }
    }

    // Create the review
    const review = await db.review.create({
      data: {
        rating,
        comment,
        consultationId,
        userId: user.id,
        expertId: consultation.expert.id,
      },
    })

    // Update expert's average rating
    const expertReviews = await db.review.findMany({
      where: {
        expertId: consultation.expert.id,
      },
      select: {
        rating: true,
      },
    })

    const totalRating = expertReviews.reduce((sum:any, review:any) => sum + review.rating, 0)
    const averageRating = totalRating / expertReviews.length

    await db.expert.update({
      where: {
        id: consultation.expert.id,
      },
      data: {
        averageRating,
        reviewCount: expertReviews.length,
      },
    })

    // Create notification for expert
    await db.notification.create({
      data: {
        userId: consultation.expert.userId,
        type: "REVIEW",
        title: "New Review",
        message: `${user.name} left a ${rating}-star review on your consultation.`,
        read: false,
        data: {
          reviewId: review.id,
          consultationId,
        },
      },
    })

    revalidatePath(`/consultations/${consultationId}`)
    revalidatePath(`/experts/${consultation.expert.id}`)

    return { success: true, review }
  } catch (error) {
    console.error("Error creating review:", error)
    return { success: false, error: "Failed to create review" }
  }
}

export async function updateReview({
  reviewId,
  rating,
  comment,
}: {
  reviewId: string
  rating: number
  comment: string
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if review exists and belongs to the user
    const review = await db.review.findUnique({
      where: {
        id: reviewId,
        userId: user.id,
      },
      include: {
        consultation: {
          include: {
            expert: true,
          },
        },
      },
    })

    if (!review) {
      return { success: false, error: "Review not found" }
    }

    // Update the review
    const updatedReview = await db.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment,
      },
    })

    // Update expert's average rating
    const expertReviews = await db.review.findMany({
      where: {
        expertId: review.consultation.expert.id,
      },
      select: {
        rating: true,
      },
    })

    const totalRating = expertReviews.reduce((sum:any, review:any) => sum + review.rating, 0)
    const averageRating = totalRating / expertReviews.length

    await db.expert.update({
      where: {
        id: review.consultation.expert.id,
      },
      data: {
        averageRating,
      },
    })

    revalidatePath(`/consultations/${review.consultationId}`)
    revalidatePath(`/experts/${review.consultation.expert.id}`)

    return { success: true, review: updatedReview }
  } catch (error) {
    console.error("Error updating review:", error)
    return { success: false, error: "Failed to update review" }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if review exists and belongs to the user
    const review = await db.review.findUnique({
      where: {
        id: reviewId,
        userId: user.id,
      },
      include: {
        consultation: {
          include: {
            expert: true,
          },
        },
      },
    })

    if (!review) {
      return { success: false, error: "Review not found" }
    }

    // Delete the review
    await db.review.delete({
      where: {
        id: reviewId,
      },
    })

    // Update expert's average rating
    const expertReviews = await db.review.findMany({
      where: {
        expertId: review.consultation.expert.id,
      },
      select: {
        rating: true,
      },
    })

    if (expertReviews.length > 0) {
      const totalRating = expertReviews.reduce((sum:any, review:any) => sum + review.rating, 0)
      const averageRating = totalRating / expertReviews.length

      await db.expert.update({
        where: {
          id: review.consultation.expert.id,
        },
        data: {
          averageRating,
          reviewCount: expertReviews.length,
        },
      })
    } else {
      await db.expert.update({
        where: {
          id: review.consultation.expert.id,
        },
        data: {
          averageRating: 0,
          reviewCount: 0,
        },
      })
    }

    revalidatePath(`/consultations/${review.consultationId}`)
    revalidatePath(`/experts/${review.consultation.expert.id}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

export async function respondToReview({
  reviewId,
  response,
}: {
  reviewId: string
  response: string
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if review exists
    const review = await db.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        expert: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    })

    if (!review) {
      return { success: false, error: "Review not found" }
    }

    // Check if user is the expert
    if (review.expert.userId !== user.id) {
      return { success: false, error: "Only the expert can respond to this review" }
    }

    // Update the review with the response
    const updatedReview = await db.review.update({
      where: {
        id: reviewId,
      },
      data: {
        expertResponse: response,
        expertResponseDate: new Date(),
      },
    })

    // Create notification for the reviewer
    await db.notification.create({
      data: {
        userId: review.userId,
        type: "REVIEW_RESPONSE",
        title: "Response to Your Review",
        message: `${review.expert.user.name} responded to your review.`,
        read: false,
        data: {
          reviewId,
          consultationId: review.consultationId,
        },
      },
    })

    revalidatePath(`/consultations/${review.consultationId}`)
    revalidatePath(`/experts/${review.expertId}`)

    return { success: true, review: updatedReview }
  } catch (error) {
    console.error("Error responding to review:", error)
    return { success: false, error: "Failed to respond to review" }
  }
}

export async function reportReview({
  reviewId,
  reason,
  details,
}: {
  reviewId: string
  reason: string
  details: string
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if review exists
    const review = await db.review.findUnique({
      where: {
        id: reviewId,
      },
    })

    if (!review) {
      return { success: false, error: "Review not found" }
    }

    // Create the report
    const report = await db.reviewReport.create({
      data: {
        reviewId,
        reporterId: user.id,
        reason,
        details,
        status: "pending",
      },
    })

    // Create notification for admins
    const admins = await db.user.findMany({
      where: {
        role: "ADMIN",
      },
    })

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "REVIEW_REPORT",
          title: "New Review Report",
          message: `A review has been reported for ${reason}.`,
          read: false,
          data: {
            reportId: report.id,
            reviewId,
          },
        },
      })
    }

    return { success: true, report }
  } catch (error) {
    console.error("Error reporting review:", error)
    return { success: false, error: "Failed to report review" }
  }
}

export async function getExpertReviewsWithResponses(expertId: string) {
  try {
    const reviews = await db.review.findMany({
      where: {
        expertId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        consultation: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, reviews }
  } catch (error) {
    console.error("Error getting expert reviews:", error)
    return { success: false, error: "Failed to get expert reviews" }
  }
}

