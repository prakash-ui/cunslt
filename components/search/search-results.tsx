"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StarRating } from "@/components/ui/star-rating"
import { formatCurrency } from "@/lib/utils"
import { Clock, MapPin } from "lucide-react"

interface SearchResultsProps {
  experts: any[]
  loading: boolean
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

export function SearchResults({ experts, loading, pagination, onPageChange }: SearchResultsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <SearchResultsSkeleton />
  }

  if (loading) {
    return <SearchResultsSkeleton />
  }

  if (experts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No experts found</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Button asChild>
          <Link href="/search">Clear Search</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.pageSize + 1}-
          {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} experts
        </p>
      </div>

      <div className="space-y-4">
        {experts.map((expert) => (
          <Card key={expert.id} className="overflow-hidden">
            <CardContent className="p-0">
              <Link href={`/experts/${expert.id}`} className="block hover:bg-muted/50 transition-colors">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                  {/* Expert Image */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-20 w-20 rounded-md">
                      <AvatarImage src={expert.user_profiles?.profile_image || ""} alt={expert.title} />
                      <AvatarFallback className="rounded-md">
                        {expert.title
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Expert Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-medium">{expert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {expert.user_profiles?.first_name} {expert.user_profiles?.last_name}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <StarRating rating={expert.average_rating || 0} />
                        <span className="ml-1 text-sm text-muted-foreground">({expert.review_count || 0})</span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                      {expert.categories?.slice(0, 3).map((cat: any) => (
                        <Badge key={cat.expert_categories.id} variant="outline">
                          {cat.expert_categories.name}
                        </Badge>
                      ))}
                      {expert.categories && expert.categories.length > 3 && (
                        <Badge variant="outline">+{expert.categories.length - 3} more</Badge>
                      )}
                    </div>

                    {/* Short Bio */}
                    <p className="text-sm line-clamp-2">{expert.bio}</p>

                    {/* Bottom Info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-1">
                      {expert.expert_rates?.hourly_rate && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{formatCurrency(expert.expert_rates.hourly_rate)}/hour</span>
                        </div>
                      )}
                      {expert.country && (
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>{expert.country}</span>
                        </div>
                      )}
                      {expert.languages && expert.languages.length > 0 && (
                        <div>
                          {expert.languages.slice(0, 2).join(", ")}
                          {expert.languages.length > 2 && ` +${expert.languages.length - 2} more`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page, and pages around current page
                return page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1
              })
              .map((page, index, array) => {
                // Add ellipsis between non-consecutive pages
                const showEllipsis = index > 0 && page - array[index - 1] > 1

                return (
                  <div key={page} className="flex items-center space-x-2">
                    {showEllipsis && <span className="px-2">...</span>}
                    <Button
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  </div>
                )
              })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-48" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col sm:flex-row gap-4">
                {/* Expert Image Skeleton */}
                <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />

                {/* Expert Info Skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Categories Skeleton */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>

                  {/* Bio Skeleton */}
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />

                  {/* Bottom Info Skeleton */}
                  <div className="flex flex-wrap gap-4 pt-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  )
}

