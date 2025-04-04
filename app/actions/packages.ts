"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"

export async function getExpertPackages(expertId: string) {
  const supabase = createClient()

  const { data: packages, error } = await supabase
    .from("consultation_packages")
    .select("*")
    .eq("expert_id", expertId)
    .eq("is_active", true)
    .order("total_price", { ascending: true })

  if (error) {
    throw new Error("Failed to fetch consultation packages")
  }

  return packages
}

export async function getClientPackages() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data: packages, error } = await supabase
    .from("client_packages")
    .select(`
      *,
      consultation_packages (
        *,
        experts (
          id,
          title,
          hourly_rate
        )
      )
    `)
    .eq("client_id", user.id)
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to fetch client packages")
  }

  return packages
}

export async function purchasePackage(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const packageId = formData.get("packageId") as string

  // Get the package details
  const { data: packageData, error: packageError } = await supabase
    .from("consultation_packages")
    .select("*")
    .eq("id", packageId)
    .single()

  if (packageError || !packageData) {
    throw new Error("Consultation package not found")
  }

  // Create a payment intent with Stripe
  // Note: In a real implementation, you would create a Stripe Checkout session
  // or use Stripe Elements to collect payment information

  // For this example, we'll simulate a successful payment

  // Calculate expiration date based on validity_days
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + packageData.validity_days)

  // Create the client package in our database
  const { data: clientPackage, error: createError } = await supabase
    .from("client_packages")
    .insert({
      client_id: user.id,
      package_id: packageId,
      hours_remaining: packageData.hours_included,
      status: "active",
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (createError) {
    throw new Error("Failed to purchase package")
  }

  // Create a payment record
  await supabase.from("payments").insert({
    client_id: user.id,
    amount: packageData.total_price,
    payment_method: "card",
    status: "completed",
    stripe_payment_id: `pi_${Math.random().toString(36).substring(2, 15)}`, // Simulated Stripe ID
  })

  revalidatePath("/packages")
  redirect("/packages?success=purchased")
}

export async function createExpertPackage(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get the expert profile
  const { data: expert, error: expertError } = await supabase
    .from("experts")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (expertError || !expert) {
    throw new Error("Expert profile not found")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const hoursIncluded = Number.parseInt(formData.get("hoursIncluded") as string)
  const pricePerHour = Number.parseFloat(formData.get("pricePerHour") as string)
  const discountPercentage = Number.parseFloat((formData.get("discountPercentage") as string) || "0")
  const validityDays = Number.parseInt(formData.get("validityDays") as string)

  // Calculate total price with discount
  const totalPrice = pricePerHour * hoursIncluded * (1 - discountPercentage / 100)

  // Create the package
  const { error: createError } = await supabase.from("consultation_packages").insert({
    expert_id: expert.id,
    name,
    description,
    hours_included: hoursIncluded,
    price_per_hour: pricePerHour,
    total_price: totalPrice,
    discount_percentage: discountPercentage,
    validity_days: validityDays,
    is_active: true,
  })

  if (createError) {
    throw new Error("Failed to create package")
  }

  revalidatePath("/expert/packages")
  redirect("/expert/packages?success=created")
}

