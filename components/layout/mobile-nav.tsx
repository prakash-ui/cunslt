"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Icons } from "@/components/icons"
import { Menu } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { UnreadBadge } from "@/components/messaging/unread-badge"

interface MobileNavProps {
  user: User | null
  userProfile?: any
}

export function MobileNav({ user, userProfile }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink href="/" className="flex items-center" onOpenChange={setOpen}>
          <Icons.logo className="mr-2 h-4 w-4" />
          <span className="font-bold">Cunslt</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <MobileLink href="/" onOpenChange={setOpen} className={cn(isActive("/") && "text-primary font-medium")}>
              Home
            </MobileLink>
            <MobileLink
              href="/experts"
              onOpenChange={setOpen}
              className={cn(isActive("/experts") && "text-primary font-medium")}
            >
              Find Experts
            </MobileLink>
            <MobileLink
              href="/knowledge-base"
              onOpenChange={setOpen}
              className={cn(isActive("/knowledge-base") && "text-primary font-medium")}
            >
              Knowledge Base
            </MobileLink>
            <MobileLink
              href="/pricing"
              onOpenChange={setOpen}
              className={cn(isActive("/pricing") && "text-primary font-medium")}
            >
              Pricing
            </MobileLink>
            <MobileLink
              href="/contact"
              onOpenChange={setOpen}
              className={cn(isActive("/contact") && "text-primary font-small")}
            >
              Contact
            </MobileLink>

            {user && (
              <>
                <MobileLink
                  href="/messages"
                  onOpenChange={setOpen}
                  className={cn(isActive("/messages") && "text-primary font-medium", "flex items-center")}
                >
                  Messages
                  {user && <UnreadBadge userId={user.id} className="ml-2" />}
                </MobileLink>

                <MobileLink
                  href={userProfile?.role === "expert" ? "/dashboard/expert" : "/dashboard/client"}
                  onOpenChange={setOpen}
                  className={cn(
                    (isActive("/dashboard/expert") || isActive("/dashboard/client")) && "text-primary font-medium",
                  )}
                >
                  Dashboard
                </MobileLink>

                {userProfile?.role === "admin" && (
                  <MobileLink
                    href="/admin/dashboard"
                    onOpenChange={setOpen}
                    className={cn(isActive("/admin/dashboard") && "text-primary font-medium")}
                  >
                    Admin
                  </MobileLink>
                )}

                <MobileLink
                  href="/profile"
                  onOpenChange={setOpen}
                  className={cn(isActive("/profile") && "text-primary font-medium")}
                >
                  Profile
                </MobileLink>
              </>
            )}

            {!user && (
              <>
                <MobileLink
                  href="/login"
                  onOpenChange={setOpen}
                  className={cn(isActive("/login") && "text-primary font-medium")}
                >
                  Login
                </MobileLink>
                <MobileLink
                  href="/register"
                  onOpenChange={setOpen}
                  className={cn(isActive("/register") && "text-primary font-medium", "font-medium")}
                >
                  Sign Up

                </MobileLink>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps {
  href: string
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={() => {
        onOpenChange?.(false)
      }}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground",
        isActive && "text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

