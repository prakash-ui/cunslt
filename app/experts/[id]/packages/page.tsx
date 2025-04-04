import type { Metadata } from "next"
import { getExpertPackages } from "@/app/actions/packages"
import { ExpertPackages } from "@/components/packages/expert-packages"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ExpertPackagesPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ExpertPackagesPageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: expert } = await supabase
    .from("experts")
    .select(`
      id,
      title,
      user_profiles (
        full_name
      )
    `)
    .eq("id", params.id)
    .single()

  if (!expert) {
    return {
      title: "Expert Packages | Cunslt",
      description: "Consultation packages offered by our experts",
    }
  }

  return {
    title: `${expert.user_profiles.full_name}'s Packages | Cunslt`,
    description: `Consultation packages offered by ${expert.user_profiles.full_name}`,
  }
}

export default async function ExpertPackagesPage({ params }: ExpertPackagesPageProps) {
  const user = await getCurrentUser()
  const supabase = createClient()

  const { data: expert } = await supabase
    .from("experts")
    .select(`
      id,
      title,
      user_profiles (
        full_name
      )
    `)
    .eq("id", params.id)
    .single()

  if (!expert) {
    redirect("/experts")
  }

  const packages = await getExpertPackages(params.id)

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href={`/experts/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Expert Profile
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{expert.user_profiles.full_name}'s Packages</h1>
            <p className="text-muted-foreground">Choose a consultation package to save on multiple sessions</p>
          </div>
        </div>

        <ExpertPackages packages={packages} expertName={expert.user_profiles.full_name} />
      </div>
    </div>
  )
}

