"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/ui/star-rating"
import { RankingBadge } from "@/components/expert/ranking-badge"
import { RankingDetails } from "@/components/expert/ranking-details"
import { formatCurrency, getInitials } from "@/lib/utils"
import { MapPin, Calendar, Clock, CheckCircle } from "lucide-react"

interface ExpertProfileProps {
  expert: any
  skills: any[]
  reviews: any[]
  availability: any[]
  isOwnProfile?: boolean
  isVerified: boolean
  ranking?: {
    overall_score: number
    review_score: number
    completion_score: number
    response_score: number
    booking_score: number
    verification_bonus: number
  }
}

export function ExpertProfile({
  expert,
  skills,
  reviews,
  availability,
  isOwnProfile = false,
  isVerified,
  ranking,
}: ExpertProfileProps) {
  const [activeTab, setActiveTab] = useState("about")

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={expert.profile_image || ""} alt={expert.title} />
                <AvatarFallback>{getInitials(expert.title)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{expert.title}</h1>
                {isVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
                {ranking && ranking.overall_score > 0 && <RankingBadge score={ranking.overall_score} />}
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{expert.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <StarRating rating={expert.rating || 0} />
                <span className="text-sm text-muted-foreground">({expert.review_count || 0} reviews)</span>
              </div>
              <div className="text-xl font-bold text-primary">{formatCurrency(expert.hourly_rate)}/hour</div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2">
              {isOwnProfile ? (
                <>
                  <Link href="/expert/edit-profile">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/expert/availability">
                    <Button variant="outline" className="w-full">
                      Manage Availability
                    </Button>
                  </Link>
                  {!isVerified && (
                    <Link href="/expert/verification">
                      <Button variant="default" className="w-full">
                        Get Verified
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href={`/book/${expert.id}`}>
                    <Button className="w-full">Book Consultation</Button>
                  </Link>
                  <Link href={`/messages?expert=${expert.id}`}>
                    <Button variant="outline" className="w-full">
                      Contact
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          {ranking && <TabsTrigger value="ranking">Ranking</TabsTrigger>}
        </TabsList>
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              <p className="whitespace-pre-line">{expert.bio}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Experience</h2>
              <p className="whitespace-pre-line">{expert.experience}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Education</h2>
              <p className="whitespace-pre-line">{expert.education}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No reviews yet.</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user_image || ""} alt={review.user_name} />
                        <AvatarFallback>{getInitials(review.user_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user_name}</p>
                        <p className="text-sm text-muted-foreground">{review.created_at}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="mt-4">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Availability</h2>
              {availability.length === 0 ? (
                <p className="text-muted-foreground">No availability set.</p>
              ) : (
                <div className="space-y-4">
                  {availability.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-4 p-3 border rounded-md">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{slot.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {ranking && (
          <TabsContent value="ranking" className="space-y-6">
            <RankingDetails ranking={ranking} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

