import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""
const ALGORITHM = "aes-256-gcm"

// Encrypt sensitive data
export function encrypt(text: string): { encryptedData: string; iv: string; authTag: string } {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key is not set")
  }

  // Generate a random initialization vector
  const iv = randomBytes(16)

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv)

  // Encrypt the data
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString("hex")

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag,
  }
}

// Decrypt sensitive data
export function decrypt(encryptedData: string, iv: string, authTag: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key is not set")
  }

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), Buffer.from(iv, "hex"))

  // Set authentication tag
  decipher.setAuthTag(Buffer.from(authTag, "hex"))

  // Decrypt the data
  let decrypted = decipher.update(encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

