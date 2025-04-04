import { SignJWT, jwtVerify } from "jose"
import { nanoid } from "nanoid"

// JWT secret should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || ""

// Create a JWT token
export async function createToken(payload: Record<string, any>, options: { expiresIn?: string } = {}): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error("JWT secret is not set")
  }

  const { expiresIn = "15m" } = options

  // Convert expiration time to seconds
  const expirationTime = expiresIn.endsWith("m")
    ? Number.parseInt(expiresIn) * 60
    : expiresIn.endsWith("h")
      ? Number.parseInt(expiresIn) * 3600
      : Number.parseInt(expiresIn)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

// Verify a JWT token
export async function verifyToken<T = Record<string, any>>(token: string): Promise<T | null> {
  if (!JWT_SECRET) {
    throw new Error("JWT secret is not set")
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

    return payload as unknown as T
  } catch (error) {
    return null
  }
}

