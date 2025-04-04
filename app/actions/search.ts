"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export type SearchFilters = {
  categories?: string[]
  minRating?: number
  maxPrice?: number
  minPrice?: number
  languages?: string[]
  availability?: string[] // days of week
  experienceLevel?: string[]
  location?: string
  sortBy?: "relevance" | "rating" | "price_low" | "price_high" | "availability"
}

export async function searchExperts(query: string, filters: SearchFilters = {}, page = 1, pageSize = 10) {
  const supabase = createClient()
  const user = await getCurrentUser()

  // Save search to history if user is logged in
  if (user && query) {
    await supabase.from("search_history").insert({
      user_id: user.id,
      query,
      filters,
    })
  }

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize

  // Start building the query
  let expertQuery = supabase
    .from("experts")
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        profile_image
      ),
      expert_rates (
        hourly_rate
      ),
      expert_rankings (
        overall_score
      ),
      categories:expert_category_mappings (
        expert_categories (
          id,
          name,
          parent_id
        )
      )
    `)
    .eq("status", "approved")

  // Apply full-text search if query is provided
  if (query) {
    // Convert query to tsquery format
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `${term}:*`)
      .join(" & ")

    if (tsQuery) {
      expertQuery = expertQuery.textSearch("search_vector", tsQuery, {
        config: "english",
        type: "websearch",
      })
    }
  }

  // Apply filters
  if (filters.categories && filters.categories.length > 0) {
    expertQuery = expertQuery.filter("categories.expert_categories.id", "in", `(${filters.categories.join(",")})`)
  }

  if (filters.minRating) {
    expertQuery = expertQuery.gte("average_rating", filters.minRating)
  }

  if (filters.languages && filters.languages.length > 0) {
    expertQuery = expertQuery.contains("languages", filters.languages)
  }

  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    expertQuery = expertQuery.in("experience_level", filters.experienceLevel)
  }

  if (filters.location) {
    expertQuery = expertQuery.eq("country", filters.location)
  }

  // Apply price filter with a join to expert_rates
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    if (filters.minPrice !== undefined) {
      expertQuery = expertQuery.gte("expert_rates.hourly_rate", filters.minPrice)
    }
    if (filters.maxPrice !== undefined) {
      expertQuery = expertQuery.lte("expert_rates.hourly_rate", filters.maxPrice)
    }
  }

  // Apply availability filter with a join to availability_slots
  if (filters.availability && filters.availability.length > 0) {
    const daysOfWeek = filters.availability.map((day) => Number.parseInt(day))
    expertQuery = expertQuery.filter("availability_slots.day_of_week", "in", `(${daysOfWeek.join(",")})`)
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "rating":
        expertQuery = expertQuery.order("average_rating", { ascending: false })
        break
      case "price_low":
        expertQuery = expertQuery.order("expert_rates.hourly_rate", { ascending: true })
        break
      case "price_high":
        expertQuery = expertQuery.order("expert_rates.hourly_rate", { ascending: false })
        break
      case "availability":
        // Sort by number of availability slots (most available first)
        expertQuery = expertQuery.order("availability_count", { ascending: false })
        break
      default:
        // Default sort by relevance (if search query provided) or ranking
        if (query) {
          // Already sorted by relevance from text search
        } else {
          expertQuery = expertQuery.order("expert_rankings.overall_score", { ascending: false })
        }
    }
  } else {
    // Default sort
    if (query) {
      // Already sorted by relevance from text search
    } else {
      expertQuery = expertQuery.order("expert_rankings.overall_score", { ascending: false })
    }
  }

  // Apply pagination
  expertQuery = expertQuery.range(offset, offset + pageSize - 1)

  // Execute the query
  const { data: experts, error, count } = await expertQuery

  if (error) {
    console.error("Error searching experts:", error)
    throw new Error("Failed to search experts")
  }

  // Get total count for pagination
  const { count: totalCount, error: countError } = await supabase
    .from("experts")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")

  if (countError) {
    console.error("Error counting experts:", countError)
    throw new Error("Failed to count experts")
  }

  return {
    experts: experts || [],
    pagination: {
      page,
      pageSize,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / pageSize),
    },
  }
}

export async function getExpertCategories() {
  const supabase = createClient()

  // Get all categories
  const { data: categories, error } = await supabase.from("expert_categories").select("*").order("name")

  if (error) {
    console.error("Error fetching expert categories:", error)
    throw new Error("Failed to fetch expert categories")
  }

  // Organize into parent and child categories
  const parentCategories = categories?.filter((cat) => !cat.parent_id) || []
  const childCategories = categories?.filter((cat) => cat.parent_id) || []

  // Create a hierarchical structure
  const categoriesTree = parentCategories.map((parent) => ({
    ...parent,
    children: childCategories.filter((child) => child.parent_id === parent.id),
  }))

  return categoriesTree
}

export async function getSimilarExperts(expertId: string, limit = 5) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_similar_experts", {
    p_expert_id: expertId,
    p_limit: limit,
  })

  if (error) {
    console.error("Error fetching similar experts:", error)
    throw new Error("Failed to fetch similar experts")
  }

  if (!data || data.length === 0) {
    return []
  }

  // Get full expert details
  const expertIds = data.map((item) => item.id)
  const { data: experts, error: expertsError } = await supabase
    .from("experts")
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        profile_image
      ),
      expert_rates (
        hourly_rate
      )
    `)
    .in("id", expertIds)

  if (expertsError) {
    console.error("Error fetching expert details:", expertsError)
    throw new Error("Failed to fetch expert details")
  }

  // Sort experts by similarity score
  return (
    experts?.sort((a, b) => {
      const aScore = data.find((item) => item.id === a.id)?.similarity || 0
      const bScore = data.find((item) => item.id === b.id)?.similarity || 0
      return bScore - aScore
    }) || []
  )
}

export async function getExpertRecommendations(limit = 10) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    // Return popular experts if user is not logged in
    const { data: popularExperts, error } = await supabase
      .from("experts")
      .select(`
        *,
        user_profiles (
          first_name,
          last_name,
          profile_image
        ),
        expert_rates (
          hourly_rate
        )
      `)
      .eq("status", "approved")
      .order("average_rating", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching popular experts:", error)
      throw new Error("Failed to fetch expert recommendations")
    }

    return popularExperts || []
  }

  // Get personalized recommendations for logged-in user
  const { data, error } = await supabase.rpc("get_expert_recommendations", {
    p_user_id: user.id,
    p_limit: limit,
  })

  if (error) {
    console.error("Error fetching expert recommendations:", error)
    throw new Error("Failed to fetch expert recommendations")
  }

  if (!data || data.length === 0) {
    // Fallback to popular experts if no recommendations
    return getPopularExperts(limit)
  }

  // Get full expert details
  const expertIds = data.map((item) => item.id)
  const { data: experts, error: expertsError } = await supabase
    .from("experts")
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        profile_image
      ),
      expert_rates (
        hourly_rate
      )
    `)
    .in("id", expertIds)

  if (expertsError) {
    console.error("Error fetching expert details:", expertsError)
    throw new Error("Failed to fetch expert details")
  }

  // Sort experts by relevance score
  return (
    experts?.sort((a, b) => {
      const aScore = data.find((item) => item.id === a.id)?.relevance_score || 0
      const bScore = data.find((item) => item.id === b.id)?.relevance_score || 0
      return bScore - aScore
    }) || []
  )
}

export async function getPopularExperts(limit = 10) {
  const supabase = createClient()

  const { data: experts, error } = await supabase
    .from("experts")
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        profile_image
      ),
      expert_rates (
        hourly_rate
      )
    `)
    .eq("status", "approved")
    .order("average_rating", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching popular experts:", error)
    throw new Error("Failed to fetch popular experts")
  }

  return experts || []
}

export async function getUserSearchHistory(limit = 10) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching search history:", error)
    throw new Error("Failed to fetch search history")
  }

  return data || []
}

export async function saveSearch(name: string, query: string, filters: SearchFilters) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to save searches")
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: user.id,
      name,
      query,
      filters,
    })
    .select()

  if (error) {
    console.error("Error saving search:", error)
    throw new Error("Failed to save search")
  }

  revalidatePath("/search")
  return data[0]
}

export async function getSavedSearches() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching saved searches:", error)
    throw new Error("Failed to fetch saved searches")
  }

  return data || []
}

export async function deleteSavedSearch(id: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("You must be logged in to delete saved searches")
  }

  const { error } = await supabase.from("saved_searches").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting saved search:", error)
    throw new Error("Failed to delete saved search")
  }

  revalidatePath("/search")
}

