"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"

export async function getExpertWallet() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert profile not found")
  }

  const { data: wallet, error } = await supabase.from("expert_wallets").select("*").eq("expert_id", expert.id).single()

  if (error) {
    throw new Error("Failed to fetch wallet")
  }

  return wallet
}

export async function getWalletTransactions(limit = 10) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert profile not found")
  }

  const { data: transactions, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("expert_id", expert.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error("Failed to fetch transactions")
  }

  return transactions
}

export async function requestWithdrawal(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentMethod = formData.get("paymentMethod") as string
  const notes = formData.get("notes") as string

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount")
  }

  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert profile not found")
  }

  // Check if expert has enough available balance
  const { data: wallet } = await supabase
    .from("expert_wallets")
    .select("available_balance")
    .eq("expert_id", expert.id)
    .single()

  if (!wallet || wallet.available_balance < amount) {
    throw new Error("Insufficient funds")
  }

  // Create withdrawal request
  const { error: withdrawalError } = await supabase.from("withdrawal_requests").insert({
    expert_id: expert.id,
    amount,
    status: "pending",
    payment_method: paymentMethod,
    notes,
  })

  if (withdrawalError) {
    throw new Error("Failed to create withdrawal request")
  }

  // Update wallet balance
  const { error: walletError } = await supabase
    .from("expert_wallets")
    .update({
      available_balance: wallet.available_balance - amount,
      pending_withdrawal: (wallet.pending_withdrawal || 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("expert_id", expert.id)

  if (walletError) {
    throw new Error("Failed to update wallet balance")
  }

  // Add transaction record
  await supabase.from("wallet_transactions").insert({
    expert_id: expert.id,
    amount: -amount,
    type: "withdrawal_request",
    status: "pending",
    description: `Withdrawal request via ${paymentMethod}`,
  })

  revalidatePath("/expert/wallet")
  redirect("/expert/wallet?success=withdrawal-requested")
}

export async function getWithdrawalRequests(status?: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // For experts, get their own withdrawal requests
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (expert) {
    let query = supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("expert_id", expert.id)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      throw new Error("Failed to fetch withdrawal requests")
    }

    return data
  }

  // For admins, get all withdrawal requests
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  if (userProfile?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  let query = supabase
    .from("withdrawal_requests")
    .select(`
      *,
      experts (
        id,
        user_id,
        user_profiles (
          first_name,
          last_name,
          email
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error("Failed to fetch withdrawal requests")
  }

  return data
}

export async function processWithdrawal(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  if (userProfile?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const withdrawalId = formData.get("withdrawalId") as string
  const action = formData.get("action") as "approve" | "reject"
  const paymentReference = formData.get("paymentReference") as string
  const notes = formData.get("notes") as string

  // Get withdrawal request
  const { data: withdrawal } = await supabase.from("withdrawal_requests").select("*").eq("id", withdrawalId).single()

  if (!withdrawal) {
    throw new Error("Withdrawal request not found")
  }

  if (withdrawal.status !== "pending") {
    throw new Error("Withdrawal request already processed")
  }

  // Update withdrawal request
  const { error: withdrawalError } = await supabase
    .from("withdrawal_requests")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      processed_at: new Date().toISOString(),
      processed_by: user.id,
      payment_reference: paymentReference,
      notes: notes,
    })
    .eq("id", withdrawalId)

  if (withdrawalError) {
    throw new Error("Failed to update withdrawal request")
  }

  // Get expert wallet
  const { data: wallet } = await supabase
    .from("expert_wallets")
    .select("*")
    .eq("expert_id", withdrawal.expert_id)
    .single()

  if (!wallet) {
    throw new Error("Expert wallet not found")
  }

  // Update wallet balance
  if (action === "approve") {
    // For approved withdrawals, reduce pending_withdrawal
    const { error: walletError } = await supabase
      .from("expert_wallets")
      .update({
        pending_withdrawal: wallet.pending_withdrawal - withdrawal.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("expert_id", withdrawal.expert_id)

    if (walletError) {
      throw new Error("Failed to update wallet balance")
    }

    // Add transaction record
    await supabase.from("wallet_transactions").insert({
      expert_id: withdrawal.expert_id,
      amount: -withdrawal.amount,
      type: "withdrawal",
      status: "completed",
      description: `Withdrawal processed. Reference: ${paymentReference}`,
      reference: paymentReference,
    })
  } else {
    // For rejected withdrawals, return funds to available balance
    const { error: walletError } = await supabase
      .from("expert_wallets")
      .update({
        available_balance: wallet.available_balance + withdrawal.amount,
        pending_withdrawal: wallet.pending_withdrawal - withdrawal.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("expert_id", withdrawal.expert_id)

    if (walletError) {
      throw new Error("Failed to update wallet balance")
    }

    // Add transaction record
    await supabase.from("wallet_transactions").insert({
      expert_id: withdrawal.expert_id,
      amount: withdrawal.amount,
      type: "withdrawal_rejected",
      status: "completed",
      description: `Withdrawal request rejected. Reason: ${notes}`,
    })
  }

  revalidatePath("/admin/withdrawals")
  redirect("/admin/withdrawals?success=withdrawal-processed")
}

