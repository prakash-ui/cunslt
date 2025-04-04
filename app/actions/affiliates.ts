"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { nanoid } from "nanoid"
import { createNotification } from "./notifications"
import { headers } from "next/headers"

// Apply to become an affiliate partner
export async function applyForAffiliate(data: {
  companyName: string
  website: string
  paymentMethod: string
  paymentDetails: any
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Check if user is already an affiliate
  const { data: existingAffiliate } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (existingAffiliate) {
    return { error: "You are already an affiliate partner" }
  }

  // Create the affiliate partner
  const { data: affiliate, error } = await supabase
    .from("affiliate_partners")
    .insert({
      user_id: session.user.id,
      company_name: data.companyName,
      website: data.website,
      payment_method: data.paymentMethod,
      payment_details: data.paymentDetails,
      is_approved: false,
      is_active: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error applying for affiliate:", error)
    return { error: "Failed to apply for affiliate program" }
  }

  // Notify admins about the new application
  // This would typically involve sending an email or creating a task

  // Revalidate paths
  revalidatePath("/dashboard/affiliate")

  return { success: true, affiliate }
}

// Create an affiliate link
export async function createAffiliateLink(data: {
  campaign: string
  destinationUrl: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Check if user is an approved affiliate
  const { data: affiliate } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_approved", true)
    .eq("is_active", true)
    .single()

  if (!affiliate) {
    return { error: "You are not an approved affiliate partner" }
  }

  // Generate a unique affiliate code
  const code = nanoid(8).toLowerCase()

  // Create the affiliate link
  const { data: link, error } = await supabase
    .from("affiliate_links")
    .insert({
      affiliate_id: session.user.id,
      code,
      campaign: data.campaign,
      destination_url: data.destinationUrl || "/",
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating affiliate link:", error)
    return { error: "Failed to create affiliate link" }
  }

  // Revalidate paths
  revalidatePath("/dashboard/affiliate")

  return { success: true, link }
}

// Track an affiliate link click
export async function trackAffiliateClick(code: string) {
  const supabase = createClient()

  // Find the affiliate link
  const { data: link, error: linkError } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (linkError || !link) {
    console.error("Error finding affiliate link:", linkError)
    return { error: "Invalid affiliate link" }
  }

  // Get request information
  const headersList = headers()
  const ipAddress = headersList.get("x-forwarded-for") || undefined
  const userAgent = headersList.get("user-agent") || undefined
  const referrer = headersList.get("referer") || undefined

  // Record the click
  const { error } = await supabase.from("affiliate_clicks").insert({
    affiliate_link_id: link.id,
    ip_address: ipAddress,
    user_agent: userAgent,
    referrer_url: referrer,
  })

  if (error) {
    console.error("Error tracking affiliate click:", error)
    // Don't return an error to the user, just log it
  }

  return { success: true, destinationUrl: link.destination_url }
}

// Record an affiliate conversion
export async function recordAffiliateConversion(
  userId: string,
  bookingId: string,
  amount: number,
  affiliateCode: string,
) {
  const supabase = createClient()

  // Find the affiliate link
  const { data: link, error: linkError } = await supabase
    .from("affiliate_links")
    .select("*, affiliate_partners!inner(*)")
    .eq("code", affiliateCode)
    .eq("is_active", true)
    .single()

  if (linkError || !link) {
    console.error("Error finding affiliate link:", linkError)
    return { error: "Invalid affiliate link" }
  }

  // Calculate commission amount
  const commissionRate = link.affiliate_partners.commission_rate
  const commissionAmount = (amount * commissionRate) / 100

  // Record the conversion
  const { data: conversion, error } = await supabase
    .from("affiliate_conversions")
    .insert({
      affiliate_link_id: link.id,
      user_id: userId,
      booking_id: bookingId,
      amount,
      commission_amount: commissionAmount,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error recording affiliate conversion:", error)
    return { error: "Failed to record affiliate conversion" }
  }

  // Create a reward for the affiliate
  const { error: rewardError } = await supabase.from("rewards").insert({
    user_id: link.affiliate_id,
    amount: commissionAmount,
    type: "affiliate",
    status: "pending",
    reference_id: conversion.id,
    reference_type: "affiliate_conversion",
  })

  if (rewardError) {
    console.error("Error creating affiliate reward:", rewardError)
    return { error: "Failed to create affiliate reward" }
  }

  // Notify the affiliate about the conversion
  await createNotification(link.affiliate_id, "platform_update" as any, {
    update_message: `You've earned a commission of $${commissionAmount.toFixed(2)} from an affiliate conversion!`,
  })

  return { success: true, conversion }
}

// Get affiliate statistics for the current user
export async function getAffiliateStats() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Check if user is an affiliate
  const { data: affiliate } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (!affiliate) {
    return { error: "You are not an affiliate partner" }
  }

  // Get all affiliate links
  const { data: links, error: linksError } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("affiliate_id", session.user.id)

  if (linksError) {
    console.error("Error fetching affiliate links:", linksError)
    return { error: "Failed to fetch affiliate links" }
  }

  // Get all clicks
  const linkIds = links.map((link) => link.id)
  const { data: clicks, error: clicksError } =
    linkIds.length > 0
      ? await supabase.from("affiliate_clicks").select("*").in("affiliate_link_id", linkIds)
      : { data: [], error: null }

  if (clicksError) {
    console.error("Error fetching affiliate clicks:", clicksError)
    return { error: "Failed to fetch affiliate clicks" }
  }

  // Get all conversions
  const { data: conversions, error: conversionsError } =
    linkIds.length > 0
      ? await supabase.from("affiliate_conversions").select("*").in("affiliate_link_id", linkIds)
      : { data: [], error: null }

  if (conversionsError) {
    console.error("Error fetching affiliate conversions:", conversionsError)
    return { error: "Failed to fetch affiliate conversions" }
  }

  // Get all rewards
  const { data: rewards, error: rewardsError } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("type", "affiliate")

  if (rewardsError) {
    console.error("Error fetching affiliate rewards:", rewardsError)
    return { error: "Failed to fetch affiliate rewards" }
  }

  // Calculate statistics
  const totalLinks = links.length
  const totalClicks = clicks.length
  const totalConversions = conversions.length
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

  const totalEarnings = rewards.reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const pendingEarnings = rewards
    .filter((r) => r.status === "pending")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const approvedEarnings = rewards
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)

  // Group clicks by date for chart data
  const clicksByDate = clicks.reduce((acc, click) => {
    const date = new Date(click.created_at).toISOString().split("T")[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  // Group conversions by date for chart data
  const conversionsByDate = conversions.reduce((acc, conversion) => {
    const date = new Date(conversion.created_at).toISOString().split("T")[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return {
    affiliate,
    totalLinks,
    totalClicks,
    totalConversions,
    conversionRate,
    totalEarnings,
    pendingEarnings,
    approvedEarnings,
    links,
    clicksByDate,
    conversionsByDate,
  }
}

