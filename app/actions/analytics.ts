"use server"

import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type AnalyticsEventType =
  | "page_view"
  | "booking_created"
  | "booking_completed"
  | "booking_canceled"
  | "profile_view"
  | "message_sent"
  | "review_submitted"
  | "payment_made"
  | "subscription_started"
  | "package_purchased"
  | "search_performed"
  | "expert_hired"

export type AnalyticsEvent = {
  userId: string
  eventType: AnalyticsEventType
  eventData?: Record<string, any>
}

export type TimeFrame = "week" | "month" | "quarter" | "year" | "all"

export type MetricType =
  | "completion_rate"
  | "cancellation_rate"
  | "average_rating"
  | "booking_count"
  | "total_earnings"
  | "total_spent"
  | "response_time"
  | "repeat_clients"
  | "conversion_rate"

export async function trackEvent(event: AnalyticsEvent) {
  const session = await auth()
  if (!session) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  const { error } = await supabase.from("analytics_events").insert({
    user_id: event.userId,
    event_type: event.eventType,
    event_data: event.eventData || {},
  })

  if (error) {
    console.error("Error tracking event:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getExpertMetrics(timeFrame: TimeFrame = "month") {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()

  // Get expert profile for the current user
  const { data: expert, error: expertError } = await supabase
    .from("experts")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (expertError || !expert) {
    return { error: "Expert profile not found" }
  }

  // Configure date range based on timeFrame
  const now = new Date()
  let startDate = new Date()

  switch (timeFrame) {
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "quarter":
      startDate.setMonth(now.getMonth() - 3)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case "all":
      startDate = new Date(2020, 0, 1) // Use a date far enough in the past
      break
  }

  // Get expert performance metrics
  const { data: metrics, error: metricsError } = await supabase
    .from("expert_performance_metrics")
    .select("*")
    .eq("expert_id", expert.id)
    .eq("time_period", timeFrame)
    .gte("start_date", startDate.toISOString().split("T")[0])

  if (metricsError) {
    return { error: metricsError.message }
  }

  // Get booking statistics
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      price,
      created_at,
      scheduled_at,
      completed_at,
      canceled_at,
      client_id,
      reviews!reviews_expert_id_fkey (
        rating
      )
    `)
    .eq("expert_id", expert.id)
    .gte("created_at", startDate.toISOString())

  if (bookingsError) {
    return { error: bookingsError.message }
  }

  // Calculate metrics if they don't exist in the database
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === "completed").length
  const canceledBookings = bookings.filter((b) => b.status === "canceled").length

  // Calculate earnings
  const earnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => sum + (booking.price || 0), 0)

  // Calculate average rating
  const reviews = bookings.flatMap((b) => b.reviews || [])
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

  // Get unique clients
  const uniqueClients = new Set(bookings.map((b) => b.client_id))
  const repeatClientCount = totalBookings - uniqueClients.size

  // Prepare results
  const results = {
    timeFrame,
    metrics: metrics || [],
    calculatedMetrics: {
      totalBookings,
      completedBookings,
      canceledBookings,
      completionRate: totalBookings > 0 ? completedBookings / totalBookings : 0,
      cancellationRate: totalBookings > 0 ? canceledBookings / totalBookings : 0,
      totalEarnings: earnings,
      averageRating,
      repeatClients: repeatClientCount,
      uniqueClients: uniqueClients.size,
    },
    bookingHistory: bookings
      .map((b) => ({
        id: b.id,
        status: b.status,
        price: b.price,
        createdAt: b.created_at,
        scheduledAt: b.scheduled_at,
        completedAt: b.completed_at,
        canceledAt: b.canceled_at,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  }

  return results
}

export async function getClientMetrics(timeFrame: TimeFrame = "month") {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()

  // Configure date range based on timeFrame
  const now = new Date()
  let startDate = new Date()

  switch (timeFrame) {
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "quarter":
      startDate.setMonth(now.getMonth() - 3)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case "all":
      startDate = new Date(2020, 0, 1) // Use a date far enough in the past
      break
  }

  // Get client activity metrics
  const { data: metrics, error: metricsError } = await supabase
    .from("client_activity_metrics")
    .select("*")
    .eq("client_id", session.user.id)
    .eq("time_period", timeFrame)
    .gte("start_date", startDate.toISOString().split("T")[0])

  if (metricsError) {
    return { error: metricsError.message }
  }

  // Get booking statistics
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      price,
      created_at,
      scheduled_at,
      completed_at,
      canceled_at,
      expert_id,
      experts!bookings_expert_id_fkey (
        id,
        user_id,
        users (
          id,
          name,
          image
        )
      ),
      reviews!reviews_booking_id_fkey (
        rating
      )
    `)
    .eq("client_id", session.user.id)
    .gte("created_at", startDate.toISOString())

  if (bookingsError) {
    return { error: bookingsError.message }
  }

  // Calculate metrics
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === "completed").length
  const canceledBookings = bookings.filter((b) => b.status === "canceled").length

  // Calculate spending
  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => sum + (booking.price || 0), 0)

  // Get unique experts
  const uniqueExperts = new Set(bookings.map((b) => b.expert_id))

  // Get reviews given
  const reviewsGiven = bookings.filter((b) => b.reviews && b.reviews.length > 0).length

  // Get subscription data
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("client_subscriptions")
    .select("*")
    .eq("client_id", session.user.id)

  if (subscriptionsError) {
    return { error: subscriptionsError.message }
  }

  // Get package purchases
  const { data: packages, error: packagesError } = await supabase
    .from("client_packages")
    .select("*")
    .eq("client_id", session.user.id)

  if (packagesError) {
    return { error: packagesError.message }
  }

  // Prepare results
  const results = {
    timeFrame,
    metrics: metrics || [],
    calculatedMetrics: {
      totalBookings,
      completedBookings,
      canceledBookings,
      completionRate: totalBookings > 0 ? completedBookings / totalBookings : 0,
      cancellationRate: totalBookings > 0 ? canceledBookings / totalBookings : 0,
      totalSpent,
      uniqueExperts: uniqueExperts.size,
      reviewsGiven,
      activeSubscriptions: subscriptions.filter((s) => s.status === "active").length,
      activePackages: packages.filter((p) => p.status === "active").length,
    },
    bookingHistory: bookings
      .map((b) => ({
        id: b.id,
        status: b.status,
        price: b.price,
        expertName: b.experts?.users?.name || "Unknown",
        expertImage: b.experts?.users?.image,
        createdAt: b.created_at,
        scheduledAt: b.scheduled_at,
        completedAt: b.completed_at,
        canceledAt: b.canceled_at,
        hasReview: b.reviews && b.reviews.length > 0,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      status: s.status,
      currentPeriodEnd: s.current_period_end,
      cancelAtPeriodEnd: s.cancel_at_period_end,
    })),
    packages: packages.map((p) => ({
      id: p.id,
      hoursRemaining: p.hours_remaining,
      status: p.status,
      expiresAt: p.expires_at,
    })),
  }

  return results
}

// This function is meant to be called by a CRON job to update metrics daily
export async function updateAllMetrics() {
  const supabase = createClient()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  // Get all experts
  const { data: experts, error: expertsError } = await supabase.from("experts").select("id,user_id")

  if (expertsError) {
    console.error("Error fetching experts:", expertsError)
    return { error: expertsError.message }
  }

  // For each expert, calculate and store metrics
  for (const expert of experts) {
    await updateExpertMetrics(expert.id, yesterdayStr)
  }

  // Get all clients (all users who have made bookings)
  const { data: clients, error: clientsError } = await supabase.from("bookings").select("client_id").distinct()

  if (clientsError) {
    console.error("Error fetching clients:", clientsError)
    return { error: clientsError.message }
  }

  // For each client, calculate and store metrics
  for (const client of clients) {
    await updateClientMetrics(client.client_id, yesterdayStr)
  }

  return { success: true }
}

async function updateExpertMetrics(expertId: string, date: string) {
  const supabase = createClient()

  // Calculate metrics for different time periods
  await calculateAndStoreExpertMetrics(supabase, expertId, "week", date)
  await calculateAndStoreExpertMetrics(supabase, expertId, "month", date)
  await calculateAndStoreExpertMetrics(supabase, expertId, "quarter", date)
  await calculateAndStoreExpertMetrics(supabase, expertId, "year", date)

  return { success: true }
}

async function calculateAndStoreExpertMetrics(supabase: any, expertId: string, timeFrame: TimeFrame, endDate: string) {
  // Calculate start date based on time frame
  const end = new Date(endDate)
  const start = new Date(endDate)

  switch (timeFrame) {
    case "week":
      start.setDate(end.getDate() - 7)
      break
    case "month":
      start.setMonth(end.getMonth() - 1)
      break
    case "quarter":
      start.setMonth(end.getMonth() - 3)
      break
    case "year":
      start.setFullYear(end.getFullYear() - 1)
      break
  }

  const startDateStr = start.toISOString().split("T")[0]

  // Get booking data for the period
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      price,
      created_at,
      client_id,
      reviews!reviews_expert_id_fkey (
        rating
      )
    `)
    .eq("expert_id", expertId)
    .gte("created_at", startDateStr)
    .lte("created_at", endDate + "T23:59:59")

  if (bookingsError) {
    console.error(`Error fetching bookings for expert ${expertId}:`, bookingsError)
    return
  }

  // Calculate metrics
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === "completed").length
  const canceledBookings = bookings.filter((b) => b.status === "canceled").length

  const completionRate = totalBookings > 0 ? completedBookings / totalBookings : 0
  const cancellationRate = totalBookings > 0 ? canceledBookings / totalBookings : 0

  const earnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => sum + (booking.price || 0), 0)

  const reviews = bookings.flatMap((b) => b.reviews || [])
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

  const uniqueClients = new Set(bookings.map((b) => b.client_id))
  const repeatClients = totalBookings - uniqueClients.size

  // Store metrics
  const metrics = [
    {
      expert_id: expertId,
      metric_type: "completion_rate",
      metric_value: completionRate,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      expert_id: expertId,
      metric_type: "cancellation_rate",
      metric_value: cancellationRate,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      expert_id: expertId,
      metric_type: "average_rating",
      metric_value: averageRating,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      expert_id: expertId,
      metric_type: "booking_count",
      metric_value: totalBookings,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      expert_id: expertId,
      metric_type: "total_earnings",
      metric_value: earnings,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      expert_id: expertId,
      metric_type: "repeat_clients",
      metric_value: repeatClients,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
  ]

  // Delete existing metrics for this period and expert
  await supabase
    .from("expert_performance_metrics")
    .delete()
    .eq("expert_id", expertId)
    .eq("time_period", timeFrame)
    .eq("start_date", startDateStr)
    .eq("end_date", endDate)

  // Insert new metrics
  for (const metric of metrics) {
    await supabase.from("expert_performance_metrics").insert(metric)
  }
}

async function updateClientMetrics(clientId: string, date: string) {
  const supabase = createClient()

  // Calculate metrics for different time periods
  await calculateAndStoreClientMetrics(supabase, clientId, "week", date)
  await calculateAndStoreClientMetrics(supabase, clientId, "month", date)
  await calculateAndStoreClientMetrics(supabase, clientId, "quarter", date)
  await calculateAndStoreClientMetrics(supabase, clientId, "year", date)

  return { success: true }
}

async function calculateAndStoreClientMetrics(supabase: any, clientId: string, timeFrame: TimeFrame, endDate: string) {
  // Calculate start date based on time frame
  const end = new Date(endDate)
  const start = new Date(endDate)

  switch (timeFrame) {
    case "week":
      start.setDate(end.getDate() - 7)
      break
    case "month":
      start.setMonth(end.getMonth() - 1)
      break
    case "quarter":
      start.setMonth(end.getMonth() - 3)
      break
    case "year":
      start.setFullYear(end.getFullYear() - 1)
      break
  }

  const startDateStr = start.toISOString().split("T")[0]

  // Get booking data for the period
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      price,
      created_at,
      expert_id,
      reviews!reviews_booking_id_fkey (
        id
      )
    `)
    .eq("client_id", clientId)
    .gte("created_at", startDateStr)
    .lte("created_at", endDate + "T23:59:59")

  if (bookingsError) {
    console.error(`Error fetching bookings for client ${clientId}:`, bookingsError)
    return
  }

  // Calculate metrics
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === "completed").length
  const canceledBookings = bookings.filter((b) => b.status === "canceled").length

  const completionRate = totalBookings > 0 ? completedBookings / totalBookings : 0
  const cancellationRate = totalBookings > 0 ? canceledBookings / totalBookings : 0

  const spent = bookings.filter((b) => b.status === "completed").reduce((sum, booking) => sum + (booking.price || 0), 0)

  const uniqueExperts = new Set(bookings.map((b) => b.expert_id))
  const reviewsGiven = bookings.filter((b) => b.reviews && b.reviews.length > 0).length

  // Store metrics
  const metrics = [
    {
      client_id: clientId,
      metric_type: "completion_rate",
      metric_value: completionRate,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      client_id: clientId,
      metric_type: "cancellation_rate",
      metric_value: cancellationRate,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      client_id: clientId,
      metric_type: "booking_count",
      metric_value: totalBookings,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      client_id: clientId,
      metric_type: "total_spent",
      metric_value: spent,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      client_id: clientId,
      metric_type: "unique_experts",
      metric_value: uniqueExperts.size,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
    {
      client_id: clientId,
      metric_type: "reviews_given",
      metric_value: reviewsGiven,
      time_period: timeFrame,
      start_date: startDateStr,
      end_date: endDate,
    },
  ]

  // Delete existing metrics for this period and client
  await supabase
    .from("client_activity_metrics")
    .delete()
    .eq("client_id", clientId)
    .eq("time_period", timeFrame)
    .eq("start_date", startDateStr)
    .eq("end_date", endDate)

  // Insert new metrics
  for (const metric of metrics) {
    await supabase.from("client_activity_metrics").insert(metric)
  }
}

