import type { Metadata } from "next"
import { getCurrentSubscription, getSubscriptionPlans } from "../actions/subscription"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../actions/auth"

export const metadata: Metadata = {
  title: "Subscription Plans | Cunslt",
  description: "Choose a subscription plan that fits your consultation needs",
}

export default async function SubscriptionPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/subscription")
  }

  const plans = await getSubscriptionPlans()
  const currentSubscription = await getCurrentSubscription()

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose a subscription plan to get discounts on consultations and access to premium features
          </p>
        </div>

        <SubscriptionPlans plans={plans} currentSubscription={currentSubscription} />
      </div>
    </div>
  )
}

