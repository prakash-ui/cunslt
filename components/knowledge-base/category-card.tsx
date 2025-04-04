import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Briefcase, CreditCard, Users, Wrench } from "lucide-react"
import type { KBCategory } from "@/app/actions/knowledge-base"

interface CategoryCardProps {
  category: KBCategory
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Briefcase,
  Users,
  CreditCard,
  Wrench,
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon ? iconMap[category.icon] : BookOpen

  return (
    <Link href={`/knowledge-base/category/${category.slug}`}>
      <Card className="h-full transition-all hover:border-primary hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription className="line-clamp-2">{category.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">
            {category.article_count} {category.article_count === 1 ? "article" : "articles"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

