"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"
import { SavedSearches } from "@/components/search/saved-searches"
import { SearchHistory } from "@/components/search/search-history"
import { ExpertRecommendations } from "@/components/search/expert-recommendations"
import { searchExperts, type SearchFilters as SearchFiltersType } from "@/app/actions/search"
import { useToast } from "@/hooks/use-toast"
import { SearchIcon, X } from "lucide-react"
import { debounce } from "lodash"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get initial query and page from URL
  const initialQuery = searchParams.get("q") || ""
  const initialPage = Number.parseInt(searchParams.get("page") || "1")

  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [experts, setExperts] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Update URL with search params
  const updateUrl = useCallback(
    (newQuery: string, newFilters: SearchFiltersType, newPage: number) => {
      const params = new URLSearchParams()

      if (newQuery) {
        params.set("q", newQuery)
      }

      if (newPage > 1) {
        params.set("page", newPage.toString())
      }

      if (newFilters.categories && newFilters.categories.length > 0) {
        params.set("categories", newFilters.categories.join(","))
      }

      if (newFilters.minRating) {
        params.set("minRating", newFilters.minRating.toString())
      }

      if (newFilters.minPrice !== undefined) {
        params.set("minPrice", newFilters.minPrice.toString())
      }

      if (newFilters.maxPrice !== undefined) {
        params.set("maxPrice", newFilters.maxPrice.toString())
      }

      if (newFilters.languages && newFilters.languages.length > 0) {
        params.set("languages", newFilters.languages.join(","))
      }

      if (newFilters.availability && newFilters.availability.length > 0) {
        params.set("availability", newFilters.availability.join(","))
      }

      if (newFilters.experienceLevel && newFilters.experienceLevel.length > 0) {
        params.set("experienceLevel", newFilters.experienceLevel.join(","))
      }

      if (newFilters.location) {
        params.set("location", newFilters.location)
      }

      if (newFilters.sortBy) {
        params.set("sortBy", newFilters.sortBy)
      }

      const url = `/search${params.toString() ? `?${params.toString()}` : ""}`
      router.push(url, { scroll: false })
    },
    [router],
  )

  // Fetch experts based on query and filters
  const fetchExperts = useCallback(
    async (searchQuery: string, searchFilters: SearchFiltersType, page: number) => {
      setLoading(true)
      try {
        const result = await searchExperts(searchQuery, searchFilters, page)
        setExperts(result.experts)
        setPagination(result.pagination)
        setHasSearched(true)
      } catch (error) {
        console.error("Error searching experts:", error)
        toast({
          title: "Error",
          description: "Failed to search experts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchFilters: SearchFiltersType, page: number) => {
      fetchExperts(searchQuery, searchFilters, page)
      updateUrl(searchQuery, searchFilters, page)
    }, 500),
    [fetchExperts, updateUrl],
  )

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchExperts(query, filters, 1)
    updateUrl(query, filters, 1)
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
    debouncedSearch(query, newFilters, 1)
  }

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage })
    fetchExperts(query, filters, newPage)
    updateUrl(query, filters, newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle search history selection
  const handleSearchHistorySelect = (historyQuery: string) => {
    setQuery(historyQuery)
    fetchExperts(historyQuery, filters, 1)
    updateUrl(historyQuery, filters, 1)
  }

  // Handle saved search selection
  const handleSavedSearchSelect = (savedQuery: string, savedFilters: SearchFiltersType) => {
    setQuery(savedQuery)
    setFilters(savedFilters)
    fetchExperts(savedQuery, savedFilters, 1)
    updateUrl(savedQuery, savedFilters, 1)
  }

  // Clear search
  const clearSearch = () => {
    setQuery("")
    setFilters({})
    updateUrl("", {}, 1)
  }

  // Initial search on mount
  useEffect(() => {
    if (initialQuery || Object.keys(searchParams).length > 1) {
      fetchExperts(initialQuery, filters, initialPage)
    }
  }, [initialQuery, initialPage, filters, fetchExperts, searchParams])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Find an Expert</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for experts by name, skills, or expertise..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="space-y-6">
            <SearchFilters initialFilters={filters} onFiltersChange={handleFiltersChange} />

            {!hasSearched && (
              <>
                <SavedSearches currentQuery={query} currentFilters={filters} onSearchSelect={handleSavedSearchSelect} />

                <SearchHistory onSearchSelect={handleSearchHistorySelect} />
              </>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="md:col-span-2 lg:col-span-3">
          {hasSearched ? (
            <SearchResults
              experts={experts}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="space-y-6">
              <ExpertRecommendations />

              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <h2 className="text-xl font-medium mb-2">Start Your Search</h2>
                <p className="text-muted-foreground mb-4">
                  Search for experts by name, skills, or expertise to find the perfect match for your needs.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use filters to narrow down results by category, price range, rating, and more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

