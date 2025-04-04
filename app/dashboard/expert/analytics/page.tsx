import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getExpertMetrics } from "@/app/actions/analytics"
import { ExpertOverviewCard } from "@/components/analytics/expert/overview-card"
import { ExpertEarningsChart } from "@/components/analytics/expert/earnings-chart"
import { ExpertBookingsChart } from "@/components/analytics/expert/bookings-chart"
import { BookingHistoryList } from "@/components/analytics/booking-history"
import { format, subDays, eachDayOfInterval } from "date-fns"

export default async function ExpertAnalytics() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()

  // Check if user is an expert
  const { data: expert, error: expertError } = await supabase
    .from("experts")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (expertError || !expert) {
    redirect("/dashboard")
  }

  const metrics = await getExpertMetrics("month")

  if ("error" in metrics) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Expert Analytics</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{metrics.error}</div>
      </div>
    )
  }

  // Get booking history from the returned metrics
  const bookingHistory = metrics.bookingHistory.map((booking) => ({
    id: booking.id,
    status: booking.status as any,
    price: booking.price || 0,
    createdAt: booking.createdAt,
    scheduledAt: booking.scheduledAt || booking.createdAt,
    completedAt: booking.completedAt,
    canceledAt: booking.canceledAt,
  }))

  // Generate earnings chart data
  const today = new Date()
  const last30Days = eachDayOfInterval({
    start: subDays(today, 30),
    end: today,
  })

  const earningsData = last30Days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const dayBookings = metrics.bookingHistory.filter((b) => b.completedAt && b.completedAt.startsWith(dayStr))
    const dailyEarnings = dayBookings.reduce((sum, b) => sum + (b.price || 0), 0)

    return {
      date: format(day, "MMM dd"),
      earnings: dailyEarnings,
    }
  })

  // Generate bookings chart data
  const bookingsData = last30Days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const completedBookings = metrics.bookingHistory.filter(
      (b) => b.completedAt && b.completedAt.startsWith(dayStr),
    ).length

    const canceledBookings = metrics.bookingHistory.filter(
      (b) => b.canceledAt && b.canceledAt.startsWith(dayStr),
    ).length

    return {
      date: format(day, "MMM dd"),
      completed: completedBookings,
      canceled: canceledBookings,
    }
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Expert Analytics</h1>

      <div className="space-y-6">
        <ExpertOverviewCard
          totalBookings={metrics.calculatedMetrics.totalBookings}
          completedBookings={metrics.calculatedMetrics.completedBookings}
          canceledBookings={metrics.calculatedMetrics.canceledBookings}
          completionRate={metrics.calculatedMetrics.completionRate}
          cancellationRate={metrics.calculatedMetrics.cancellationRate}
          totalEarnings={metrics.calculatedMetrics.totalEarnings}
          averageRating={metrics.calculatedMetrics.averageRating}
          onTimeframeChange={async () => {}} // This would be implemented with client-side state
          timeframe="month"
        />

        <div className="grid gap-6 md:grid-cols-8">
          <ExpertEarningsChart data={earningsData} />
          <ExpertBookingsChart data={bookingsData} />
        </div>

        <BookingHistoryList bookings={bookingHistory} showClient={true} />
      </div>
    </div>
  )
}

