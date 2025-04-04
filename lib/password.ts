import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

// Generate a secure password hash
export function hashPassword(password: string): string {
  // Generate a random salt
  const salt = randomBytes(16).toString("hex")

  // Hash the password with the salt
  const hash = scryptSync(password, salt, 64).toString("hex")

  // Return the salt and hash together
  return `${salt}:${hash}`
}

// Verify a password against a hash
export function verifyPassword(password: string, hashedPassword: string): boolean {
  // Split the stored hash into its parts
  const [salt, storedHash] = hashedPassword.split(":")

  // Hash the provided password with the same salt
  const hash = scryptSync(password, salt, 64).toString("hex")

  // Create Buffer objects for comparison
  const hashBuffer = Buffer.from(hash, "hex")
  const storedHashBuffer = Buffer.from(storedHash, "hex")

  // Use timing-safe comparison to prevent timing attacks
  return hashBuffer.length === storedHashBuffer.length && timingSafeEqual(hashBuffer, storedHashBuffer)
}

// Generate a secure random token
export function generateToken(length = 32): string {
  return randomBytes(length).toString("hex")
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters long")
  } else {
    score += 1
  }

  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("Add uppercase letters")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("Add lowercase letters")

  if (/[0-9]/.test(password)) score += 1
  else feedback.push("Add numbers")

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push("Add special characters")

  // Common password check (simplified)
  const commonPasswords = ["password", "123456", "qwerty", "admin"]
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0
    feedback.push("This is a commonly used password")
  }

  return { score, feedback }
}

