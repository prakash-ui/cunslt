import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getKBCategoryBySlug, getKBArticles } from "@/app/actions/knowledge-base"
import { ArticleCard } from "@/components/knowledge-base/article-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getKBCategoryBySlug(params.slug)

  if (!category) {
    return {
      title: "Category Not Found | Knowledge Base",
    }
  }

  return {
    title: `${category.name} | Knowledge Base`,
    description: category.description || `Browse articles in the ${category.name} category`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getKBCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  const articles = await getKBArticles({
    categoryId: category.id,
    published: true,
  })

  return (
    <div className="container py-8">
      <Link href="/knowledge-base">
        <Button variant="ghost" size="sm" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
        {category.description && <p className="text-muted-foreground">{category.description}</p>}
      </div>

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} showCategory={false} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-medium">No articles found</h2>
          <p className="mb-4 text-muted-foreground">There are no articles in this category yet.</p>
          <Link href="/knowledge-base">
            <Button>Browse other categories</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

