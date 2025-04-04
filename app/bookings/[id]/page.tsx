import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookingActions } from "@/components/booking/booking-actions"
import { BookingHistory } from "@/components/booking/booking-history"
import { CancellationPolicy } from "@/components/booking/cancellation-policy"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Calendar, Clock, DollarSign, FileText, Video } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/bookings/" + params.id)
  }

  const supabase = createClient()

  // Get booking details
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        title,
        user_profiles (
          first_name,
          last_name,
          profile_image
        )
      ),
      user_profiles (
        first_name,
        last_name,
        profile_image
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !booking) {
    notFound()
  }

  // Check if user is authorized to view this booking
  const isClient = booking.user_id === user.id
  const isExpert = booking.experts.user_id === user.id

  if (!isClient && !isExpert) {
    redirect("/bookings")
  }

  // Get available time slots for rescheduling
  const { data: availableSlots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", booking.expert_id)
    .order("day_of_week")
    .order("start_time")

  // Format available slots for the booking actions component
  const formattedSlots =
    availableSlots?.flatMap((slot) => {
      // Convert day of week to actual dates in the next 30 days
      const dates = []
      const now = new Date()
      for (let i = 0; i < 30; i++) {
        const date = new Date(now)
        date.setDate(now.getDate() + i)
        if (date.getDay() === slot.day_of_week) {
          dates.push(date.toISOString().split("T")[0])
        }
      }

      return dates.map((date) => ({
        date,
        startTime: slot.start_time,
        endTime: slot.end_time,
      }))
    }) || []

  // Check if booking can be managed (rescheduled/cancelled)
  const canManage = ["confirmed", "pending_confirmation"].includes(booking.status)

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground">
            Consultation with{" "}
            {isClient
              ? booking.experts.title
              : `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`
            ${booking.status === "confirmed" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
            ${booking.status === "pending_confirmation" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}
            ${booking.status === "cancelled" ? "bg-red-100 text-red-800 hover:bg-red-100" : ""}
            ${booking.status === "completed" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
          `}
          >
            {booking.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>

          {booking.status === "confirmed" && (
            <Link href={`/consultation/${booking.id}`}>
              <Button size="sm">
                <Video className="mr-2 h-4 w-4" />
                Join Consultation
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{formatDate(booking.date)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p>
                    {booking.duration} hour{booking.duration !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{formatCurrency(booking.amount)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Problem Statement</p>
                <div className="p-3 bg-muted rounded-md">
                  <p className="whitespace-pre-line">{booking.problem}</p>
                </div>
              </div>

              {booking.notes_client && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Client Notes</p>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-line">{booking.notes_client}</p>
                  </div>
                </div>
              )}

              {booking.notes_expert && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expert Notes</p>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-line">{booking.notes_expert}</p>
                  </div>
                </div>
              )}

              {canManage && (
                <div className="pt-4">
                  <BookingActions
                    booking={booking}
                    userRole={isClient ? "client" : "expert"}
                    availableTimeSlots={formattedSlots}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <BookingHistory bookingId={booking.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isClient ? "Expert" : "Client"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={isClient ? booking.experts.user_profiles.profile_image : booking.user_profiles.profile_image}
                    alt={
                      isClient
                        ? booking.experts.title
                        : `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`
                    }
                  />
                  <AvatarFallback>
                    {getInitials(
                      isClient
                        ? booking.experts.title
                        : `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {isClient
                      ? booking.experts.title
                      : `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isClient
                      ? `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`
                      : "Client"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                {isClient ? (
                  <Link href={`/experts/${booking.expert_id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/messages?client=${booking.user_id}`}>
                    <Button variant="outline" size="sm">
                      Message Client
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {isClient && (
            <CancellationPolicy
              policy={booking.cancellation_policy}
              deadline={booking.cancellation_deadline}
              fee={booking.cancellation_fee}
              amount={booking.amount}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Consultation Fee</span>
                  <span>{formatCurrency(booking.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(booking.tax_amount)}</span>
                </div>
                {booking.cancellation_fee > 0 && booking.status === "cancelled" && (
                  <div className="flex justify-between">
                    <span>Cancellation Fee</span>
                    <span>-{formatCurrency(booking.cancellation_fee)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(booking.amount + booking.tax_amount)}</span>
                </div>
                {booking.status === "cancelled" && (
                  <div className="flex justify-between text-green-600">
                    <span>Refunded</span>
                    <span>
                      -{formatCurrency(booking.amount + booking.tax_amount - (booking.cancellation_fee || 0))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Files & Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md">
                <div className="text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No files shared yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

