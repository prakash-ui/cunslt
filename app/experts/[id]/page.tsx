import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, Calendar, Clock, MapPin, Award, ThumbsUp, MessageSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface ExpertPageProps {
  params: {
    id: string
  }
}

export default async function ExpertPage({ params }: ExpertPageProps) {
  const { id } = params
  const supabase = createClient()

  // Fetch expert data
  const { data: expert, error } = await supabase
    .from("experts")
    .select(`
      *,
      profiles:profile_id (
        id,
        user_id,
        full_name,
        avatar_url,
        bio
      ),
      reviews (
        id,
        rating,
        comment,
        created_at,
        client:client_id (
          full_name,
          avatar_url
        )
      ),
      expert_categories (
        category
      ),
      expert_availability (
        day_of_week,
        start_time,
        end_time
      ),
      expert_services (
        id,
        title,
        description,
        price,
        duration
      )
    `)
    .eq("id", id)
    .single()

  if (error || !expert) {
    notFound()
  }

  // Calculate average rating
  const totalReviews = expert.reviews.length
  const averageRating =
    totalReviews > 0 ? expert.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews : 0

  // Format categories
  const categories = expert.expert_categories.map((cat: any) => cat.category)

  // Group availability by day
  const availabilityByDay: Record<string, { start_time: string; end_time: string }[]> = {}

  expert.expert_availability.forEach((slot: any) => {
    if (!availabilityByDay[slot.day_of_week]) {
      availabilityByDay[slot.day_of_week] = []
    }
    availabilityByDay[slot.day_of_week].push({
      start_time: slot.start_time,
      end_time: slot.end_time,
    })
  })

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="container py-6 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Expert Profile Card */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={expert.profiles.avatar_url} alt={expert.profiles.full_name} />
                  <AvatarFallback>{expert.profiles.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{expert.profiles.full_name}</h1>
                <p className="text-muted-foreground mb-2">{expert.title}</p>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
                      )}
                    />
                  ))}
                  <span className="ml-2">
                    {averageRating.toFixed(1)} ({totalReviews})
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 justify-center mb-6">
                  {categories.map((category: string) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="w-full space-y-2 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>${expert.hourly_rate}/hour</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{expert.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{expert.completion_rate || 98}% Completion Rate</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button asChild className="w-full">
                    <Link href={`/booking/${expert.id}`}>Book Now</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/messages/new?expert=${expert.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expert Details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    <p>{expert.profiles.bio || "No bio provided."}</p>
                  </div>

                  {expert.experience && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Experience</h3>
                      <p>{expert.experience}</p>
                    </div>
                  )}

                  {expert.education && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Education</h3>
                      <p>{expert.education}</p>
                    </div>
                  )}

                  {expert.certifications && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {expert.certifications.split(",").map((cert: string) => (
                          <Badge key={cert} variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {cert.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                  <CardDescription>Book a specific service or hourly consultation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {expert.expert_services.length > 0 ? (
                      expert.expert_services.map((service: any) => (
                        <Card key={service.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h3 className="font-semibold">{service.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                                <div className="flex items-center mt-2">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="text-sm">{service.duration} minutes</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center md:items-end gap-2">
                                <p className="font-semibold">${service.price}</p>
                                <Button asChild size="sm">
                                  <Link href={`/booking/${expert.id}?service=${service.id}`}>Book Service</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">This expert offers hourly consultations only.</p>
                        <Button asChild className="mt-4">
                          <Link href={`/booking/${expert.id}`}>Book Consultation</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>The expert's regular availability. Book to see specific time slots.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {dayNames.map((day) => {
                      const slots = availabilityByDay[day] || []
                      return (
                        <div key={day} className="flex items-center">
                          <div className="w-1/3 font-medium">{day}</div>
                          <div className="w-2/3">
                            {slots.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {slots.map((slot, index) => (
                                  <Badge key={index} variant="outline">
                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not available</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button asChild>
                      <Link href={`/booking/${expert.id}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Check Availability & Book
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Reviews</CardTitle>
                  <CardDescription>
                    {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expert.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {expert.reviews.map((review: any) => (
                        <div key={review.id} className="pb-6 border-b last:border-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.client.avatar_url} alt={review.client.full_name} />
                              <AvatarFallback>{review.client.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="font-semibold">{review.client.full_name}</h4>
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={cn(
                                          "h-4 w-4",
                                          i < review.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-muted-foreground",
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No reviews yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

