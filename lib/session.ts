import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return null
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        expert: true,
        notifications: {
          where: {
            read: false,
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function getSessionUser() {
  try {
    const session = await auth()
    return session?.user || null
  } catch (error) {
    console.error("Error getting session user:", error)
    return null
  }
}

export async function getUserRole() {
  try {
    const session = await auth()
    return session?.user?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

export async function isAuthenticated() {
  try {
    const session = await auth()
    return !!session?.user
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function isAdmin() {
  try {
    const session = await auth()
    return session?.user?.role === "ADMIN"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function isExpert() {
  try {
    const user = await getCurrentUser()
    return !!user?.expert
  } catch (error) {
    console.error("Error checking expert status:", error)
    return false
  }
}

