import type { Metadata } from "next"
import { getClientPackages } from "../actions/packages"
import { ClientPackages } from "@/components/packages/client-packages"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../actions/auth"

export const metadata: Metadata = {
  title: "My Packages | Cunslt",
  description: "Manage your consultation packages",
}

export default async function PackagesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/packages")
  }

  const packages = await getClientPackages()

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Packages</h1>
          <p className="text-muted-foreground">
            Manage your consultation packages and book sessions with your preferred experts
          </p>
        </div>

        <ClientPackages packages={packages} />
      </div>
    </div>
  )
}

