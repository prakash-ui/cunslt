import { type NextRequest, NextResponse } from "next/server"
import { sendBookingReminders } from "@/app/actions/bookings"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from the cron job
    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send reminders
    const { sent } = await sendBookingReminders()

    return NextResponse.json({ success: true, message: `Sent ${sent} booking reminders` })
  } catch (error: any) {
    console.error("Error sending booking reminders:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

