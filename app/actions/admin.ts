"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"
import { sendEmail } from "@/lib/email"

// Admin Dashboard Analytics
export async function getAdminDashboardStats() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get total users count
  const { count: totalUsers } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

  // Get new users this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: newUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // Get new users last month for trend calculation
  const startOfLastMonth = new Date(startOfMonth)
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

  const endOfLastMonth = new Date(startOfMonth)
  endOfLastMonth.setDate(0)
  endOfLastMonth.setHours(23, 59, 59, 999)

  const { count: lastMonthNewUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  // Calculate new users trend
  const newUsersTrend =
    lastMonthNewUsers > 0 ? Math.round(((newUsers - lastMonthNewUsers) / lastMonthNewUsers) * 100) : 100

  // Get total experts count
  const { count: totalExperts } = await supabase.from("experts").select("*", { count: "exact", head: true })

  // Get new experts this month
  const { count: newExperts } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // Get new experts last month for trend calculation
  const { count: lastMonthNewExperts } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  // Calculate new experts trend
  const newExpertsTrend =
    lastMonthNewExperts > 0 ? Math.round(((newExperts - lastMonthNewExperts) / lastMonthNewExperts) * 100) : 100

  // Get total bookings count
  const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

  // Get new bookings this month
  const { count: newBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // Get new bookings last month for trend calculation
  const { count: lastMonthNewBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  // Calculate new bookings trend
  const newBookingsTrend =
    lastMonthNewBookings > 0 ? Math.round(((newBookings - lastMonthNewBookings) / lastMonthNewBookings) * 100) : 100

  // Get total revenue
  const { data: payments } = await supabase.from("payments").select("amount").eq("status", "completed")

  const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  // Get new revenue this month
  const { data: newPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "completed")
    .gte("created_at", startOfMonth.toISOString())

  const newRevenue = newPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  // Get new revenue last month for trend calculation
  const { data: lastMonthPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "completed")
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const lastMonthRevenue = lastMonthPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  // Calculate new revenue trend
  const newRevenueTrend =
    lastMonthRevenue > 0 ? Math.round(((newRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 100

  // Get average session duration
  const { data: bookings } = await supabase.from("bookings").select("duration").eq("status", "completed")

  const totalDuration = bookings?.reduce((sum, booking) => sum + booking.duration, 0) || 0
  const avgSessionDuration = bookings && bookings.length > 0 ? Math.round(totalDuration / bookings.length) : 0

  // Get average session duration last month for trend calculation
  const { data: lastMonthBookings } = await supabase
    .from("bookings")
    .select("duration")
    .eq("status", "completed")
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const lastMonthTotalDuration = lastMonthBookings?.reduce((sum, booking) => sum + booking.duration, 0) || 0
  const lastMonthAvgSessionDuration =
    lastMonthBookings && lastMonthBookings.length > 0
      ? Math.round(lastMonthTotalDuration / lastMonthBookings.length)
      : 0

  // Calculate average session duration trend
  const avgSessionTrend =
    lastMonthAvgSessionDuration > 0
      ? Math.round(((avgSessionDuration - lastMonthAvgSessionDuration) / lastMonthAvgSessionDuration) * 100)
      : 0

  // Get expert approval rate
  const { count: totalExpertApplications } = await supabase
    .from("expert_applications")
    .select("*", { count: "exact", head: true })

  const { count: approvedExpertApplications } = await supabase
    .from("expert_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const expertApprovalRate =
    totalExpertApplications > 0 ? Math.round((approvedExpertApplications / totalExpertApplications) * 100) : 0

  // Get expert approval rate last month for trend calculation
  const { count: lastMonthTotalExpertApplications } = await supabase
    .from("expert_applications")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const { count: lastMonthApprovedExpertApplications } = await supabase
    .from("expert_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const lastMonthExpertApprovalRate =
    lastMonthTotalExpertApplications > 0
      ? Math.round((lastMonthApprovedExpertApplications / lastMonthTotalExpertApplications) * 100)
      : 0

  // Calculate expert approval rate trend
  const expertApprovalTrend =
    lastMonthExpertApprovalRate > 0
      ? Math.round(((expertApprovalRate - lastMonthExpertApprovalRate) / lastMonthExpertApprovalRate) * 100)
      : 0

  return {
    totalUsers: totalUsers || 0,
    newUsers: newUsers || 0,
    newUsersTrend,
    totalExperts: totalExperts || 0,
    newExperts: newExperts || 0,
    newExpertsTrend,
    totalBookings: totalBookings || 0,
    newBookings: newBookings || 0,
    newBookingsTrend,
    totalRevenue,
    newRevenue,
    newRevenueTrend,
    avgSessionDuration,
    avgSessionTrend,
    expertApprovalRate,
    expertApprovalTrend,
  }
}

// Get revenue chart data
export async function getRevenueChartData() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get last 12 months of data
  const months = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = date.toLocaleString("default", { month: "short" })
    const year = date.getFullYear()
    months.push({
      month: `${month} ${year}`,
      startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
    })
  }

  const revenueData = []

  for (const monthData of months) {
    // Get total revenue for the month
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("created_at", monthData.startDate)
      .lte("created_at", monthData.endDate)

    const revenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    // Calculate platform fees (assuming 20% commission)
    const platformFees = revenue * 0.2

    // Calculate expert payouts
    const expertPayouts = revenue - platformFees

    revenueData.push({
      month: monthData.month,
      revenue,
      platformFees,
      expertPayouts,
    })
  }

  return revenueData
}

// Get user growth chart data
export async function getUserGrowthChartData() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get last 12 months of data
  const months = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = date.toLocaleString("default", { month: "short" })
    const year = date.getFullYear()
    months.push({
      month: `${month} ${year}`,
      startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
    })
  }

  const userGrowthData = []

  for (const monthData of months) {
    // Get new clients for the month
    const { count: newClients } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client")
      .gte("created_at", monthData.startDate)
      .lte("created_at", monthData.endDate)

    // Get new experts for the month
    const { count: newExperts } = await supabase
      .from("experts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthData.startDate)
      .lte("created_at", monthData.endDate)

    userGrowthData.push({
      month: monthData.month,
      clients: newClients || 0,
      experts: newExperts || 0,
    })
  }

  return userGrowthData
}

// Get booking stats chart data
export async function getBookingStatsChartData() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get last 12 months of data
  const months = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = date.toLocaleString("default", { month: "short" })
    const year = date.getFullYear()
    months.push({
      month: `${month} ${year}`,
      startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
    })
  }

  const bookingStatsData = []

  for (const monthData of months) {
    // Get completed bookings for the month
    const { count: completed } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", monthData.startDate)
      .lte("created_at", monthData.endDate)

    // Get cancelled bookings for the month
    const { count: cancelled } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("created_at", monthData.startDate)
      .lte("created_at", monthData.endDate)

    // Get rescheduled bookings for the month
    const { count: rescheduled } = await supabase
      .from("booking_reschedules")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthData.startDate)
      .lte("created_at", monthData.endDate)

    bookingStatsData.push({
      month: monthData.month,
      completed: completed || 0,
      cancelled: cancelled || 0,
      rescheduled: rescheduled || 0,
    })
  }

  return bookingStatsData
}

// Get recent activities
export async function getRecentActivities() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get recent user registrations
  const { data: newUsers } = await supabase
    .from("user_profiles")
    .select("id, full_name, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent expert registrations
  const { data: newExperts } = await supabase
    .from("experts")
    .select(`
      id,
      created_at,
      user_profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      created_at,
      user_profiles!bookings_client_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      created_at,
      user_profiles!payments_client_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent cancellations
  const { data: recentCancellations } = await supabase
    .from("bookings")
    .select(`
      id,
      updated_at,
      user_profiles!bookings_client_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("status", "cancelled")
    .order("updated_at", { ascending: false })
    .limit(5)

  // Format activities
  const activities = []

  // Add new users
  newUsers?.forEach((user) => {
    activities.push({
      id: `user-${user.id}`,
      type: "new_user",
      user: {
        id: user.id,
        name: user.full_name,
        avatar: user.avatar_url,
      },
      description: "Registered a new account",
      timestamp: user.created_at,
    })
  })

  // Add new experts
  newExperts?.forEach((expert) => {
    activities.push({
      id: `expert-${expert.id}`,
      type: "new_expert",
      user: {
        id: expert.user_profiles.id,
        name: expert.user_profiles.full_name,
        avatar: expert.user_profiles.avatar_url,
      },
      description: "Registered as an expert",
      timestamp: expert.created_at,
    })
  })

  // Add recent bookings
  recentBookings?.forEach((booking) => {
    activities.push({
      id: `booking-${booking.id}`,
      type: "booking",
      user: {
        id: booking.user_profiles.id,
        name: booking.user_profiles.full_name,
        avatar: booking.user_profiles.avatar_url,
      },
      description: "Made a new booking",
      timestamp: booking.created_at,
    })
  })

  // Add recent payments
  recentPayments?.forEach((payment) => {
    activities.push({
      id: `payment-${payment.id}`,
      type: "payment",
      user: {
        id: payment.user_profiles.id,
        name: payment.user_profiles.full_name,
        avatar: payment.user_profiles.avatar_url,
      },
      description: `Made a payment of $${payment.amount}`,
      timestamp: payment.created_at,
    })
  })

  // Add recent cancellations
  recentCancellations?.forEach((cancellation) => {
    activities.push({
      id: `cancellation-${cancellation.id}`,
      type: "cancellation",
      user: {
        id: cancellation.user_profiles.id,
        name: cancellation.user_profiles.full_name,
        avatar: cancellation.user_profiles.avatar_url,
      },
      description: "Cancelled a booking",
      timestamp: cancellation.updated_at,
    })
  })

  // Sort activities by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Return the 10 most recent activities
  return activities.slice(0, 10)
}

// User Management Actions
export async function updateUserStatus(userId: string, status: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Update user status
  const { error } = await supabase.from("user_profiles").update({ status }).eq("id", userId)

  if (error) {
    throw new Error("Failed to update user status")
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Update user role
  const { error } = await supabase.from("user_profiles").update({ role }).eq("id", userId)

  if (error) {
    throw new Error("Failed to update user role")
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function sendUserEmail(userId: string, subject: string, message: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get user email
  const { data: targetUser } = await supabase.from("user_profiles").select("email, full_name").eq("id", userId).single()

  if (!targetUser) {
    throw new Error("User not found")
  }

  // Send email
  await sendEmail({
    to: targetUser.email,
    subject,
    html: `
      <div>
        <p>Hello ${targetUser.full_name},</p>
        <p>${message}</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  return { success: true }
}

// Expert Approval Actions
export async function approveExpert(expertId: string, message?: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get expert details
  const { data: expert } = await supabase
    .from("experts")
    .select(`
      id,
      user_id,
      user_profiles (
        email,
        full_name
      )
    `)
    .eq("id", expertId)
    .single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Update expert status
  const { error } = await supabase.from("experts").update({ status: "approved" }).eq("id", expertId)

  if (error) {
    throw new Error("Failed to approve expert")
  }

  // Update user role to expert
  await supabase.from("user_profiles").update({ role: "expert" }).eq("id", expert.user_id)

  // Send approval email
  await sendEmail({
    to: expert.user_profiles.email,
    subject: "Your Expert Application Has Been Approved",
    html: `
      <div>
        <p>Hello ${expert.user_profiles.full_name},</p>
        <p>Congratulations! Your application to become an expert on Cunslt has been approved.</p>
        ${message ? `<p>${message}</p>` : ""}
        <p>You can now log in to your account and start setting up your availability and accepting bookings.</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  revalidatePath("/admin/experts")
  return { success: true }
}

export async function rejectExpert(expertId: string, reason: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get expert details
  const { data: expert } = await supabase
    .from("experts")
    .select(`
      id,
      user_profiles (
        email,
        full_name
      )
    `)
    .eq("id", expertId)
    .single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Update expert status
  const { error } = await supabase.from("experts").update({ status: "rejected" }).eq("id", expertId)

  if (error) {
    throw new Error("Failed to reject expert")
  }

  // Send rejection email
  await sendEmail({
    to: expert.user_profiles.email,
    subject: "Your Expert Application Status",
    html: `
      <div>
        <p>Hello ${expert.user_profiles.full_name},</p>
        <p>Thank you for your interest in becoming an expert on Cunslt.</p>
        <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You are welcome to apply again in the future with updated information.</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  revalidatePath("/admin/experts")
  return { success: true }
}

// Content Moderation Actions
export async function approveContent(reportId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Update report status
  const { error } = await supabase
    .from("content_reports")
    .update({ status: "approved", resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq("id", reportId)

  if (error) {
    throw new Error("Failed to approve content")
  }

  // Get report details
  const { data: report } = await supabase
    .from("content_reports")
    .select(`
      id,
      reported_by,
      user_profiles!content_reports_reported_by_fkey (
        email,
        full_name
      )
    `)
    .eq("id", reportId)
    .single()

  if (!report) {
    throw new Error("Report not found")
  }

  // Send notification email to reporter
  await sendEmail({
    to: report.user_profiles.email,
    subject: "Content Report Update",
    html: `
      <div>
        <p>Hello ${report.user_profiles.full_name},</p>
        <p>Thank you for your recent content report on Cunslt.</p>
        <p>After reviewing the reported content, we have determined that it does not violate our community guidelines.</p>
        <p>We appreciate your vigilance in helping us maintain a safe and respectful platform.</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  revalidatePath("/admin/moderation")
  return { success: true }
}

export async function removeContent(reportId: string, reason: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get report details
  const { data: report } = await supabase
    .from("content_reports")
    .select(`
      id,
      content_type,
      content_id,
      reported_user_id,
      reported_by,
      user_profiles!content_reports_reported_by_fkey (
        email,
        full_name
      ),
      user_profiles!content_reports_reported_user_id_fkey (
        email,
        full_name
      )
    `)
    .eq("id", reportId)
    .single()

  if (!report) {
    throw new Error("Report not found")
  }

  // Update report status
  const { error: reportError } = await supabase
    .from("content_reports")
    .update({
      status: "removed",
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: reason,
    })
    .eq("id", reportId)

  if (reportError) {
    throw new Error("Failed to update report")
  }

  // Remove the content based on its type
  let contentRemoved = false

  switch (report.content_type) {
    case "review":
      const { error: reviewError } = await supabase
        .from("reviews")
        .update({ is_deleted: true })
        .eq("id", report.content_id)

      contentRemoved = !reviewError
      break

    case "profile":
      const { error: profileError } = await supabase
        .from("experts")
        .update({ is_profile_flagged: true })
        .eq("user_id", report.reported_user_id)

      contentRemoved = !profileError
      break

    case "message":
      const { error: messageError } = await supabase
        .from("messages")
        .update({ is_deleted: true })
        .eq("id", report.content_id)

      contentRemoved = !messageError
      break

    case "comment":
      const { error: commentError } = await supabase
        .from("comments")
        .update({ is_deleted: true })
        .eq("id", report.content_id)

      contentRemoved = !commentError
      break
  }

  if (!contentRemoved) {
    throw new Error("Failed to remove content")
  }

  // Send notification email to reporter
  await sendEmail({
    to: report.user_profiles.content_reports_reported_by_fkey.email,
    subject: "Content Report Update",
    html: `
      <div>
        <p>Hello ${report.user_profiles.content_reports_reported_by_fkey.full_name},</p>
        <p>Thank you for your recent content report on Cunslt.</p>
        <p>After reviewing the reported content, we have determined that it violates our community guidelines and have removed it from the platform.</p>
        <p>We appreciate your vigilance in helping us maintain a safe and respectful platform.</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  // Send notification email to content owner\
  const content_reports_reported_user_id_fkey = report.user_profiles!
  content_reports_reported_user_id_fkey
  await sendEmail({
    to: content_reports_reported_user_id_fkey.email,
    subject: "Content Removal Notice",
    html: `
      <div>
        <p>Hello ${content_reports_reported_user_id_fkey.full_name},</p>
        <p>We're writing to inform you that some of your content on Cunslt has been removed because it violates our community guidelines.</p>
        <p><strong>Reason for removal:</strong> ${reason}</p>
        <p>Please review our community guidelines to ensure your future content complies with our policies.</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  revalidatePath("/admin/moderation")
  return { success: true }
}

export async function warnUser(userId: string, message: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Get user details
  const { data: targetUser } = await supabase.from("user_profiles").select("email, full_name").eq("id", userId).single()

  if (!targetUser) {
    throw new Error("User not found")
  }

  // Record the warning
  const { error } = await supabase.from("user_warnings").insert({
    user_id: userId,
    admin_id: user.id,
    message,
    created_at: new Date().toISOString(),
  })

  if (error) {
    throw new Error("Failed to record warning")
  }

  // Send warning email
  await sendEmail({
    to: targetUser.email,
    subject: "Important: Warning Regarding Your Activity on Cunslt",
    html: `
      <div>
        <p>Hello ${targetUser.full_name},</p>
        <p>We're writing to inform you about concerns regarding your recent activity on Cunslt.</p>
        <p><strong>Warning:</strong> ${message}</p>
        <p>Please review our community guidelines to ensure your future activity complies with our policies.</p>
        <p>Continued violations may result in account restrictions or suspension.</p>
        <p>Best regards,<br>Cunslt Admin Team</p>
      </div>
    `,
  })

  return { success: true }
}

// Financial Reports Actions
export async function exportFinancialReport(format: "csv" | "excel", period: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Determine date range based on period
  const endDate = new Date()
  let startDate = new Date()

  switch (period) {
    case "last30days":
      startDate.setDate(startDate.getDate() - 30)
      break
    case "last3months":
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "last6months":
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case "lastyear":
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    case "alltime":
      startDate = new Date(0) // Beginning of time
      break
    default:
      startDate.setMonth(startDate.getMonth() - 6)
  }

  // Get financial data
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_method,
      status,
      created_at,
      bookings (
        id,
        expert_id,
        experts (
          id,
          user_profiles (
            full_name
          )
        )
      ),
      user_profiles!payments_client_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false })

  if (!payments) {
    throw new Error("Failed to fetch financial data")
  }

  // Record the export
  await supabase.from("admin_activities").insert({
    admin_id: user.id,
    activity_type: "report_export",
    details: {
      report_type: "financial",
      format,
      period,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    },
    created_at: new Date().toISOString(),
  })

  // In a real implementation, you would generate and return a file
  // For this example, we'll just return success
  return { success: true }
}

