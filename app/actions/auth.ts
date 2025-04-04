"use server"

import { db } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { createAuditLog, AuditLogEventType } from "@/lib/audit-log"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import type { z } from "zod"

export async function getCurrentUser() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  return user
}

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }

  const { email, password } = validatedFields.data

  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (!existingUser || !existingUser.password) {
    return { error: "Email does not exist!" }
  }

  const passwordMatch = await compare(password, existingUser.password)

  if (!passwordMatch) {
    return { error: "Incorrect password!" }
  }

  return { success: "Logged in successfully!" }
}

// Enhanced logout function
export async function logout() {
  const session = await auth()

  if (session?.user?.id && session.sessionId) {
    // Invalidate the current session
    await db.session.update({
      where: { id: session.sessionId },
      data: { isValid: false },
    })

    // Log the logout
    const headersList = headers()
    await createAuditLog({
      userId: session.user.id,
      eventType: AuditLogEventType.LOGOUT,
      ipAddress: headersList.get("x-forwarded-for") || undefined,
      userAgent: headersList.get("user-agent") || undefined,
    })
  }

  // Sign out
  await signOut({ redirectTo: "/" })
}

