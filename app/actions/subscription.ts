"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"
import { stripe } from "@/lib/stripe"

export async function getSubscriptionPlans() {
  const supabase = createClient()

  const { data: plans, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true })

  if (error) {
    throw new Error("Failed to fetch subscription plans")
  }

  return plans
}

export async function getCurrentSubscription() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: subscription, error } = await supabase
    .from("client_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("client_id", user.id)
    .eq("status", "active")
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    throw new Error("Failed to fetch subscription")
  }

  return subscription
}

export async function subscribeToplan(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const planId = formData.get("planId") as string

  // Get the plan details
  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single()

  if (planError || !plan) {
    throw new Error("Subscription plan not found")
  }

  // Check if user already has an active subscription
  const { data: existingSubscription, error: subError } = await supabase
    .from("client_subscriptions")
    .select("*")
    .eq("client_id", user.id)
    .eq("status", "active")
    .single()

  if (existingSubscription) {
    // Cancel the existing subscription in Stripe if there's a Stripe subscription ID
    if (existingSubscription.stripe_subscription_id) {
      await stripe.subscriptions.update(existingSubscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    // Update the existing subscription in our database
    await supabase
      .from("client_subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSubscription.id)
  }

  // Create a new subscription in Stripe
  // Note: In a real implementation, you would create a Stripe Checkout session
  // or use Stripe Elements to collect payment information

  // For this example, we'll simulate a successful subscription creation
  const now = new Date()
  let periodEnd: Date

  switch (plan.billing_interval) {
    case "monthly":
      periodEnd = new Date(now.setMonth(now.getMonth() + 1))
      break
    case "quarterly":
      periodEnd = new Date(now.setMonth(now.getMonth() + 3))
      break
    case "annual":
      periodEnd = new Date(now.setFullYear(now.getFullYear() + 1))
      break
    default:
      periodEnd = new Date(now.setMonth(now.getMonth() + 1))
  }

  // Create the subscription in our database
  const { data: subscription, error: createError } = await supabase
    .from("client_subscriptions")
    .insert({
      client_id: user.id,
      plan_id: planId,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      stripe_subscription_id: `sub_${Math.random().toString(36).substring(2, 15)}`, // Simulated Stripe ID
    })
    .select()
    .single()

  if (createError) {
    throw new Error("Failed to create subscription")
  }

  revalidatePath("/subscription")
  redirect("/subscription?success=subscribed")
}

export async function cancelSubscription(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const subscriptionId = formData.get("subscriptionId") as string

  // Get the subscription details
  const { data: subscription, error: subError } = await supabase
    .from("client_subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .eq("client_id", user.id)
    .single()

  if (subError || !subscription) {
    throw new Error("Subscription not found")
  }

  // Cancel the subscription in Stripe if there's a Stripe subscription ID
  if (subscription.stripe_subscription_id) {
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })
  }

  // Update the subscription in our database
  const { error: updateError } = await supabase
    .from("client_subscriptions")
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)

  if (updateError) {
    throw new Error("Failed to cancel subscription")
  }

  revalidatePath("/subscription")
  redirect("/subscription?success=canceled")
}

