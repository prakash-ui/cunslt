import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserProfile } from "@/app/actions/user"
import { getVerificationRequest, getVerificationDocuments } from "@/app/actions/verification"
import { VerificationReview } from "@/components/admin/verification-review"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface VerificationDetailPageProps {
  params: {
    id: string
  }
}

export default async function VerificationDetailPage({ params }: VerificationDetailPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/verifications")
  }

  const userProfile = await getUserProfile(user.id)

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  const verificationRequest = await getVerificationRequest(params.id)
  const documents = await getVerificationDocuments(params.id)

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/admin/verifications">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Verification Requests
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Review Verification Request</h1>

      <VerificationReview verificationRequest={verificationRequest} documents={documents} />
    </div>
  )
}

