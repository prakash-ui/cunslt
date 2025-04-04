"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function getUserProfile(userId?: string) {
  try {
    let id = userId

    if (!id) {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        return { success: false, error: "Unauthorized" }
      }
      id = currentUser.id
    }

    const user = await db.user.findUnique({
      where: {
        id,
      },
      include: {
        expert: true,
      },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { success: false, error: "Failed to get user profile" }
  }
}

