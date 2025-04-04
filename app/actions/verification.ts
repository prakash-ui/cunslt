"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"
import { getUserProfile } from "./user"
import { getExpertProfile } from "./expert"

/**
 * Submit a verification request for an expert
 */
export async function submitVerificationRequest(expertId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to submit a verification request")
  }

  const expert = await getExpertProfile(expertId)

  if (!expert) {
    throw new Error("Expert profile not found")
  }

  // Check if there's already a pending verification request
  const { data: existingRequest, error: checkError } = await supabase
    .from("verification_requests")
    .select("id, status")
    .eq("expert_id", expertId)
    .eq("status", "pending")
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(`Error checking verification status: ${checkError.message}`)
  }

  if (existingRequest) {
    return { id: existingRequest.id, status: "existing" }
  }

  // Create a new verification request
  const { data, error } = await supabase
    .from("verification_requests")
    .insert({
      expert_id: expertId,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(`Error submitting verification request: ${error.message}`)
  }

  revalidatePath(`/expert/profile`)
  revalidatePath(`/expert/verification`)

  return { id: data.id, status: "created" }
}

/**
 * Upload verification documents
 */
export async function uploadVerificationDocument(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to upload verification documents")
  }

  const verificationId = formData.get("verificationId") as string
  const documentType = formData.get("documentType") as string
  const file = formData.get("file") as File

  if (!verificationId || !documentType || !file) {
    throw new Error("Missing required fields")
  }

  // Check if verification request exists and belongs to the user
  const { data: verification, error: verificationError } = await supabase
    .from("verification_requests")
    .select("id, expert_id")
    .eq("id", verificationId)
    .single()

  if (verificationError) {
    throw new Error(`Verification request not found: ${verificationError.message}`)
  }

  // Get expert profile to check ownership
  const { data: expert, error: expertError } = await supabase
    .from("experts")
    .select("id")
    .eq("id", verification.expert_id)
    .single()

  if (expertError) {
    throw new Error(`Expert profile not found: ${expertError.message}`)
  }

  // Upload file to storage
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `verification/${verificationId}/${fileName}`

  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)

  if (uploadError) {
    throw new Error(`Error uploading document: ${uploadError.message}`)
  }

  // Save document metadata to database
  const { error: saveError } = await supabase.from("verification_documents").insert({
    verification_id: verificationId,
    document_type: documentType,
    document_path: filePath,
    document_name: file.name,
  })

  if (saveError) {
    throw new Error(`Error saving document metadata: ${saveError.message}`)
  }

  revalidatePath(`/expert/verification/${verificationId}`)

  return { success: true }
}

/**
 * Get verification request by ID
 */
export async function getVerificationRequest(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("verification_requests")
    .select(`
      id,
      status,
      submitted_at,
      reviewed_at,
      rejection_reason,
      expert_id,
      experts (
        id,
        title,
        bio,
        hourly_rate,
        experience,
        education,
        location
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Error fetching verification request: ${error.message}`)
  }

  return data
}

/**
 * Get verification documents for a verification request
 */
export async function getVerificationDocuments(verificationId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("verification_documents")
    .select("*")
    .eq("verification_id", verificationId)

  if (error) {
    throw new Error(`Error fetching verification documents: ${error.message}`)
  }

  return data
}

/**
 * Get expert verification status
 */
export async function getExpertVerificationStatus(expertId: string) {
  const supabase = createClient()

  const { data: expert, error: expertError } = await supabase
    .from("experts")
    .select("is_verified")
    .eq("id", expertId)
    .single()

  if (expertError) {
    throw new Error(`Error fetching expert: ${expertError.message}`)
  }

  const { data: requests, error: requestsError } = await supabase
    .from("verification_requests")
    .select("id, status, submitted_at")
    .eq("expert_id", expertId)
    .order("submitted_at", { ascending: false })
    .limit(1)

  if (requestsError) {
    throw new Error(`Error fetching verification requests: ${requestsError.message}`)
  }

  return {
    isVerified: expert.is_verified,
    pendingRequest: requests.length > 0 && requests[0].status === "pending" ? requests[0] : null,
    latestRequest: requests.length > 0 ? requests[0] : null,
  }
}

/**
 * Get all pending verification requests (admin only)
 */
export async function getPendingVerificationRequests() {
  const supabase = createClient()
  const user = await getCurrentUser()
  const profile = user ? await getUserProfile(user.id) : null

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized access")
  }

  const { data, error } = await supabase
    .from("verification_requests")
    .select(`
      id,
      status,
      submitted_at,
      expert_id,
      experts (
        id,
        title,
        bio
      )
    `)
    .eq("status", "pending")
    .order("submitted_at", { ascending: true })

  if (error) {
    throw new Error(`Error fetching verification requests: ${error.message}`)
  }

  return data
}

/**
 * Approve a verification request (admin only)
 */
export async function approveVerificationRequest(id: string) {
  const supabase = createClient()
  const user = await getCurrentUser()
  const profile = user ? await getUserProfile(user.id) : null

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized access")
  }

  // Get the verification request to get the expert ID
  const { data: request, error: requestError } = await supabase
    .from("verification_requests")
    .select("expert_id")
    .eq("id", id)
    .single()

  if (requestError) {
    throw new Error(`Verification request not found: ${requestError.message}`)
  }

  // Update the verification request status
  const { error: updateRequestError } = await supabase
    .from("verification_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", id)

  if (updateRequestError) {
    throw new Error(`Error updating verification request: ${updateRequestError.message}`)
  }

  // Update the expert's verification status
  const { error: updateExpertError } = await supabase
    .from("experts")
    .update({
      is_verified: true,
    })
    .eq("id", request.expert_id)

  if (updateExpertError) {
    throw new Error(`Error updating expert verification status: ${updateExpertError.message}`)
  }

  revalidatePath(`/admin/verifications`)
  revalidatePath(`/expert/profile/${request.expert_id}`)

  return { success: true }
}

/**
 * Reject a verification request (admin only)
 */
export async function rejectVerificationRequest(id: string, reason: string) {
  const supabase = createClient()
  const user = await getCurrentUser()
  const profile = user ? await getUserProfile(user.id) : null

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized access")
  }

  // Update the verification request status
  const { error } = await supabase
    .from("verification_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: reason,
    })
    .eq("id", id)

  if (error) {
    throw new Error(`Error rejecting verification request: ${error.message}`)
  }

  revalidatePath(`/admin/verifications`)

  return { success: true }
}

