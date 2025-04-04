import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserProfile } from "@/app/actions/user"
import { UpcomingBookings } from "@/components/booking/upcoming-bookings"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const userProfile = await getUserProfile(user.id)

  if (!userProfile) {
    redirect("/onboarding")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingBookings />

        {/* Add more dashboard components here */}
      </div>
    </div>
  )
}

