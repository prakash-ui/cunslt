"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { nanoid } from "nanoid"
import { createNotification } from "./notifications"

// Generate a referral code for the current user
export async function generateReferralCode() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Check if user already has a referral code
  const { data: existingCode } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .single()

  if (existingCode) {
    return { code: existingCode.code }
  }

  // Generate a unique referral code
  const code = nanoid(8).toUpperCase()

  // Insert the new referral code
  const { data, error } = await supabase
    .from("referral_codes")
    .insert({
      user_id: session.user.id,
      code,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Error generating referral code:", error)
    return { error: "Failed to generate referral code" }
  }

  // Revalidate paths
  revalidatePath("/dashboard/referrals")

  return { code }
}

// Get referral code for the current user
export async function getReferralCode() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Get user's referral code
  const { data, error } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching referral code:", error)
    return { error: "Failed to fetch referral code" }
  }

  if (!data) {
    // Generate a new code if one doesn't exist
    return generateReferralCode()
  }

  return { code: data.code }
}

// Track a referral when a user signs up with a referral code
export async function trackReferral(referredUserId: string, referralCode: string) {
  const supabase = createClient()

  // Find the referral code
  const { data: codeData, error: codeError } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("code", referralCode)
    .eq("is_active", true)
    .single()

  if (codeError || !codeData) {
    console.error("Error finding referral code:", codeError)
    return { error: "Invalid referral code" }
  }

  // Make sure user isn't referring themselves
  if (codeData.user_id === referredUserId) {
    return { error: "Cannot refer yourself" }
  }

  // Check if this user has already been referred
  const { data: existingReferral } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", referredUserId)
    .single()

  if (existingReferral) {
    return { error: "User has already been referred" }
  }

  // Create the referral
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: codeData.user_id,
      referred_id: referredUserId,
      referral_code: referralCode,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating referral:", error)
    return { error: "Failed to create referral" }
  }

  // Notify the referrer
  await createNotification(codeData.user_id, "platform_update" as any, {
    update_message: "Someone has signed up using your referral link!",
  })

  return { success: true, referral: data }
}

// Complete a referral when the referred user makes a qualifying purchase
export async function completeReferral(referredUserId: string, bookingId: string, amount: number) {
  const supabase = createClient()

  // Find the referral
  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", referredUserId)
    .eq("status", "pending")
    .single()

  if (referralError || !referral) {
    console.error("Error finding referral:", referralError)
    return { error: "No pending referral found for this user" }
  }

  // Get referral program settings
  const { data: settings, error: settingsError } = await supabase
    .from("referral_program_settings")
    .select("*")
    .eq("is_active", true)
    .single()

  if (settingsError || !settings) {
    console.error("Error fetching referral program settings:", settingsError)
    return { error: "Failed to fetch referral program settings" }
  }

  // Check if the purchase amount meets the minimum spend requirement
  if (amount < settings.min_spend_amount) {
    return { error: "Purchase amount does not meet the minimum spend requirement" }
  }

  // Update the referral status
  const { error: updateError } = await supabase
    .from("referrals")
    .update({
      status: "completed",
      converted_at: new Date().toISOString(),
    })
    .eq("id", referral.id)

  if (updateError) {
    console.error("Error updating referral:", updateError)
    return { error: "Failed to update referral" }
  }

  // Create rewards for both the referrer and the referred user
  const referrerReward = settings.referrer_reward
  const referredReward = settings.referred_reward

  // Create reward for the referrer
  const { error: referrerRewardError } = await supabase.from("rewards").insert({
    user_id: referral.referrer_id,
    amount: referrerReward,
    type: "referral",
    status: "approved",
    reference_id: referral.id,
    reference_type: "referral",
  })

  if (referrerRewardError) {
    console.error("Error creating referrer reward:", referrerRewardError)
    return { error: "Failed to create referrer reward" }
  }

  // Create reward for the referred user
  const { error: referredRewardError } = await supabase.from("rewards").insert({
    user_id: referral.referred_id,
    amount: referredReward,
    type: "referral",
    status: "approved",
    reference_id: referral.id,
    reference_type: "referral",
  })

  if (referredRewardError) {
    console.error("Error creating referred reward:", referredRewardError)
    return { error: "Failed to create referred reward" }
  }

  // Update the referral status to rewarded
  await supabase
    .from("referrals")
    .update({
      status: "rewarded",
    })
    .eq("id", referral.id)

  // Notify both users about their rewards
  await createNotification(referral.referrer_id, "platform_update" as any, {
    update_message: `You've earned a ${settings.reward_type} reward of $${referrerReward} from your referral!`,
  })

  await createNotification(referral.referred_id, "platform_update" as any, {
    update_message: `You've earned a ${settings.reward_type} reward of $${referredReward} for signing up with a referral code!`,
  })

  // Revalidate paths
  revalidatePath("/dashboard/referrals")

  return { success: true }
}

// Get referral statistics for the current user
export async function getReferralStats() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Get all referrals made by the user
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", session.user.id)

  if (referralsError) {
    console.error("Error fetching referrals:", referralsError)
    return { error: "Failed to fetch referrals" }
  }

  // Get all rewards earned by the user
  const { data: rewards, error: rewardsError } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("type", "referral")

  if (rewardsError) {
    console.error("Error fetching rewards:", rewardsError)
    return { error: "Failed to fetch rewards" }
  }

  // Calculate statistics
  const totalReferrals = referrals.length
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length
  const completedReferrals = referrals.filter((r) => r.status === "completed" || r.status === "rewarded").length
  const totalRewards = rewards.reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const pendingRewards = rewards
    .filter((r) => r.status === "pending")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const paidRewards = rewards
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)

  return {
    totalReferrals,
    pendingReferrals,
    completedReferrals,
    totalRewards,
    pendingRewards,
    paidRewards,
    referrals,
    rewards,
  }
}

