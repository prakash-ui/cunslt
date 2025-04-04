import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserProfile } from "@/app/actions/user"
import { getExpertProfile } from "@/app/actions/expert"
import { getExpertVerificationStatus } from "@/app/actions/verification"
import { VerificationRequest } from "@/components/expert/verification-request"

export default async function ExpertVerificationPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/expert/verification")
  }

  const userProfile = await getUserProfile(user.id)

  if (!userProfile) {
    redirect("/onboarding")
  }

  if (userProfile.role !== "expert") {
    redirect("/dashboard")
  }

  const expertProfile = await getExpertProfile(userProfile.id)

  if (!expertProfile) {
    redirect("/expert/onboarding")
  }

  const verificationStatus = await getExpertVerificationStatus(expertProfile.id)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Expert Verification</h1>

      <div className="max-w-3xl mx-auto">
        <VerificationRequest expertId={expertProfile.id} verificationStatus={verificationStatus} />
      </div>
    </div>
  )
}

