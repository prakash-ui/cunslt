import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from the cron job
    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Update all expert rankings
    const { error } = await supabase.rpc("update_all_expert_rankings")

    if (error) {
      console.error("Error updating expert rankings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Expert rankings updated successfully" })
  } catch (error: any) {
    console.error("Error updating expert rankings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

