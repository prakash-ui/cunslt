"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createMessageTemplate({
  title,
  content,
  isDefault = false,
}: {
  title: string
  content: string
  isDefault?: boolean
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user is an expert
    const expert = await db.expert.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!expert) {
      return { success: false, error: "Only experts can create message templates" }
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.messageTemplate.updateMany({
        where: {
          expertId: expert.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Create the template
    const template = await db.messageTemplate.create({
      data: {
        title,
        content,
        isDefault,
        expertId: expert.id,
      },
    })

    revalidatePath("/dashboard/templates")

    return { success: true, template }
  } catch (error) {
    console.error("Error creating message template:", error)
    return { success: false, error: "Failed to create message template" }
  }
}

export async function updateMessageTemplate({
  id,
  title,
  content,
  isDefault = false,
}: {
  id: string
  title: string
  content: string
  isDefault?: boolean
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user is an expert
    const expert = await db.expert.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!expert) {
      return { success: false, error: "Only experts can update message templates" }
    }

    // Check if template belongs to the expert
    const existingTemplate = await db.messageTemplate.findUnique({
      where: {
        id,
      },
    })

    if (!existingTemplate || existingTemplate.expertId !== expert.id) {
      return { success: false, error: "Template not found or not authorized" }
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.messageTemplate.updateMany({
        where: {
          expertId: expert.id,
          isDefault: true,
          id: {
            not: id,
          },
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Update the template
    const template = await db.messageTemplate.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        isDefault,
      },
    })

    revalidatePath("/dashboard/templates")

    return { success: true, template }
  } catch (error) {
    console.error("Error updating message template:", error)
    return { success: false, error: "Failed to update message template" }
  }
}

export async function deleteMessageTemplate(id: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user is an expert
    const expert = await db.expert.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!expert) {
      return { success: false, error: "Only experts can delete message templates" }
    }

    // Check if template belongs to the expert
    const existingTemplate = await db.messageTemplate.findUnique({
      where: {
        id,
      },
    })

    if (!existingTemplate || existingTemplate.expertId !== expert.id) {
      return { success: false, error: "Template not found or not authorized" }
    }

    // Delete the template
    await db.messageTemplate.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/templates")

    return { success: true }
  } catch (error) {
    console.error("Error deleting message template:", error)
    return { success: false, error: "Failed to delete message template" }
  }
}

export async function getMessageTemplates() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user is an expert
    const expert = await db.expert.findUnique({
      where: {
        userId: user.id,
      },
    })

    if (!expert) {
      return { success: false, error: "Only experts can view message templates" }
    }

    // Get templates
    const templates = await db.messageTemplate.findMany({
      where: {
        expertId: expert.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, templates }
  } catch (error) {
    console.error("Error getting message templates:", error)
    return { success: false, error: "Failed to get message templates" }
  }
}

