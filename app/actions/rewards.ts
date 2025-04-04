"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { createNotification } from "./notifications"

// Get rewards for the current user
export async function getUserRewards() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Get all rewards for the user
  const { data: rewards, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching rewards:", error)
    return { error: "Failed to fetch rewards" }
  }

  // Calculate totals
  const totalRewards = rewards.reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const availableRewards = rewards
    .filter((r) => r.status === "approved")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const pendingRewards = rewards
    .filter((r) => r.status === "pending")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)
  const paidRewards = rewards
    .filter((r) => r.status === "paid")
    .reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)

  return {
    rewards,
    totalRewards,
    availableRewards,
    pendingRewards,
    paidRewards,
  }
}

// Request a payout for available rewards
export async function requestRewardPayout(data: {
  amount: number
  paymentMethod: string
  paymentDetails: any
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Get available rewards
  const { data: rewards, error: rewardsError } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "approved")

  if (rewardsError) {
    console.error("Error fetching rewards:", rewardsError)
    return { error: "Failed to fetch rewards" }
  }

  // Calculate available balance
  const availableBalance = rewards.reduce((sum, reward) => sum + Number.parseFloat(reward.amount), 0)

  // Check if user has enough balance
  if (data.amount > availableBalance) {
    return { error: "Insufficient balance for payout" }
  }

  // Create the payout request
  const { data: payout, error } = await supabase
    .from("reward_payouts")
    .insert({
      user_id: session.user.id,
      amount: data.amount,
      payment_method: data.paymentMethod,
      payment_details: data.paymentDetails,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating payout request:", error)
    return { error: "Failed to create payout request" }
  }

  // Mark rewards as paid, starting with the oldest
  let remainingAmount = data.amount
  for (const reward of rewards.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
    if (remainingAmount <= 0) break

    const rewardAmount = Number.parseFloat(reward.amount)
    if (rewardAmount <= remainingAmount) {
      // Mark the entire reward as paid
      await supabase.from("rewards").update({ status: "paid" }).eq("id", reward.id)

      remainingAmount -= rewardAmount
    } else {
      // Split the reward
      await supabase
        .from("rewards")
        .update({ amount: rewardAmount - remainingAmount })
        .eq("id", reward.id)

      // Create a new reward record for the paid portion
      await supabase.from("rewards").insert({
        user_id: session.user.id,
        amount: remainingAmount,
        type: reward.type,
        status: "paid",
        reference_id: reward.reference_id,
        reference_type: reward.reference_type,
      })

      remainingAmount = 0
    }
  }

  // Notify the user
  await createNotification(session.user.id, "platform_update" as any, {
    update_message: `Your payout request for $${data.amount.toFixed(2)} has been submitted and is being processed.`,
  })

  // Revalidate paths
  revalidatePath("/dashboard/rewards")

  return { success: true, payout }
}

// Get payout history for the current user
export async function getPayoutHistory() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Get all payouts for the user
  const { data: payouts, error } = await supabase
    .from("reward_payouts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout history:", error)
    return { error: "Failed to fetch payout history" }
  }

  return { payouts }
}

