import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">Sorry, we couldn't find the page you're looking for.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go to homepage
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find an expert
          </Link>
        </Button>
      </div>
    </div>
  )
}

