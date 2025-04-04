import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserProfile } from "@/app/actions/user"
import { getExpertProfile, getExpertSkills } from "@/app/actions/expert"
import { getExpertReviews } from "@/app/actions/reviews"
import { getExpertAvailability } from "@/app/actions/availability"
import { getExpertVerificationStatus } from "@/app/actions/verification"
import { ExpertProfile } from "@/components/expert/expert-profile"

export default async function ExpertProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/expert/profile")
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

  const skills = await getExpertSkills(expertProfile.id)
  const reviews = await getExpertReviews(expertProfile.id)
  const availability = await getExpertAvailability(expertProfile.id)
  const verificationStatus = await getExpertVerificationStatus(expertProfile.id)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Expert Profile</h1>

      <ExpertProfile
        expert={expertProfile}
        skills={skills}
        reviews={reviews}
        availability={availability}
        isOwnProfile={true}
        isVerified={verificationStatus.isVerified}
      />
    </div>
  )
}

