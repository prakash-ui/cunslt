import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/app/actions/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the booking
    const { data: booking } = await supabase
      .from("bookings")
      .select(`
        *,
        experts (
          user_id
        )
      `)
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is either the client or the expert
    if (booking.user_id !== user.id && booking.experts.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Update booking status to in_progress if it's currently confirmed
    if (booking.status === "confirmed") {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error starting consultation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

