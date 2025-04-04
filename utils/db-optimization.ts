import { createClient } from "@/utils/supabase/server"
import { getCachedData, invalidateCache } from "./redis-cache"

/**
 * Optimized function to get experts with caching
 */
export async function getExpertsOptimized(
  page = 1,
  limit = 10,
  filters: Record<string, any> = {},
  sortBy = "created_at",
  sortOrder: "asc" | "desc" = "desc",
) {
  const cacheKey = `experts:${page}:${limit}:${JSON.stringify(filters)}:${sortBy}:${sortOrder}`

  return getCachedData(
    cacheKey,
    async () => {
      const supabase = createClient()
      const offset = (page - 1) * limit

      // Start building the query
      let query = supabase
        .from("users")
        .select(
          `
          id, 
          full_name, 
          avatar_url, 
          title, 
          hourly_rate, 
          average_rating, 
          total_reviews,
          categories (name)
        `,
          { count: "exact" },
        )
        .eq("user_type", "expert")
        .eq("is_verified", true)

      // Apply filters
      if (filters.category) {
        query = query.contains("categories", [{ name: filters.category }])
      }

      if (filters.minRating) {
        query = query.gte("average_rating", filters.minRating)
      }

      if (filters.maxPrice) {
        query = query.lte("hourly_rate", filters.maxPrice)
      }

      if (filters.minPrice) {
        query = query.gte("hourly_rate", filters.minPrice)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        experts: data || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: count ? Math.ceil(count / limit) : 0,
        },
      }
    },
    // Cache for 15 minutes
    60 * 15,
  )
}

/**
 * Optimized function to get expert details with caching
 */
export async function getExpertDetailsOptimized(expertId: string) {
  const cacheKey = `expert:${expertId}`

  return getCachedData(
    cacheKey,
    async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          categories (name),
          expert_profiles (*)
        `)
        .eq("id", expertId)
        .eq("user_type", "expert")
        .single()

      if (error) {
        throw error
      }

      return data
    },
    // Cache for 1 hour
    60 * 60,
  )
}

/**
 * Invalidate expert cache when data changes
 */
export async function invalidateExpertCache(expertId: string) {
  await invalidateCache(`expert:${expertId}`)
  await invalidateCache(`experts:*`) // Invalidate all expert list caches
}

