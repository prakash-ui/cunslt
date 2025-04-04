import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/app/actions/auth"
import { checkConsultationAccess, getVideoToken, createVideoRoom } from "@/lib/video-service"
import VideoRoom from "@/components/consultation/video-room"
import ConsultationFiles from "@/components/consultation/consultation-files"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ConsultationPageProps {
  params: {
    bookingId: string
  }
}

async function ConsultationContent({ bookingId }: { bookingId: string }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login?callbackUrl=/consultation/" + bookingId)
  }

  // Check if user has access to this consultation
  const accessCheck = await checkConsultationAccess(bookingId)
  if (!accessCheck.authorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>{accessCheck.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/bookings">Return to Bookings</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const supabase = createClient()

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        title,
        user_profiles (
          first_name,
          last_name
        )
      ),
      user_profiles (
        first_name,
        last_name
      )
    `)
    .eq("id", bookingId)
    .single()

  if (!booking) {
    notFound()
  }

  // Check if video room exists, create if not
  const { data: videoRoom } = await supabase.from("video_rooms").select("*").eq("booking_id", bookingId).single()

  let roomData = videoRoom

  if (!roomData) {
    // Create a new video room
    await createVideoRoom(bookingId)

    // Get the newly created room
    const { data: newRoom } = await supabase.from("video_rooms").select("*").eq("booking_id", bookingId).single()

    if (!newRoom) {
      throw new Error("Failed to create video room")
    }

    roomData = newRoom
  }

  // Get token for the user
  const { token, roomUrl } = await getVideoToken(bookingId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Consultation with{" "}
            {booking.user_id === user.id
              ? `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`
              : `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`}
          </h1>
          <p className="text-muted-foreground">
            {new Date(booking.date).toLocaleDateString()} at {booking.start_time} - {booking.end_time}
          </p>
        </div>
      </div>

      <VideoRoom token={token} roomUrl={roomUrl} bookingId={bookingId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Problem Statement</h3>
                <p className="text-sm mt-1">{booking.problem}</p>
              </div>
              <div>
                <h3 className="font-medium">Duration</h3>
                <p className="text-sm mt-1">{booking.duration} hour(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ConsultationFiles bookingId={bookingId} />
      </div>
    </div>
  )
}

export default function ConsultationPage({ params }: ConsultationPageProps) {
  const { bookingId } = params

  return (
    <div className="container py-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <ConsultationContent bookingId={bookingId} />
      </Suspense>
    </div>
  )
}

