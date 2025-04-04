import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { approveExpert, rejectExpert } from "@/app/actions/admin"
import { ExpertApprovalTable } from "@/components/admin/experts/expert-approval-table"

export const metadata: Metadata = {
  title: "Expert Approval | Cunslt Admin",
  description: "Review and approve expert applications",
}

export default async function AdminExpertsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/experts")
  }

  const supabase = createClient()

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/")
  }

  // Get all experts
  const { data: experts } = await supabase
    .from("experts")
    .select(`
      id,
      user_id,
      title,
      hourly_rate,
      bio,
      expertise,
      experience,
      education,
      certifications,
      status,
      created_at,
      user_profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  // Format experts for the table
  const formattedExperts =
    experts?.map((expert) => ({
      id: expert.id,
      userId: expert.user_id,
      name: expert.user_profiles.full_name,
      email: expert.user_profiles.email,
      title: expert.title,
      expertise: expert.expertise || [],
      hourlyRate: expert.hourly_rate,
      status: expert.status as "pending" | "approved" | "rejected",
      submittedAt: expert.created_at,
      avatar: expert.user_profiles.avatar_url,
      bio: expert.bio || "",
      experience: expert.experience || "",
      education: expert.education || "",
      certifications: expert.certifications || [],
    })) || []

  return (
    <div className="container py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expert Approval</h1>
          <p className="text-muted-foreground">Review and manage expert applications</p>
        </div>

        <ExpertApprovalTable experts={formattedExperts} onApprove={approveExpert} onReject={rejectExpert} />
      </div>
    </div>
  )
}

