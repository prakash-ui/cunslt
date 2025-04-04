"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createAuditLog, AuditLogEventType, getAllAuditLogs } from "@/lib/audit-log"
import { headers } from "next/headers"

// Get all audit logs (admin only)
export async function getAuditLogs(
  page = 1,
  limit = 20,
  filters?: {
    userId?: string
    eventType?: string
    startDate?: string
    endDate?: string
  },
) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const offset = (page - 1) * limit

  // Convert string dates to Date objects
  const parsedFilters: any = {}

  if (filters?.userId) {
    parsedFilters.userId = filters.userId
  }

  if (filters?.eventType) {
    parsedFilters.eventType = filters.eventType
  }

  if (filters?.startDate) {
    parsedFilters.startDate = new Date(filters.startDate)
  }

  if (filters?.endDate) {
    parsedFilters.endDate = new Date(filters.endDate)
  }

  const logs = await getAllAuditLogs(limit, offset, parsedFilters)

  // Get total count for pagination
  const totalCount = await db.auditLog.count({
    where: {
      ...(parsedFilters.userId && { userId: parsedFilters.userId }),
      ...(parsedFilters.eventType && { eventType: parsedFilters.eventType }),
      ...(parsedFilters.startDate || parsedFilters.endDate
        ? {
            createdAt: {
              ...(parsedFilters.startDate && { gte: parsedFilters.startDate }),
              ...(parsedFilters.endDate && { lte: parsedFilters.endDate }),
            },
          }
        : {}),
    },
  })

  return {
    logs,
    pagination: {
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      current: page,
    },
  }
}

// Get security overview stats for admin dashboard
export async function getSecurityOverview() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get login attempts in the last 24 hours
  const recentLogins = await db.loginHistory.count({
    where: {
      createdAt: { gte: oneDayAgo },
    },
  })

  // Get failed login attempts in the last 24 hours
  const failedLogins = await db.loginHistory.count({
    where: {
      createdAt: { gte: oneDayAgo },
      success: false,
    },
  })

  // Get users with 2FA enabled
  const twoFactorEnabledCount = await db.securitySettings.count({
    where: {
      twoFactorEnabled: true,
    },
  })

  // Get total users
  const totalUsers = await db.user.count()

  // Get locked accounts
  const lockedAccounts = await db.securitySettings.count({
    where: {
      accountLocked: true,
    },
  })

  // Get security events by type in the last week
  const securityEvents = await db.auditLog.groupBy({
    by: ["eventType"],
    where: {
      createdAt: { gte: oneWeekAgo },
    },
    _count: true,
  })

  // Get active sessions
  const activeSessions = await db.session.count({
    where: {
      isValid: true,
      expiresAt: { gt: now },
    },
  })

  return {
    recentLogins,
    failedLogins,
    twoFactorEnabledCount,
    twoFactorEnabledPercentage: Math.round((twoFactorEnabledCount / totalUsers) * 100),
    lockedAccounts,
    securityEvents,
    activeSessions,
  }
}

// Lock a user account (admin only)
export async function lockUserAccount(userId: string) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  // Set account locked until 24 hours from now
  const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.securitySettings.upsert({
    where: { userId },
    update: {
      accountLocked: true,
      accountLockedUntil: lockedUntil,
      updatedAt: new Date(),
    },
    create: {
      userId,
      accountLocked: true,
      accountLockedUntil: lockedUntil,
      twoFactorEnabled: false,
      twoFactorMethod: "app",
      lastPasswordChange: new Date(),
    },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.ADMIN_ACTION,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "lock_account", targetUserId: userId },
  })

  revalidatePath("/admin/security")

  return { success: true }
}

// Unlock a user account (admin only)
export async function unlockUserAccount(userId: string) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await db.securitySettings.update({
    where: { userId },
    data: {
      accountLocked: false,
      accountLockedUntil: null,
      loginAttempts: 0,
      updatedAt: new Date(),
    },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.ADMIN_ACTION,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "unlock_account", targetUserId: userId },
  })

  revalidatePath("/admin/security")

  return { success: true }
}

// Require password reset for a user (admin only)
export async function requirePasswordReset(userId: string) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await db.securitySettings.upsert({
    where: { userId },
    update: {
      passwordResetRequired: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      passwordResetRequired: true,
      twoFactorEnabled: false,
      twoFactorMethod: "app",
      lastPasswordChange: new Date(),
    },
  })

  // Log the action
  const headersList = headers()
  await createAuditLog({
    userId: session.user.id,
    eventType: AuditLogEventType.ADMIN_ACTION,
    ipAddress: headersList.get("x-forwarded-for") || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    details: { action: "require_password_reset", targetUserId: userId },
  })

  revalidatePath("/admin/security")

  return { success: true }
}

