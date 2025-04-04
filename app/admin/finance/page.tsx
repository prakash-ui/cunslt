import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { getRevenueChartData, exportFinancialReport } from "@/app/actions/admin"
import { FinancialReports } from "@/components/admin/finance/financial-reports"

export const metadata: Metadata = {
  title: "Financial Reports | Cunslt Admin",
  description: "View and export financial reports",
}

export default async function AdminFinancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/finance")
  }

  const supabase = createClient()

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/")
  }

  // Get revenue data
  const revenueData = await getRevenueChartData()

  // Get category distribution data
  const { data: categories } = await supabase.from("expertise_categories").select("name")

  // Generate sample category data (in a real app, this would come from the database)
  const categoryData =
    categories?.map((category, index) => ({
      name: category.name,
      value: Math.floor(Math.random() * 10000) + 1000, // Random value between 1000 and 11000
    })) || []

  return (
    <div className="container py-10">
      <FinancialReports revenueData={revenueData} categoryData={categoryData} onExport={exportFinancialReport} />
    </div>
  )
}

