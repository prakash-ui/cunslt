import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { JsonLd, generateBreadcrumbSchema } from "@/components/seo/json-ld"

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  includeHome?: boolean
}

export function Breadcrumb({ items, includeHome = true }: BreadcrumbProps) {
  const breadcrumbItems = includeHome ? [{ name: "Home", url: "/" }, ...items] : items

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems)} />
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="inline-flex items-center">
              {index > 0 && <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />}
              {index === 0 && includeHome && <Home className="mr-1 h-4 w-4" />}
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-sm font-medium text-gray-500" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="text-sm font-medium text-primary hover:text-primary/80">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

