"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserSearchHistory } from "@/app/actions/search"
import { useToast } from "@/hooks/use-toast"
import { Clock, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SearchHistoryProps {
  onSearchSelect: (query: string) => void
}

export function SearchHistory({ onSearchSelect }: SearchHistoryProps) {
  const { toast } = useToast()
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const history = await getUserSearchHistory()
        setSearchHistory(history)
      } catch (error) {
        console.error("Error fetching search history:", error)
        toast({
          title: "Error",
          description: "Failed to load search history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSearchHistory()
  }, [toast])

  const handleSelectSearch = (query: string) => {
    onSearchSelect(query)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading search history...</p>
          </div>
        ) : searchHistory.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">You don't have any recent searches.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {searchHistory.map((search) => (
              <button
                key={search.id}
                className="w-full flex items-center justify-between text-left border rounded-md p-2 hover:bg-muted/50 transition-colors"
                onClick={() => handleSelectSearch(search.query)}
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{search.query || "All experts"}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

