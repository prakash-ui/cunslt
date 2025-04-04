import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getClientMetrics } from "@/app/actions/analytics"
import { ClientOverviewCard } from "@/components/analytics/client/overview-card"
import { ClientSpendingChart } from "@/components/analytics/client/spending-chart"
import { BookingHistoryList } from "@/components/analytics/booking-history"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ClientAnalytics() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const metrics = await getClientMetrics("month")

  if ("error" in metrics) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Analytics</h1>
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
    clientName: booking.expertName,
    clientImage: booking.expertImage,
  }))

  // Generate spending chart data
  const today = new Date()
  const last30Days = eachDayOfInterval({
    start: subDays(today, 30),
    end: today,
  })

  const spendingData = last30Days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const dayBookings = metrics.bookingHistory.filter((b) => b.completedAt && b.completedAt.startsWith(dayStr))
    const dailySpending = dayBookings.reduce((sum, b) => sum + (b.price || 0), 0)

    return {
      date: format(day, "MMM dd"),
      amount: dailySpending,
    }
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Analytics</h1>

      <div className="space-y-6">
        <ClientOverviewCard
          totalBookings={metrics.calculatedMetrics.totalBookings}
          completedBookings={metrics.calculatedMetrics.completedBookings}
          canceledBookings={metrics.calculatedMetrics.canceledBookings}
          totalSpent={metrics.calculatedMetrics.totalSpent}
          uniqueExperts={metrics.calculatedMetrics.uniqueExperts}
          activeSubscriptions={metrics.calculatedMetrics.activeSubscriptions}
          activePackages={metrics.calculatedMetrics.activePackages}
          onTimeframeChange={async () => {}} // This would be implemented with client-side state
          timeframe="month"
        />

        <div className="grid gap-6 md:grid-cols-8">
          <ClientSpendingChart data={spendingData} />

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Active Plans</CardTitle>
              <CardDescription>Your current subscriptions and packages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Subscriptions</h3>
                  {metrics.subscriptions.length === 0 ? (
                    <p className="text-sm text-gray-500">No active subscriptions</p>
                  ) : (
                    <div className="space-y-2">
                      {metrics.subscriptions.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="font-medium">Subscription Plan</div>
                            <div className="text-sm text-gray-500">
                              Renews: {format(new Date(sub.currentPeriodEnd), "MMM dd, yyyy")}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sub.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Consultation Packages</h3>
                  {metrics.packages.length === 0 ? (
                    <p className="text-sm text-gray-500">No active packages</p>
                  ) : (
                    <div className="space-y-2">
                      {metrics.packages.map((pkg) => (
                        <div key={pkg.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="font-medium">Consultation Package</div>
                            <div className="text-sm text-gray-500">{pkg.hoursRemaining} hours remaining</div>
                            <div className="text-sm text-gray-500">
                              Expires: {format(new Date(pkg.expiresAt), "MMM dd, yyyy")}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                pkg.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {pkg.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <BookingHistoryList bookings={bookingHistory} />
      </div>
    </div>
  )
}

