import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KBArticle } from "@/app/actions/knowledge-base"
import { formatDistanceToNow } from "date-fns"

interface ArticleCardProps {
  article: KBArticle
  showCategory?: boolean
}

export function ArticleCard({ article, showCategory = true }: ArticleCardProps) {
  return (
    <Link href={`/knowledge-base/article/${article.slug}`}>
      <Card className="h-full transition-all hover:border-primary hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{article.title}</CardTitle>
            {article.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>
          <CardDescription className="line-clamp-2">
            {article.excerpt || article.content.substring(0, 120) + "..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {showCategory && article.category_name && (
            <Badge variant="outline" className="mr-2">
              {article.category_name}
            </Badge>
          )}
          {article.tags &&
            article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="mr-2">
                {tag}
              </Badge>
            ))}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          By {article.author_name} • {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
        </CardFooter>
      </Card>
    </Link>
  )
}

