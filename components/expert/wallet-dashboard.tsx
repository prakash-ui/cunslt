"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { requestWithdrawal } from "@/app/actions/wallet"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { AlertCircle, CheckCircle, Clock, DollarSign, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Transaction {
  id: string
  amount: number
  type: string
  status: string
  description: string
  created_at: string
}

interface WithdrawalRequest {
  id: string
  amount: number
  status: string
  created_at: string
  processed_at: string | null
  payment_method: string
  payment_reference: string | null
  notes: string | null
}

interface WalletDashboardProps {
  wallet: {
    id: string
    expert_id: string
    available_balance: number
    pending_balance: number
    pending_withdrawal: number
    lifetime_earnings: number
    created_at: string
    updated_at: string
  }
  transactions: Transaction[]
  withdrawalRequests: WithdrawalRequest[]
}

export function WalletDashboard({ wallet, transactions, withdrawalRequests }: WalletDashboardProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams?.get("success") === "withdrawal-requested") {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully.",
        variant: "default",
      })
    }
  }, [searchParams, toast])

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("amount", amount)
      formData.append("paymentMethod", paymentMethod)
      formData.append("notes", notes)

      await requestWithdrawal(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request withdrawal",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{formatCurrency(wallet.available_balance)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-yellow-500" />
              <div className="text-2xl font-bold">{formatCurrency(wallet.pending_balance)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="w-4 h-4 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatCurrency(wallet.lifetime_earnings)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="request">Request Withdrawal</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No transactions found</div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                      </div>
                      <div
                        className={`text-lg font-bold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>View your withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No withdrawal requests found</div>
              ) : (
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Withdrawal via {request.payment_method.replace("_", " ")}</div>
                          <div className="text-sm text-muted-foreground">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-red-600">-{formatCurrency(request.amount)}</div>
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <div>{getStatusBadge(request.status)}</div>
                        {request.payment_reference && <div className="text-sm">Ref: {request.payment_reference}</div>}
                      </div>

                      {request.notes && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="request" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>Withdraw funds from your available balance</CardDescription>
            </CardHeader>
            <CardContent>
              {wallet.available_balance <= 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Insufficient funds</AlertTitle>
                  <AlertDescription>You don't have any available balance to withdraw.</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleWithdrawalSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          className="pl-8"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="1"
                          max={wallet.available_balance.toString()}
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Available: {formatCurrency(wallet.available_balance)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                        <SelectTrigger id="payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="venmo">Venmo</SelectItem>
                          <SelectItem value="zelle">Zelle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Information</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add payment details or notes for the admin"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <CardFooter className="flex justify-end pt-6 px-0">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !amount ||
                        Number.parseFloat(amount) <= 0 ||
                        Number.parseFloat(amount) > wallet.available_balance
                      }
                    >
                      {isSubmitting ? "Processing..." : "Request Withdrawal"}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

