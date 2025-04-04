import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getKBArticleBySlug, incrementArticleViewCount } from "@/app/actions/knowledge-base"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ArticleFeedback } from "@/components/knowledge-base/article-feedback"
import { Mdx } from "@/components/mdx"

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getKBArticleBySlug(params.slug)

  if (!article) {
    return {
      title: "Article Not Found | Knowledge Base",
    }
  }

  return {
    title: `${article.title} | Knowledge Base`,
    description: article.excerpt || article.content.substring(0, 160),
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getKBArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  // Increment view count
  await incrementArticleViewCount(article.id)

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={
            article.category_id
              ? `/knowledge-base/category/${article.category_name?.toLowerCase().replace(/\s+/g, "-")}`
              : "/knowledge-base"
          }
        >
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {article.category_name ? `Back to ${article.category_name}` : "Back to Knowledge Base"}
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">{article.title}</h1>

          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>By {article.author_name}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
            {article.is_featured && (
              <>
                <span>•</span>
                <Badge variant="secondary">Featured</Badge>
              </>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="prose prose-gray max-w-none dark:prose-invert">
            <Mdx content={article.content} />
          </div>

          <ArticleFeedback articleId={article.id} />

          <div className="mt-12 border-t pt-6">
            <h2 className="mb-4 text-xl font-semibold">Related Resources</h2>
            <div className="flex flex-col gap-2">
              <Link href="/knowledge-base/resources">
                <Button variant="link" className="h-auto p-0">
                  Browse Expert Resources
                </Button>
              </Link>
              <Link href="/knowledge-base">
                <Button variant="link" className="h-auto p-0">
                  Explore Knowledge Base
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="link" className="h-auto p-0">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

