"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/reviews/star-rating"

interface ExpertCardProps {
  expert: {
    id: string
    full_name: string
    avatar_url: string
    title?: string
    hourly_rate?: number
    average_rating?: number
    total_reviews?: number
    categories?: { name: string }[]
  }
}

export function ExpertCard({ expert }: ExpertCardProps) {
  if (!expert) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={expert.avatar_url || "/placeholder.svg?height=192&width=384"}
            alt={expert.full_name || "Expert"}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold">{expert.full_name || "Unknown Expert"}</h3>
          {expert.title && <p className="text-gray-500 mt-1">{expert.title}</p>}

          <div className="flex items-center mt-2">
            <StarRating rating={expert.average_rating || 0} size="sm" />
            <span className="ml-2 text-sm text-gray-500">
              {expert.total_reviews || 0} {expert.total_reviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {expert.categories && expert.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {expert.categories.map((category, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {expert.hourly_rate && <div className="mt-4 font-semibold">${expert.hourly_rate}/hour</div>}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-4">
        <Link href={`/experts/${expert.id}`} className="w-full">
          <Button className="w-full">View Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

