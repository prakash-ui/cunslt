import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import {
  getAdminDashboardStats,
  getRevenueChartData,
  getUserGrowthChartData,
  getBookingStatsChartData,
  getRecentActivities,
} from "@/app/actions/admin"
import { AnalyticsCards } from "@/components/admin/dashboard/analytics-cards"
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart"
import { UserGrowthChart } from "@/components/admin/dashboard/user-growth-chart"
import { BookingStatsChart } from "@/components/admin/dashboard/booking-stats-chart"
import { RecentActivities } from "@/components/admin/dashboard/recent-activities"

export const metadata: Metadata = {
  title: "Admin Dashboard | Cunslt",
  description: "Admin dashboard for Cunslt platform",
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/dashboard")
  }

  const supabase = createClient()

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/")
  }

  // Get dashboard data
  const stats = await getAdminDashboardStats()
  const revenueData = await getRevenueChartData()
  const userGrowthData = await getUserGrowthChartData()
  const bookingStatsData = await getBookingStatsChartData()
  const activities = await getRecentActivities()

  return (
    <div className="container py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform performance and key metrics</p>
        </div>

        <AnalyticsCards data={stats} />

        <div className="grid grid-cols-1 gap-6">
          <RevenueChart data={revenueData} />
          <UserGrowthChart data={userGrowthData} />
          <BookingStatsChart data={bookingStatsData} />
          <RecentActivities activities={activities} />
        </div>
      </div>
    </div>
  )
}

