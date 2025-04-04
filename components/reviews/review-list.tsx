"use client"

import { useState, useEffect } from "react"
import { getExpertReviews } from "@/app/actions/reviews"
import { ReviewCard } from "./review-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReviewListProps {
  expertId: string
  currentUserId?: string
  isExpert?: boolean
  isAdmin?: boolean
  initialReviews?: any[]
  initialPagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function ReviewList({
  expertId,
  currentUserId,
  isExpert = false,
  isAdmin = false,
  initialReviews,
  initialPagination,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews || [])
  const [pagination, setPagination] = useState(
    initialPagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  )
  const [isLoading, setIsLoading] = useState(!initialReviews)
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const fetchReviews = async (page = pagination.page) => {
    setIsLoading(true)
    try {
      const result = await getExpertReviews(expertId, page, pagination.limit, sortBy, sortOrder)
      if ("reviews" in result) {
        setReviews(result.reviews)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!initialReviews) {
      fetchReviews(1)
    }
  }, [expertId, initialReviews, sortBy, sortOrder])

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage)
  }

  const handleSortChange = (value: string) => {
    let newSortBy = "created_at"
    let newSortOrder: "asc" | "desc" = "desc"

    switch (value) {
      case "newest":
        newSortBy = "created_at"
        newSortOrder = "desc"
        break
      case "oldest":
        newSortBy = "created_at"
        newSortOrder = "asc"
        break
      case "highest":
        newSortBy = "rating"
        newSortOrder = "desc"
        break
      case "lowest":
        newSortBy = "rating"
        newSortOrder = "asc"
        break
    }

    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>
  }

  if (reviews.length === 0) {
    return <div className="text-center py-8">No reviews yet</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select defaultValue="newest" onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="highest">Highest rated</SelectItem>
            <SelectItem value="lowest">Lowest rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            isExpert={isExpert}
            isAdmin={isAdmin}
            onDeleted={() => fetchReviews()}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            // Show first page, last page, current page, and pages around current page
            const pageNumbers = []
            const currentPage = pagination.page
            const totalPages = pagination.totalPages

            // Always add page 1
            pageNumbers.push(1)

            // Add pages around current page
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
              pageNumbers.push(i)
            }

            // Always add last page if there is more than one page
            if (totalPages > 1) {
              pageNumbers.push(totalPages)
            }

            // Remove duplicates and sort
            return [...new Set(pageNumbers)]
              .sort((a, b) => a - b)
              .map((page) => (
                <Button
                  key={`page-${page}`}
                  variant={pagination.page === page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))
          })}

          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

