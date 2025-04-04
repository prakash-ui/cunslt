import { db } from "@/lib/db"

// Define audit log event types
export enum AuditLogEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE = "PASSWORD_RESET_COMPLETE",
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  ADMIN_ACTION = "ADMIN_ACTION",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  API_ACCESS = "API_ACCESS",
  SENSITIVE_DATA_ACCESS = "SENSITIVE_DATA_ACCESS",
  SECURITY_SETTING_CHANGE = "SECURITY_SETTING_CHANGE",
}

// Define audit log entry interface
interface AuditLogEntry {
  userId?: string
  eventType: AuditLogEventType
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
}

// Create an audit log entry
export async function createAuditLog({ userId, eventType, ipAddress, userAgent, details }: AuditLogEntry) {
  try {
    // Create the audit log entry in the database
    await db.auditLog.create({
      data: {
        userId,
        eventType,
        ipAddress,
        userAgent,
        details: details ? JSON.stringify(details) : null,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

// Get audit logs for a specific user
export async function getUserAuditLogs(userId: string, limit = 50) {
  return await db.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

// Get all audit logs (admin only)
export async function getAllAuditLogs(
  limit = 100,
  offset = 0,
  filters?: {
    userId?: string
    eventType?: AuditLogEventType
    startDate?: Date
    endDate?: Date
  },
) {
  const where: any = {}

  if (filters?.userId) {
    where.userId = filters.userId
  }

  if (filters?.eventType) {
    where.eventType = filters.eventType
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {}

    if (filters.startDate) {
      where.createdAt.gte = filters.startDate
    }

    if (filters.endDate) {
      where.createdAt.lte = filters.endDate
    }
  }

  return await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
}

