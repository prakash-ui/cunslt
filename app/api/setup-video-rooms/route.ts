import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check for setup key to prevent unauthorized access
    const setupKey = request.nextUrl.searchParams.get("key")
    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Create video_rooms table
    const { error } = await supabase.rpc("create_video_rooms_table")

    if (error) {
      console.error("Error creating video_rooms table:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Video rooms table created successfully" })
  } catch (error) {
    console.error("Error in setup-video-rooms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

