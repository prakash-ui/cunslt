"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getSavedSearches, saveSearch, deleteSavedSearch } from "@/app/actions/search"
import { useToast } from "@/hooks/use-toast"
import { BookmarkPlus, Trash2 } from "lucide-react"
import type { SearchFilters } from "@/app/actions/search"

interface SavedSearchesProps {
  currentQuery: string
  currentFilters: SearchFilters
  onSearchSelect: (query: string, filters: SearchFilters) => void
}

export function SavedSearches({ currentQuery, currentFilters, onSearchSelect }: SavedSearchesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState("")

  useEffect(() => {
    const fetchSavedSearches = async () => {
      try {
        const searches = await getSavedSearches()
        setSavedSearches(searches)
      } catch (error) {
        console.error("Error fetching saved searches:", error)
        toast({
          title: "Error",
          description: "Failed to load saved searches",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSavedSearches()
  }, [toast])

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your search",
        variant: "destructive",
      })
      return
    }

    try {
      const savedSearch = await saveSearch(searchName, currentQuery, currentFilters)
      setSavedSearches([savedSearch, ...savedSearches])
      setSaveDialogOpen(false)
      setSearchName("")

      toast({
        title: "Success",
        description: "Search saved successfully",
      })
    } catch (error) {
      console.error("Error saving search:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save search",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSearch = async (id: string) => {
    try {
      await deleteSavedSearch(id)
      setSavedSearches(savedSearches.filter((search) => search.id !== id))

      toast({
        title: "Success",
        description: "Search deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting search:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete search",
        variant: "destructive",
      })
    }
  }

  const handleSelectSearch = (search: any) => {
    onSearchSelect(search.query, search.filters)
  }

  // Format filters for display
  const formatFilters = (filters: SearchFilters) => {
    const parts = []

    if (filters.categories && filters.categories.length > 0) {
      parts.push(`${filters.categories.length} categories`)
    }

    if (filters.minRating) {
      parts.push(`${filters.minRating}+ stars`)
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange = []
      if (filters.minPrice !== undefined) priceRange.push(`$${filters.minPrice}`)
      if (filters.maxPrice !== undefined) priceRange.push(`$${filters.maxPrice}`)
      parts.push(`Price: ${priceRange.join("-")}`)
    }

    if (filters.languages && filters.languages.length > 0) {
      parts.push(`${filters.languages.length} languages`)
    }

    if (filters.availability && filters.availability.length > 0) {
      parts.push(`${filters.availability.length} days`)
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      parts.push(`${filters.experienceLevel.join(", ")}`)
    }

    if (filters.sortBy) {
      parts.push(`Sort: ${filters.sortBy.replace("_", " ")}`)
    }

    return parts.join(" • ")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Searches</CardTitle>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!currentQuery}>
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Save Current Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>Save your current search query and filters for quick access later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Search Query</p>
                <div className="rounded-md bg-muted p-2 text-sm">
                  {currentQuery || <span className="text-muted-foreground italic">No search query</span>}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Filters</p>
                <div className="rounded-md bg-muted p-2 text-sm">
                  {Object.keys(currentFilters).length > 0 ? (
                    formatFilters(currentFilters)
                  ) : (
                    <span className="text-muted-foreground italic">No filters applied</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="search-name" className="text-sm font-medium">
                  Search Name
                </label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter a name for this search"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch}>Save Search</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading saved searches...</p>
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">You don't have any saved searches yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Save your current search to quickly access it later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/50 transition-colors"
              >
                <button className="flex-1 text-left" onClick={() => handleSelectSearch(search)}>
                  <p className="font-medium">{search.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {search.query ? `"${search.query}"` : "All experts"}
                    {search.filters && Object.keys(search.filters).length > 0 && (
                      <span className="ml-1">• {formatFilters(search.filters)}</span>
                    )}
                  </p>
                </button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteSearch(search.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

