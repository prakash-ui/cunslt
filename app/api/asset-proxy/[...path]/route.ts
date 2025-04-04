import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join("/")
    const url = new URL(path, "https://cdn.example.com")

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch asset" }, { status: response.status })
    }

    const body = await response.arrayBuffer()
    const headers = new Headers(response.headers)

    // Set caching headers
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Error proxying asset:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

