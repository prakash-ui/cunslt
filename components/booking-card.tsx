import type React from "react"
import Link from "next/link"
import type { Booking } from "@/app/types"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { joinConsultation } from "@/app/actions/bookings"

interface BookingCardProps {
  booking: Booking
  showReviewButton?: boolean
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, showReviewButton = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking ID: {booking.id}</CardTitle>
        <CardDescription>Status: {booking.status}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Consultation Date: {booking.consultationDate}</p>
        <p>Consultation Time: {booking.consultationTime}</p>
        {booking.notes && <p>Notes: {booking.notes}</p>}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>{/* Add any additional information or actions here */}</div>
        <div className="flex gap-2">
          {(booking.status === "confirmed" || booking.status === "in_progress") && (
            <form action={joinConsultation}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <Button type="submit">Join Consultation</Button>
            </form>
          )}

          {showReviewButton && booking.status === "completed" && !booking.isReviewed && (
            <Link href={`/bookings/review/${booking.id}`}>
              <Button variant="outline">Leave Review</Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default BookingCard

