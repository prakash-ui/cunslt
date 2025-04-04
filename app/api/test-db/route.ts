import { NextResponse } from "next/server"
import prisma from "@/lib/prisma-simplified"

export async function GET() {
  try {
    // Simple query to test database connection
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

