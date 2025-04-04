"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { createNotification } from "./notifications"

// Initialize onboarding for a new user
export async function initializeOnboarding(userId: string, userType: "client" | "expert") {
  const supabase = createClient()

  // Check if onboarding already exists
  const { data: existingProgress } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (existingProgress) {
    return existingProgress
  }

  // Get the first step for this user type
  const { data: firstStep } = await supabase
    .from("onboarding_steps")
    .select("step_key")
    .eq("user_type", userType)
    .order("order_index", { ascending: true })
    .limit(1)
    .single()

  if (!firstStep) {
    console.error("No onboarding steps found for user type:", userType)
    return null
  }

  // Create onboarding progress
  const { data, error } = await supabase
    .from("onboarding_progress")
    .insert({
      user_id: userId,
      current_step: firstStep.step_key,
      completed_steps: [],
      is_completed: false,
      skip_onboarding: false,
      last_activity_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error initializing onboarding:", error)
    return null
  }

  // Send welcome notification
  await createNotification(userId, "platform_update" as any, {
    update_message: `Welcome to Cunslt! We've prepared a personalized onboarding experience to help you get started.`,
  })

  return data
}

// Get onboarding progress for the current user
export async function getOnboardingProgress() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const supabase = createClient()

  // Get user profile to determine user type
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    return null
  }

  const userType = profile.is_expert ? "expert" : "client"

  // Get onboarding progress
  const { data: progress, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching onboarding progress:", error)
    return null
  }

  // If no progress exists, initialize it
  if (!progress) {
    return initializeOnboarding(session.user.id, userType)
  }

  // Get all onboarding steps for this user type
  const { data: steps } = await supabase
    .from("onboarding_steps")
    .select("*")
    .eq("user_type", userType)
    .order("order_index", { ascending: true })

  if (!steps || steps.length === 0) {
    return progress
  }

  // Calculate completion percentage
  const totalRequiredSteps = steps.filter((step) => step.is_required).length
  const completedRequiredSteps = steps.filter(
    (step) => step.is_required && progress.completed_steps.includes(step.step_key),
  ).length

  const completionPercentage =
    totalRequiredSteps > 0 ? Math.round((completedRequiredSteps / totalRequiredSteps) * 100) : 0

  return {
    ...progress,
    steps,
    completionPercentage,
    totalPoints: steps.reduce((sum, step) => sum + step.completion_points, 0),
    earnedPoints: steps
      .filter((step) => progress.completed_steps.includes(step.step_key))
      .reduce((sum, step) => sum + step.completion_points, 0),
  }
}

// Mark an onboarding step as completed
export async function completeOnboardingStep(stepKey: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Get current progress
  const { data: progress, error: progressError } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  if (progressError) {
    console.error("Error fetching onboarding progress:", progressError)
    return { error: "Failed to fetch onboarding progress" }
  }

  // Get user profile to determine user type
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  const userType = profile.is_expert ? "expert" : "client"

  // Get all steps for this user type
  const { data: steps } = await supabase
    .from("onboarding_steps")
    .select("*")
    .eq("user_type", userType)
    .order("order_index", { ascending: true })

  if (!steps || steps.length === 0) {
    return { error: "No onboarding steps found" }
  }

  // Find the current step
  const currentStep = steps.find((step) => step.step_key === stepKey)
  if (!currentStep) {
    return { error: "Invalid step key" }
  }

  // Find the next step
  const currentIndex = steps.findIndex((step) => step.step_key === stepKey)
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null

  // Update completed steps
  const completedSteps = [...progress.completed_steps]
  if (!completedSteps.includes(stepKey)) {
    completedSteps.push(stepKey)
  }

  // Check if all required steps are completed
  const allRequiredStepsCompleted = steps
    .filter((step) => step.is_required)
    .every((step) => completedSteps.includes(step.step_key))

  // Update progress
  const { error: updateError } = await supabase
    .from("onboarding_progress")
    .update({
      completed_steps: completedSteps,
      current_step: nextStep ? nextStep.step_key : progress.current_step,
      is_completed: allRequiredStepsCompleted,
      last_activity_at: new Date().toISOString(),
    })
    .eq("user_id", session.user.id)

  if (updateError) {
    console.error("Error updating onboarding progress:", updateError)
    return { error: "Failed to update onboarding progress" }
  }

  // Revalidate paths
  revalidatePath("/dashboard")
  revalidatePath("/onboarding")

  // If all steps are completed, send a congratulatory notification
  if (allRequiredStepsCompleted && !progress.is_completed) {
    await createNotification(session.user.id, "platform_update" as any, {
      update_message:
        "Congratulations! You have completed all the onboarding steps. You are now ready to fully use the platform.",
    })
  }

  return {
    success: true,
    nextStep: nextStep ? nextStep.step_key : null,
    isCompleted: allRequiredStepsCompleted,
  }
}

// Skip onboarding
export async function skipOnboarding() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const supabase = createClient()

  // Update progress
  const { error } = await supabase
    .from("onboarding_progress")
    .update({
      skip_onboarding: true,
      last_activity_at: new Date().toISOString(),
    })
    .eq("user_id", session.user.id)

  if (error) {
    console.error("Error skipping onboarding:", error)
    return { error: "Failed to skip onboarding" }
  }

  // Revalidate paths
  revalidatePath("/dashboard")
  revalidatePath("/onboarding")

  return { success: true }
}

// Get tooltips for a specific page
export async function getTooltipsForPage(pagePath: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  const supabase = createClient()

  // Get user profile to determine user type
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    return []
  }

  const userType = profile.is_expert ? "expert" : "client"

  // Get onboarding progress
  const { data: progress } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  // If user has skipped onboarding or completed it, don't show tooltips
  if (progress?.skip_onboarding || progress?.is_completed) {
    return []
  }

  // Get tooltips for this page and user type
  const { data: tooltips, error } = await supabase
    .from("onboarding_tooltips")
    .select("*")
    .eq("user_type", userType)
    .eq("page_path", pagePath)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching tooltips:", error)
    return []
  }

  return tooltips || []
}

