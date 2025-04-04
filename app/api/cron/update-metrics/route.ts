import { updateAllMetrics } from "@/app/actions/analytics"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
  }

  try {
    const result = await updateAllMetrics()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating metrics:", error)
    return NextResponse.json({ error: "Failed to update metrics" }, { status: 500 })
  }
}

