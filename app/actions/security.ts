"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createAuditLog, AuditLogEventType } from "@/lib/audit-log"
import { encrypt } from "@/lib/encryption"
import { generateToken } from "@/lib/password"
import { headers } from "next/headers"

// Get security settings for the current user
export async function getSecuritySettings() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const settings = await db.securitySettings.findUnique({
    where: { userId: session.user.id },
  })

  // If no settings exist, create default settings
  if (!settings) {
    const newSettings = await db.securitySettings.create({
      data: {
        userId: session.user.id,
        twoFactorEnabled: false,
        twoFactorMethod: "app",
        lastPasswordChange: new Date(),
      },
    })

    return {
      twoFactorEnabled: newSettings.twoFactorEnabled,
      twoFactorMethod: newSettings.twoFactorMethod,
      lastPasswordChange: newSettings.lastPasswordChange,
      passwordResetRequired: newSettings.passwordResetRequired,
      accountLocked: newSettings.accountLocked,
    }
  }

  return {
    twoFactorEnabled: settings.twoFactorEnabled,
    twoFactorMethod: settings.twoFactorMethod,
    lastPasswordChange: settings.lastPasswordChange,
    passwordResetRequired: settings.passwordResetRequired,
    accountLocked: settings.accountLocked,
  }
}

// Enable two-factor authentication
export async function enableTwoFactor(method: "app" | "email" | "sms") {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Generate a secret for 2FA
  const secret = generateToken(20)

  // Encrypt the secret before storing
  const { encryptedData, iv, authTag } = encrypt(secret)

  // Update security settings
  await db.securitySettings.upsert({
    where: { userId: session.user.id },
    update: {
      twoFactorEnabled: true,
      twoFactorMethod: method,
      twoFactorSecret: `${encryptedData}:${iv}:${authTag}`,
      // Generate recovery codes
      recoveryCodes: JSON.stringify(Array.from({ length: 10 }, () => generateToken(10))),
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      twoFactorEnabled: true,
      twoFactorMethod: method,
      twoFactorSecret: `${encryptedData}:${iv}:${authTag}`,
      recoveryCodes: JSON.stringify(Array.from({ length: 10 }, () => generateToken(10))),
      lastPasswordChange: new Date(),
    },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.SECURITY_SETTING_CHANGE,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "enable_2fa", method },
  })

  revalidatePath("/dashboard/security")

  return { success: true, secret }
}

// Disable two-factor authentication
export async function disableTwoFactor() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Update security settings
  await db.securitySettings.update({
    where: { userId: session.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      recoveryCodes: null,
      updatedAt: new Date(),
    },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.SECURITY_SETTING_CHANGE,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "disable_2fa" },
  })

  revalidatePath("/dashboard/security")

  return { success: true }
}

// Get user's login history
export async function getLoginHistory(limit = 10) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const history = await db.loginHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return history
}

// Get active sessions for the current user
export async function getActiveSessions() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const sessions = await db.session.findMany({
    where: {
      userId: session.user.id,
      isValid: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { updatedAt: "desc" },
  })

  return sessions
}

// Revoke a specific session
export async function revokeSession(sessionId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Ensure the session belongs to the current user
  const targetSession = await db.session.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
  })

  if (!targetSession) {
    throw new Error("Session not found")
  }

  // Invalidate the session
  await db.session.update({
    where: { id: sessionId },
    data: { isValid: false },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.SECURITY_SETTING_CHANGE,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "revoke_session", sessionId },
  })

  revalidatePath("/dashboard/security")

  return { success: true }
}

// Revoke all sessions except the current one
export async function revokeAllSessions() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Invalidate all sessions except the current one
  await db.session.updateMany({
    where: {
      userId: session.user.id,
      id: { not: session.sessionId },
    },
    data: { isValid: false },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.SECURITY_SETTING_CHANGE,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "revoke_all_sessions" },
  })

  revalidatePath("/dashboard/security")

  return { success: true }
}

