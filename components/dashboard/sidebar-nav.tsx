"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  BarChart,
  Briefcase,
  Settings,
  BookOpen,
  MessageCircle,
  FileText,
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  isExpert?: boolean
  role?: string
}

export function SidebarNav({ className, isExpert, role, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const clientItems = [
    {
      title: "Overview",
      href: "/dashboard/client",
      icon: LayoutDashboard,
    },
    {
      title: "My Bookings",
      href: "/dashboard/client/bookings",
      icon: Calendar,
    },
    {
      title: "Analytics",
      href: "/dashboard/client/analytics",
      icon: BarChart,
    },
    {
      title: "Experts",
      href: "/dashboard/client/experts",
      icon: Users,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageCircle,
    },
    {
      title: "Payments",
      href: "/dashboard/client/payments",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/client/settings",
      icon: Settings,
    },
  ]

  const expertItems = [
    {
      title: "Overview",
      href: "/dashboard/expert",
      icon: LayoutDashboard,
    },
    {
      title: "Appointments",
      href: "/dashboard/expert/appointments",
      icon: Calendar,
    },
    {
      title: "Analytics",
      href: "/dashboard/expert/analytics",
      icon: BarChart,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageCircle,
    },
    ...(role === "expert"
      ? [
          {
            title: "Message Templates",
            href: "/messages/templates",
            icon: FileText,
          },
        ]
      : []),
    {
      title: "Earnings",
      href: "/dashboard/expert/earnings",
      icon: CreditCard,
    },
    {
      title: "Services",
      href: "/dashboard/expert/services",
      icon: Briefcase,
    },
    {
      title: "Expert Profile",
      href: "/dashboard/expert/profile",
      icon: Users,
    },
    {
      title: "Knowledge Base",
      href: "/dashboard/expert/knowledge",
      icon: BookOpen,
    },
    {
      title: "Settings",
      href: "/dashboard/expert/settings",
      icon: Settings,
    },
  ]

  const items = isExpert ? expertItems : clientItems

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

