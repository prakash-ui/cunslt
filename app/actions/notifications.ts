"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { formatDistanceToNow } from "date-fns"
import { Handlebars } from "handlebars"

export type NotificationType =
  | "booking_created"
  | "booking_canceled"
  | "booking_rescheduled"
  | "booking_reminder"
  | "payment_received"
  | "payment_failed"
  | "message_received"
  | "security_alert"
  | "account_update"
  | "platform_update"
  | "new_review"
  | "subscription_expiring"
  | "verification_required"

export interface NotificationData {
  [key: string]: string | number | boolean | null
}

// Create a notification for a user
export async function createNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData,
  link?: string,
  expiresAt?: Date,
) {
  const supabase = createClient()

  // Get the notification template
  const { data: template, error: templateError } = await supabase
    .from("notification_templates")
    .select("*")
    .eq("type", type)
    .single()

  if (templateError || !template) {
    console.error("Error fetching notification template:", templateError)
    return { error: "Failed to fetch notification template" }
  }

  // Compile the title and body templates with the provided data
  const titleTemplate = Handlebars.compile(template.title_template)
  const bodyTemplate = Handlebars.compile(template.body_template)

  const title = titleTemplate(data)
  const body = bodyTemplate(data)

  // Get user notification preferences
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  // Create the in-app notification if enabled
  if (!preferences || preferences.in_app_notifications) {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      body,
      type,
      link,
      expires_at: expiresAt,
    })

    if (error) {
      console.error("Error creating notification:", error)
      return { error: "Failed to create notification" }
    }
  }

  // TODO: Send email notification if enabled
  if (!preferences || preferences.email_notifications) {
    // Implement email sending logic here
  }

  // TODO: Send push notification if enabled
  if (!preferences || preferences.push_notifications) {
    // Implement push notification logic here
  }

  // Revalidate the notifications path
  revalidatePath("/notifications")
  revalidatePath("/dashboard")

  return { success: true }
}

// Get notifications for the current user
export async function getNotifications(limit = 10, offset = 0, includeRead = false) {
  const session = await auth()

  if (!session?.user?.id) {
    return { notifications: [], count: 0 }
  }

  const supabase = createClient()

  // Build the query
  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  // Filter by read status if needed
  if (!includeRead) {
    query = query.eq("is_read", false)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching notifications:", error)
    return { notifications: [], count: 0 }
  }

  // Format the notifications with relative time
  const formattedNotifications = data.map((notification) => ({
    ...notification,
    timeAgo: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }),
  }))

  return {
    notifications: formattedNotifications,
    count: count || 0,
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: number) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Ensure the notification belongs to the current user
  const { data: notification } = await supabase
    .from("notifications")
    .select("user_id")
    .eq("id", notificationId)
    .single()

  if (!notification || notification.user_id !== session.user.id) {
    return { error: "Notification not found" }
  }

  // Update the notification
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    return { error: "Failed to mark notification as read" }
  }

  // Revalidate the notifications path
  revalidatePath("/notifications")
  revalidatePath("/dashboard")

  return { success: true }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Update all unread notifications for the user
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", session.user.id)
    .eq("is_read", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { error: "Failed to mark all notifications as read" }
  }

  // Revalidate the notifications path
  revalidatePath("/notifications")
  revalidatePath("/dashboard")

  return { success: true }
}

// Archive a notification
export async function archiveNotification(notificationId: number) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Ensure the notification belongs to the current user
  const { data: notification } = await supabase
    .from("notifications")
    .select("user_id")
    .eq("id", notificationId)
    .single()

  if (!notification || notification.user_id !== session.user.id) {
    return { error: "Notification not found" }
  }

  // Update the notification
  const { error } = await supabase.from("notifications").update({ is_archived: true }).eq("id", notificationId)

  if (error) {
    console.error("Error archiving notification:", error)
    return { error: "Failed to archive notification" }
  }

  // Revalidate the notifications path
  revalidatePath("/notifications")
  revalidatePath("/dashboard")

  return { success: true }
}

// Get notification preferences for the current user
export async function getNotificationPreferences() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const supabase = createClient()

  // Get the user's notification preferences
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching notification preferences:", error)
    return null
  }

  // If no preferences exist, create default preferences
  if (!data) {
    const { data: newPreferences, error: insertError } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: session.user.id,
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        booking_reminders: true,
        booking_updates: true,
        messages: true,
        payment_updates: true,
        platform_updates: true,
        security_alerts: true,
        marketing_emails: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating notification preferences:", insertError)
      return null
    }

    return newPreferences
  }

  return data
}

// Update notification preferences
export async function updateNotificationPreferences(preferences: {
  email_notifications?: boolean
  push_notifications?: boolean
  in_app_notifications?: boolean
  booking_reminders?: boolean
  booking_updates?: boolean
  messages?: boolean
  payment_updates?: boolean
  platform_updates?: boolean
  security_alerts?: boolean
  marketing_emails?: boolean
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Update the preferences
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: session.user.id,
    ...preferences,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error updating notification preferences:", error)
    return { error: "Failed to update notification preferences" }
  }

  // Revalidate the notifications settings path
  revalidatePath("/dashboard/settings/notifications")

  return { success: true }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  const session = await auth()

  if (!session?.user?.id) {
    return 0
  }

  const supabase = createClient()

  // Count unread notifications
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .eq("is_read", false)
    .eq("is_archived", false)

  if (error) {
    console.error("Error counting unread notifications:", error)
    return 0
  }

  return count || 0
}

