"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Users, UserCheck, DollarSign, Shield, Settings, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/dashboard")}>
              <Link href="/admin/dashboard">
                <BarChart className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
              <Link href="/admin/users">
                <Users className="h-5 w-5 mr-3" />
                <span>User Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/experts")}>
              <Link href="/admin/experts">
                <UserCheck className="h-5 w-5 mr-3" />
                <span>Expert Approval</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/finance")}>
              <Link href="/admin/finance">
                <DollarSign className="h-5 w-5 mr-3" />
                <span>Financial Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/moderation")}>
              <Link href="/admin/moderation">
                <Shield className="h-5 w-5 mr-3" />
                <span>Content Moderation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
              <Link href="/admin/settings">
                <Settings className="h-5 w-5 mr-3" />
                <span>Admin Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-2">
          <Button variant="outline" asChild className="justify-start">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              <span>Back to Site</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start">
            <Link href="/logout">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Link>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

