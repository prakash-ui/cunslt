import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, properties, timestamp, url, referrer, userAgent } = body

    // Store in Supabase
    const supabase = createClient()
    await supabase.from("analytics_events").insert({
      event,
      properties,
      timestamp,
      url,
      referrer,
      user_agent: userAgent,
      ip_address: request.ip || "",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving analytics event:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

