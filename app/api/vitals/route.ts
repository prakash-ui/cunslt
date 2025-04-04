import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    // Store in Supabase
    const supabase = createClient()
    await supabase.from("performance_metrics").insert({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      page_url: metric.attribution?.page || "",
      user_agent: request.headers.get("user-agent") || "",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving web vitals:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

