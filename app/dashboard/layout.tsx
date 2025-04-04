import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", session.user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  const isExpert = profile.role === "expert"
  const dashboardPath = isExpert ? "/dashboard/expert" : "/dashboard/client"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <SidebarNav isExpert={isExpert} role={profile.role} className="py-6" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex items-center py-4">
            <MobileSidebar isExpert={isExpert} role={profile.role} />
            <h1 className="text-xl font-semibold md:text-2xl">{isExpert ? "Expert Dashboard" : "Client Dashboard"}</h1>
          </div>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  )
}

