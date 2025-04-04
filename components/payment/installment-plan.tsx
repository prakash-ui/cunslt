"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Check, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { createPaymentPlan, payInstallment } from "@/app/actions/installments"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Installment {
  id: string
  payment_plan_id: string
  amount: number
  due_date: string
  status: "pending" | "paid" | "overdue"
  payment_id: string | null
  created_at: string
  updated_at: string
}

interface PaymentPlan {
  id: string
  booking_id: string
  client_id: string
  expert_id: string
  total_amount: number
  number_of_installments: number
  installment_amount: number
  status: "active" | "completed" | "defaulted"
  created_at: string
  updated_at: string
  installments: Installment[]
}

interface InstallmentPlanProps {
  bookingId: string
  totalAmount: number
  paymentPlan: PaymentPlan | null
}

export function InstallmentPlan({ bookingId, totalAmount, paymentPlan }: InstallmentPlanProps) {
  const [installments, setInstallments] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(null)
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const handleCreatePlan = async () => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("bookingId", bookingId)
      formData.append("numberOfInstallments", installments.toString())

      await createPaymentPlan(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment plan",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handlePayInstallment = async (installmentId: string) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("installmentId", installmentId)
      formData.append("paymentPlanId", paymentPlan?.id || "")

      await payInstallment(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pay installment",
        variant: "destructive",
      })
      setIsSubmitting(false)
      setPayDialogOpen(false)
      setPayingInstallmentId(null)
    }
  }

  const getInstallmentStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "pending"

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Overdue
        </span>
      )
    }

    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  if (paymentPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Plan</CardTitle>
          <CardDescription>
            Your consultation fee of {formatCurrency(paymentPlan.total_amount)} is split into{" "}
            {paymentPlan.number_of_installments} installments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-xl font-bold">{formatCurrency(paymentPlan.total_amount)}</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-xl font-bold capitalize">{paymentPlan.status}</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Installments</h4>
            {paymentPlan.installments.map((installment, index) => {
              const isOverdue = new Date(installment.due_date) < new Date() && installment.status === "pending"

              return (
                <div
                  key={installment.id}
                  className={`p-3 border rounded-md ${
                    isOverdue
                      ? "border-red-200 bg-red-50"
                      : installment.status === "paid"
                        ? "border-green-200 bg-green-50"
                        : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Installment {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(installment.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(installment.amount)}</div>
                      <div>{getInstallmentStatusBadge(installment.status, installment.due_date)}</div>
                    </div>
                  </div>

                  {installment.status === "pending" && (
                    <div className="mt-3 pt-3 border-t">
                      <Dialog
                        open={payDialogOpen && payingInstallmentId === installment.id}
                        onOpenChange={(open) => {
                          setPayDialogOpen(open)
                          if (!open) setPayingInstallmentId(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant={isOverdue ? "destructive" : "default"}
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setPayingInstallmentId(installment.id)
                              setPayDialogOpen(true)
                            }}
                          >
                            {isOverdue ? "Pay Overdue Installment" : "Pay Now"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Pay Installment</DialogTitle>
                            <DialogDescription>
                              You will be charged {formatCurrency(installment.amount)} for installment {index + 1}.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="py-4">
                            <div className="space-y-4">
                              <RadioGroup defaultValue="card">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="card" id="card" />
                                  <Label htmlFor="card" className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Credit/Debit Card
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                if (payingInstallmentId) {
                                  handlePayInstallment(payingInstallmentId)
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Processing..." : "Pay Now"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {paymentPlan.status === "active" && paymentPlan.installments.some((i) => i.status === "pending") && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Plan Active</AlertTitle>
              <AlertDescription>
                Your consultation is confirmed. Please make sure to pay all installments on time to avoid cancellation.
              </AlertDescription>
            </Alert>
          )}

          {paymentPlan.status === "completed" && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4" />
              <AlertTitle>Payment Completed</AlertTitle>
              <AlertDescription>You have successfully paid all installments for this consultation.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
        <CardDescription>Choose how you want to pay for your consultation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Pay in full</h3>
              <p className="text-sm text-muted-foreground">Pay the entire amount now</p>
            </div>
            <div className="font-bold">{formatCurrency(totalAmount)}</div>
          </div>
          <Button className="mt-4 w-full">Pay Now</Button>
        </div>

        <div className="p-4 border rounded-md border-primary bg-primary/5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Pay in installments</h3>
              <p className="text-sm text-muted-foreground">Split your payment into multiple installments</p>
            </div>
            <div className="font-bold">{formatCurrency(totalAmount)}</div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 w-full">Set Up Installment Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Installment Plan</DialogTitle>
                <DialogDescription>
                  Split your payment of {formatCurrency(totalAmount)} into multiple installments.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <Label>Number of Installments</Label>
                    <RadioGroup
                      defaultValue="3"
                      value={installments.toString()}
                      onValueChange={(value) => setInstallments(Number.parseInt(value))}
                      className="grid grid-cols-3 gap-4 mt-2"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-3">
                        <RadioGroupItem value="2" id="installments-2" className="sr-only" />
                        <Label
                          htmlFor="installments-2"
                          className={`text-center cursor-pointer w-full h-full ${installments === 2 ? "font-bold" : ""}`}
                        >
                          <div className="text-xl">2</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(totalAmount / 2)}/installment
                          </div>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-3 border-primary bg-primary/5">
                        <RadioGroupItem value="3" id="installments-3" className="sr-only" />
                        <Label
                          htmlFor="installments-3"
                          className={`text-center cursor-pointer w-full h-full ${installments === 3 ? "font-bold" : ""}`}
                        >
                          <div className="text-xl">3</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(totalAmount / 3)}/installment
                          </div>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-3">
                        <RadioGroupItem value="4" id="installments-4" className="sr-only" />
                        <Label
                          htmlFor="installments-4"
                          className={`text-center cursor-pointer w-full h-full ${installments === 4 ? "font-bold" : ""}`}
                        >
                          <div className="text-xl">4</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(totalAmount / 4)}/installment
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Payment Schedule</h4>
                    <div className="space-y-2">
                      {Array.from({ length: installments }).map((_, index) => {
                        const date = new Date()
                        date.setMonth(date.getMonth() + index)

                        return (
                          <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{index === 0 ? "Today" : `${date.toLocaleDateString()}`}</span>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(
                                index === installments - 1
                                  ? totalAmount -
                                      (Math.floor((totalAmount / installments) * 100) / 100) * (installments - 1)
                                  : Math.floor((totalAmount / installments) * 100) / 100,
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>First Payment Today</AlertTitle>
                    <AlertDescription>
                      You'll be charged the first installment today, and the remaining installments will be
                      automatically charged monthly.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Confirm Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

