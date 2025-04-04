import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { WalletDashboard } from "@/components/expert/wallet-dashboard"
import { getExpertWallet, getWalletTransactions, getWithdrawalRequests } from "@/app/actions/wallet"

export default async function WalletPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const supabase = createClient()

  // Check if user is an expert
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    redirect("/")
  }

  try {
    const wallet = await getExpertWallet()
    const transactions = await getWalletTransactions(20)
    const withdrawalRequests = await getWithdrawalRequests()

    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Expert Wallet</h1>
        <WalletDashboard wallet={wallet} transactions={transactions} withdrawalRequests={withdrawalRequests} />
      </div>
    )
  } catch (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Expert Wallet</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error instanceof Error ? error.message : "Failed to load wallet data"}
        </div>
      </div>
    )
  }
}

