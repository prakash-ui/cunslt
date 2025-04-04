import type { Metadata } from "next"
import Link from "next/link"
import { getExpertResources } from "@/app/actions/knowledge-base"
import { ResourceCard } from "@/components/knowledge-base/resource-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Manage Resources | Expert Dashboard",
  description: "Manage your shared resources and materials",
}

export default async function ExpertResourcesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const resources = await getExpertResources({ expertId: user.id })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Resources</h1>
        <Link href="/dashboard/expert/resources/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-medium">Your Resources</h2>

        {resources.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} showExpert={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No resources yet</h3>
            <p className="mb-4 text-muted-foreground">
              Share your expertise by adding resources for clients and other experts.
            </p>
            <Link href="/dashboard/expert/resources/new">
              <Button>Add Your First Resource</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-medium">Resource Guidelines</h2>
        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
          <li>Resources can be PDFs, documents, images, or other files that help clients</li>
          <li>Make your resources public to share them with all platform users</li>
          <li>Private resources are only visible to you and can be shared directly with clients</li>
          <li>Ensure you have the rights to share all uploaded content</li>
          <li>Resources should be professional and relevant to your expertise</li>
        </ul>
      </div>
    </div>
  )
}

