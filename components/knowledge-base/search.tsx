"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, X } from "lucide-react"
import { searchKnowledgeBase } from "@/app/actions/knowledge-base"
import type { KBArticle } from "@/app/actions/knowledge-base"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function KnowledgeBaseSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<KBArticle[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const searchResults = await searchKnowledgeBase(searchQuery)
      setResults(searchResults)

      // Update URL with search query
      const params = new URLSearchParams(searchParams)
      params.set("q", searchQuery)
      router.push(`/knowledge-base/search?${params.toString()}`)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setHasSearched(false)
    router.push("/knowledge-base/search")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the knowledge base..."
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </form>

      {isSearching ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : hasSearched ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            {results.length} {results.length === 1 ? "result" : "results"} for "{initialQuery}"
          </h2>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((article) => (
                <Link key={article.id} href={`/knowledge-base/article/${article.slug}`}>
                  <Card className="transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt || article.content.substring(0, 150) + "..."}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {article.category_name && <span className="mr-2">{article.category_name}</span>}
                        <span>By {article.author_name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No results found</h3>
              <p className="text-muted-foreground">Try using different keywords or browse our categories</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/knowledge-base")}>
                Browse all categories
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">Search the knowledge base</h3>
          <p className="text-muted-foreground">Enter keywords to find articles, guides, and resources</p>
        </div>
      )}
    </div>
  )
}

