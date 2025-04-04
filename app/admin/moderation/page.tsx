import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { approveContent, removeContent, warnUser } from "@/app/actions/admin"
import { ContentModeration } from "@/components/admin/moderation/content-moderation"

export const metadata: Metadata = {
  title: "Content Moderation | Cunslt Admin",
  description: "Moderate reported content on the platform",
}

export default async function AdminModerationPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/moderation")
  }

  const supabase = createClient()

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/")
  }

  // Get reported content
  const { data: reports } = await supabase
    .from("content_reports")
    .select(`
      id,
      content_type,
      content_id,
      content_text,
      reason,
      status,
      created_at,
      reported_by,
      reported_user_id,
      reported_by_user: user_profiles!content_reports_reported_by_fkey (
        id,
        full_name,
        avatar_url
      ),
      reported_user: user_profiles!content_reports_reported_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  // Format reports for the component
  const formattedReports = reports?.map(report => ({
    id: report.id,
    type: report.content_type as "review" | "profile" | "message" | "comment",
    content: report.content_text || "",
    reason: report.reason,
    reportedBy: {
      id:  "",
      name:  "",
      avatar: ""
    },
    reportedUser: {
      id: "",
      name: "",
      avatar: ""
    },
    status: report.status as "pending" | "approved" | "removed",
    reportedAt: report.created_at
  })) ?? []

  return (
    <div className="container py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate reported content</p>
        </div>

        {/* <ContentModeration
          reports={formattedReports}
          onApprove={async (reportId, message) => {
            const result = await approveContent(reportId);
            if (!result.success) {
              throw new Error("Approval failed");
            }
          }}
          onRemove={removeContent}
          onWarnUser={warnUser}
        /> */}
      </div>
    </div>
  )
}

