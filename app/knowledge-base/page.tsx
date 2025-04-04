import type { Metadata } from "next"
import { getKBCategories, getKBArticles } from "@/app/actions/knowledge-base"
import { CategoryCard } from "@/components/knowledge-base/category-card"
import { ArticleCard } from "@/components/knowledge-base/article-card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Knowledge Base | Cunslt",
  description: "Browse articles, guides, and resources to help you get the most out of the platform",
}

export default async function KnowledgeBasePage() {
  const categories = await getKBCategories()
  const featuredArticles = await getKBArticles({
    featured: true,
    limit: 3,
    published: true,
  })

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Knowledge Base</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Browse articles, guides, and resources to help you get the most out of the platform
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/knowledge-base/search">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Search Knowledge Base
            </Button>
          </Link>
        </div>
      </div>

      {featuredArticles.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Featured Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-6 text-2xl font-semibold">Browse by Category</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold">Can't find what you're looking for?</h2>
        <p className="mb-4 text-muted-foreground">Browse our expert resources or contact support for assistance</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/knowledge-base/resources">
            <Button variant="outline">Browse Expert Resources</Button>
          </Link>
          <Link href="/contact">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

