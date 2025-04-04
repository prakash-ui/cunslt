import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { InstallmentPlan } from "@/components/payment/installment-plan"
import { getPaymentPlan } from "@/app/actions/installments"

interface BookingPaymentPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Payment Options | Cunslt",
  description: "Choose your preferred payment option for your consultation",
}

export default async function BookingPaymentPage({ params }: BookingPaymentPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?callbackUrl=/bookings/${params.id}/payment`)
  }

  const supabase = createClient()

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        title,
        hourly_rate,
        user_profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", params.id)
    .eq("client_id", user.id)
    .single()

  if (!booking) {
    redirect("/bookings")
  }

  // If booking is already paid, redirect to booking details
  if (booking.payment_status === "paid") {
    redirect(`/bookings/${params.id}`)
  }

  // Get payment plan if exists
  const paymentPlan = await getPaymentPlan(params.id)

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/bookings/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Payment Options</h1>
          <p className="text-muted-foreground">
            Choose how you want to pay for your consultation with {booking.experts.user_profiles.full_name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>
              {new Date(booking.date).toLocaleDateString()} at {booking.start_time} ({booking.duration} minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{booking.experts.user_profiles.full_name}</div>
                  <div className="text-sm text-muted-foreground">{booking.experts.title}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${booking.experts.hourly_rate}/hr</div>
                  <div className="text-sm text-muted-foreground">{booking.duration} min session</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${booking.subtotal}</span>
                </div>
                {booking.tax_amount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {booking.tax_name} ({booking.tax_rate}%)
                    </span>
                    <span>${booking.tax_amount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${booking.amount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <InstallmentPlan bookingId={params.id} totalAmount={booking.amount} paymentPlan={paymentPlan} />
      </div>
    </div>
  )
}

