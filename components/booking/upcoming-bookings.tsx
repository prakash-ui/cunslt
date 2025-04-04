"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUpcomingBookings } from "@/app/actions/bookings"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials } from "@/lib/utils"
import { Calendar, Clock } from "lucide-react"

export function UpcomingBookings() {
  const [bookings, setBookings] = useState<{ clientBookings: any[]; expertBookings: any[] }>({
    clientBookings: [],
    expertBookings: [],
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsData = await getUpcomingBookings()
        setBookings(bookingsData)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load upcoming bookings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
          <CardDescription>Loading your upcoming consultations...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const hasClientBookings = bookings.clientBookings.length > 0
  const hasExpertBookings = bookings.expertBookings.length > 0
  const hasNoBookings = !hasClientBookings && !hasExpertBookings

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Consultations</CardTitle>
        <CardDescription>Your scheduled consultations in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {hasNoBookings && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">You don't have any upcoming consultations.</p>
            <Button asChild className="mt-4">
              <Link href="/search">Find an Expert</Link>
            </Button>
          </div>
        )}

        {hasClientBookings && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">As Client</h3>
            {bookings.clientBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage
                        src={booking.experts.user_profiles.profile_image || ""}
                        alt={booking.experts.title}
                      />
                      <AvatarFallback>{getInitials(booking.experts.title)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{booking.experts.title}</h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href={`/bookings/${booking.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasExpertBookings && (
          <div className={`space-y-4 ${hasClientBookings ? "mt-6" : ""}`}>
            <h3 className="text-sm font-medium">As Expert</h3>
            {bookings.expertBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage
                        src={booking.user_profiles.profile_image || ""}
                        alt={`${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`}
                      />
                      <AvatarFallback>
                        {getInitials(`${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {booking.user_profiles.first_name} {booking.user_profiles.last_name}
                      </h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href={`/expert/bookings/${booking.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Link href="/bookings">
          <Button variant="outline">View All Bookings</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

