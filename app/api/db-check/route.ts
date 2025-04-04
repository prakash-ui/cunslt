import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to query the database
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
    })
  } catch (error) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}

