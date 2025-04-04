"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { subscribeToplan } from "@/app/actions/subscription"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billing_interval: "monthly" | "quarterly" | "annual"
  features: {
    consultations_discount: number
    priority_booking: boolean
    expert_messaging: boolean
    file_sharing?: boolean
    team_access?: boolean
    dedicated_support?: boolean
  }
  is_active: boolean
}

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[]
  currentSubscription?: {
    id: string
    plan_id: string
    status: string
    current_period_end: string
    cancel_at_period_end: boolean
    subscription_plans: SubscriptionPlan
  } | null
}

export function SubscriptionPlans({ plans, currentSubscription }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("planId", plan.id)

      await subscribeToplan(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe to plan",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const formatInterval = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "month"
      case "quarterly":
        return "quarter"
      case "annual":
        return "year"
      default:
        return interval
    }
  }

  return (
    <div className="space-y-8">
      {currentSubscription && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Current Subscription</CardTitle>
            <CardDescription>
              You are currently subscribed to the {currentSubscription.subscription_plans.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  {formatCurrency(currentSubscription.subscription_plans.price)}/
                  {formatInterval(currentSubscription.subscription_plans.billing_interval)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{currentSubscription.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Current period ends:</span>
                <span className="font-medium">
                  {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
              {currentSubscription.cancel_at_period_end && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                  Your subscription will not renew after the current period ends.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              currentSubscription?.subscription_plans.id === plan.id ? "border-primary" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground">/{formatInterval(plan.billing_interval)}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>{plan.features.consultations_discount}% discount on all consultations</span>
                </li>
                {plan.features.priority_booking && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Priority booking with experts</span>
                  </li>
                )}
                {plan.features.expert_messaging && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Direct messaging with experts</span>
                  </li>
                )}
                {plan.features.file_sharing && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>File sharing during consultations</span>
                  </li>
                )}
                {plan.features.team_access && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Team access (up to 5 members)</span>
                  </li>
                )}
                {plan.features.dedicated_support && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Dedicated customer support</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription?.subscription_plans.id === plan.id ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Dialog
                  open={dialogOpen && selectedPlan?.id === plan.id}
                  onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setSelectedPlan(null)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedPlan(plan)
                        setDialogOpen(true)
                      }}
                    >
                      Subscribe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Subscribe to {plan.name} Plan</DialogTitle>
                      <DialogDescription>
                        You will be charged {formatCurrency(plan.price)} per {formatInterval(plan.billing_interval)}.
                        {currentSubscription && (
                          <div className="mt-2 text-yellow-600">
                            <Info className="h-4 w-4 inline mr-1" />
                            You already have an active subscription. Subscribing to a new plan will cancel your current
                            plan at the end of the billing period.
                          </div>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedPlan) {
                            handleSubscribe(selectedPlan)
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Confirm Subscription"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

