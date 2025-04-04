import Link from "next/link"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Fallback component for missing icons
const IconFallback = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted rounded-full", className)} />
);

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-8 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              {Icons.logo ? <Icons.logo className="h-6 w-6" /> : <IconFallback className="h-6 w-6" />}
              <span className="font-bold">Cunslt</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Connect with experts for professional consultations. Get the advice you need, when you need it.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="#" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                {Icons.twitter ? <Icons.twitter className="h-4 w-4" /> : <IconFallback className="h-4 w-4" />}
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                {Icons.facebook ? <Icons.facebook className="h-4 w-4" /> : <IconFallback className="h-4 w-4" />}
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                {Icons.instagram ? <Icons.instagram className="h-4 w-4" /> : <IconFallback className="h-4 w-4" />}
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                {Icons.linkedin ? <Icons.linkedin className="h-4 w-4" /> : <IconFallback className="h-4 w-4" />}
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          {/* ... rest of your footer content remains the same ... */}
        </div>
      </div>
    </footer>
  )
}