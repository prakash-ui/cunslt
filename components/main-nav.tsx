"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { getUnreadMessageCount } from "@/app/actions/messages"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  const { user, userProfile } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  const isAdmin = userProfile?.role === "admin"
  const isExpert = userProfile?.role === "expert"
  const isClient = userProfile?.role === "client"

  // Fetch unread message count
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      const { count } = await getUnreadMessageCount()
      setUnreadCount(count)
    }

    fetchUnreadCount()

    // Subscribe to new messages
    const channel = supabase
      .channel("new_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          if (payload.new.sender_id !== user.id) {
            // Increment unread count
            setUnreadCount((prev) => prev + 1)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
      show: true,
    },
    {
      href: "/experts",
      label: "Find Experts",
      active: pathname === "/experts",
      show: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
      show: !!user,
    },
    {
      href: "/bookings",
      label: "My Bookings",
      active: pathname === "/bookings",
      show: !!user,
    },
    {
      href: "/messages",
      label: "Messages",
      active: pathname.startsWith("/messages"),
      show: !!user,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    // Admin routes
    {
      href: "/admin",
      label: "Admin Dashboard",
      active: pathname === "/admin",
      show: isAdmin,
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      active: pathname === "/admin/users",
      show: isAdmin,
    },
    {
      href: "/admin/verifications",
      label: "Verifications",
      active: pathname === "/admin/verifications",
      show: isAdmin,
    },
    {
      href: "/admin/withdrawals",
      label: "Withdrawals",
      active: pathname === "/admin/withdrawals",
      show: isAdmin,
    },
    // Expert routes
    {
      href: "/expert/profile",
      label: "My Profile",
      active: pathname === "/expert/profile",
      show: isExpert,
    },
    {
      href: "/expert/availability",
      label: "Availability",
      active: pathname === "/expert/availability",
      show: isExpert,
    },
    {
      href: "/expert/verification",
      label: "Verification",
      active: pathname === "/expert/verification",
      show: isExpert,
    },
    {
      href: "/expert/reviews",
      label: "Reviews",
      active: pathname === "/expert/reviews",
      show: isExpert,
    },
    {
      href: "/expert/wallet",
      label: "Wallet",
      active: pathname === "/expert/wallet",
      show: isExpert,
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes
        .filter((route) => route.show)
        .map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative",
              route.active ? "text-black dark:text-white" : "text-muted-foreground",
            )}
          >
            {route.label}
            {route.badge && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {route.badge > 99 ? "99+" : route.badge}
              </Badge>
            )}
          </Link>
        ))}
    </nav>
  )
}

