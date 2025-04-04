import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { updateUserStatus, updateUserRole, sendUserEmail } from "@/app/actions/admin"
import { UserTable } from "@/components/admin/users/user-table"

export const metadata: Metadata = {
  title: "User Management | Cunslt Admin",
  description: "Manage users on the Cunslt platform",
}

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/users")
  }

  const supabase = createClient()

  // Check if user is admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/")
  }

  // Get all users
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, role, status, created_at, avatar_url")
    .order("created_at", { ascending: false })

  // Format users for the table
  const formattedUsers =
    users?.map((user) => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role as "client" | "expert" | "admin",
      status: user.status as "active" | "inactive" | "suspended" | "pending",
      joinedAt: user.created_at,
      avatar: user.avatar_url,
    })) || []

  return (
    <div className="container py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, update roles, and moderate accounts</p>
        </div>

        <UserTable
          users={formattedUsers}
          onStatusChange={updateUserStatus}
          onRoleChange={updateUserRole}
          onSendEmail={sendUserEmail}
        />
      </div>
    </div>
  )
}

