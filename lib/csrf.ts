import { generateToken, verifyPassword, hashPassword } from "./password"
import { cookies } from "next/headers"

// Generate a CSRF token
export async function generateCsrfToken(): Promise<string> {
  // Generate a random token
  const csrfToken = generateToken(32)

  // Hash the token for storage
  const hashedToken = await hashCsrfToken(csrfToken)

  // Store the hashed token in a cookie
  cookies().set("csrf", hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 3600, // 1 hour
  })

  return csrfToken
}

// Verify a CSRF token
export async function verifyCsrfToken(token: string): Promise<boolean> {
  // Get the hashed token from the cookie
  const hashedToken = cookies().get("csrf")?.value

  if (!hashedToken) {
    return false
  }

  // Verify the token
  return await compareCsrfTokens(token, hashedToken)
}

// Hash a CSRF token
async function hashCsrfToken(token: string): Promise<string> {
  // Use the password hashing function
  return hashPassword(token)
}

// Compare a CSRF token with a hashed token
async function compareCsrfTokens(token: string, hashedToken: string): Promise<boolean> {
  // Use the password verification function
  return verifyPassword(token, hashedToken)
}

