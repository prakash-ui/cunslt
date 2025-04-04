import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Define admin routes
  const isAdminRoute = pathname.startsWith("/admin")

  // Define expert routes
  const isExpertRoute = pathname.startsWith("/expert")

  // Check if the user is authenticated
  const isAuthenticated = !!token

  // Check if the user is an admin
  const isAdmin = token?.role === "ADMIN"

  // Check if the user is an expert
  const isExpert = token?.role === "EXPERT"

  // Redirect logic
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthenticated && isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isAuthenticated && isExpertRoute && !isExpert) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/webhooks (webhook endpoints that don't require auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)",
  ],
}

