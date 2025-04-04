import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMessageTemplates } from "@/app/actions/messaging"
import { TemplateManager } from "@/components/messaging/template-manager"

export default async function TemplatesPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/messages/templates")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", session.user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  // Only experts can access templates
  if (profile.role !== "expert") {
    redirect("/dashboard")
  }

  // Get templates
  const { templates, error } = await getMessageTemplates(session.user.id)

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-destructive">Error loading templates: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <TemplateManager userId={session.user.id} templates={templates || []} />
    </div>
  )
}

