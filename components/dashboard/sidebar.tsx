"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, MessageSquare, User, Settings, CreditCard, FileText, Star, Users, Gift, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userType: "client" | "expert" | "admin"
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
      userTypes: ["client", "expert", "admin"],
    },
    {
      label: "Consultations",
      icon: Calendar,
      href: "/dashboard/consultations",
      userTypes: ["client", "expert", "admin"],
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/dashboard/messages",
      userTypes: ["client", "expert", "admin"],
    },
    {
      label: "Reviews",
      icon: Star,
      href: "/dashboard/reviews",
      userTypes: ["client", "expert", "admin"],
    },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/dashboard/payments",
      userTypes: ["client", "expert", "admin"],
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
      userTypes: ["client", "expert", "admin"],
    },
    {
      label: "Referrals",
      icon: Gift,
      href: "/dashboard/referrals",
      userTypes: ["client", "expert"],
    },
    {
      label: "Affiliate",
      icon: Award,
      href: "/dashboard/affiliate",
      userTypes: ["client", "expert"],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      userTypes: ["client", "expert", "admin"],
    },
    // Admin-only routes
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      userTypes: ["admin"],
    },
    {
      label: "Review Reports",
      icon: Star,
      href: "/admin/reviews/reports",
      userTypes: ["admin"],
    },
  ]

  const filteredRoutes = routes.filter((route) => route.userTypes.includes(userType))

  return (
    <div className="h-full flex flex-col border-r bg-white">
      <div className="p-6">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === route.href ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-100",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

