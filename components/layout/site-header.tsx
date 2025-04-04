import Link from "next/link"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { createClient } from "@/lib/supabase/server"
import { LanguageSwitcher } from "@/components/language-switcher"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types"

export async function SiteHeader() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile: Profile | null = null

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    userProfile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-4">
          <MainNav user={user} userProfile={userProfile} />
          <MobileNav user={user} userProfile={userProfile} />
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          
          {user ? (
            <>
              <NotificationBell />
              <UserNav user={user} userProfile={userProfile} />
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}