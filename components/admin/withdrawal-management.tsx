"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { processWithdrawal } from "@/app/actions/wallet"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface WithdrawalRequest {
  id: string
  expert_id: string
  amount: number
  status: string
  created_at: string
  processed_at: string | null
  payment_method: string
  payment_reference: string | null
  notes: string | null
  experts: {
    id: string
    user_id: string
    user_profiles: {
      first_name: string
      last_name: string
      email: string
    }
  }
}

interface WithdrawalManagementProps {
  withdrawalRequests: WithdrawalRequest[]
}

export function WithdrawalManagement({ withdrawalRequests }: WithdrawalManagementProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [action, setAction] = useState<"approve" | "reject">("approve")
  const [paymentReference, setPaymentReference] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams?.get("success") === "withdrawal-processed") {
      toast({
        title: "Success",
        description: "Withdrawal request has been processed successfully.",
        variant: "default",
      })
    }
  }, [searchParams, toast])

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedWithdrawal) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("withdrawalId", selectedWithdrawal.id)
      formData.append("action", action)
      formData.append("paymentReference", paymentReference)
      formData.append("notes", notes)

      await processWithdrawal(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      })
      setIsSubmitting(false)
      setIsDialogOpen(false)
    }
  }

  const openProcessDialog = (withdrawal: WithdrawalRequest, initialAction: "approve" | "reject") => {
    setSelectedWithdrawal(withdrawal)
    setAction(initialAction)
    setPaymentReference("")
    setNotes("")
    setIsDialogOpen(true)
  }

  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === "pending")
  const processedWithdrawals = withdrawalRequests.filter((w) => w.status !== "pending")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending ({pendingWithdrawals.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedWithdrawals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawal Requests</CardTitle>
              <CardDescription>Review and process expert withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingWithdrawals.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No pending withdrawal requests</div>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {withdrawal.experts.user_profiles.first_name} {withdrawal.experts.user_profiles.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{withdrawal.experts.user_profiles.email}</div>
                          <div className="text-sm mt-1">
                            Requested on {new Date(withdrawal.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm">Method: {withdrawal.payment_method.replace("_", " ")}</div>
                        </div>
                        <div className="text-lg font-bold">{formatCurrency(withdrawal.amount)}</div>
                      </div>

                      {withdrawal.notes && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <span className="font-medium">Notes:</span> {withdrawal.notes}
                        </div>
                      )}

                      <div className="mt-4 flex space-x-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => openProcessDialog(withdrawal, "reject")}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => openProcessDialog(withdrawal, "approve")}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Processed Withdrawal Requests</CardTitle>
              <CardDescription>View history of processed withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {processedWithdrawals.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No processed withdrawal requests</div>
              ) : (
                <div className="space-y-4">
                  {processedWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {withdrawal.experts.user_profiles.first_name} {withdrawal.experts.user_profiles.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{withdrawal.experts.user_profiles.email}</div>
                          <div className="text-sm mt-1">
                            Requested on {new Date(withdrawal.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            Status:{" "}
                            <span
                              className={`font-medium ${withdrawal.status === "approved" ? "text-green-600" : "text-red-600"}`}
                            >
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-lg font-bold">{formatCurrency(withdrawal.amount)}</div>
                      </div>

                      <div className="mt-2 text-sm">
                        <div>Method: {withdrawal.payment_method.replace("_", " ")}</div>
                        {withdrawal.payment_reference && <div>Reference: {withdrawal.payment_reference}</div>}
                        {withdrawal.processed_at && (
                          <div>Processed on: {new Date(withdrawal.processed_at).toLocaleDateString()}</div>
                        )}
                      </div>

                      {withdrawal.notes && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <span className="font-medium">Notes:</span> {withdrawal.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve" : "Reject"} Withdrawal Request</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Approve this withdrawal request and provide payment details."
                : "Reject this withdrawal request and provide a reason."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProcess}>
            {action === "approve" && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-reference">Payment Reference</Label>
                  <Input
                    id="payment-reference"
                    placeholder="Transaction ID or reference number"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about the payment"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            {action === "reject" && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Reason for Rejection</Label>
                  <Textarea
                    id="notes"
                    placeholder="Provide a reason for rejecting this withdrawal request"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || (action === "approve" && !paymentReference) || (action === "reject" && !notes)
                }
              >
                {isSubmitting ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

