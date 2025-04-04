"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

interface MobileSidebarProps {
  isExpert?: boolean
  role?: string
}

export function MobileSidebar({ isExpert, role }: MobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2 md:hidden">
          <Menu className="h-4 w-4" />
          <span className="ml-2">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <SidebarNav isExpert={isExpert} role={role} className="flex-col" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

