"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Types
export type KBCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  article_count?: number
}

export type KBArticle = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  category_id: string | null
  author_id: string
  is_featured: boolean
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
  author_name?: string
  category_name?: string
  tags?: string[]
}

export type KBTag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type ExpertResource = {
  id: string
  title: string
  description: string | null
  file_url: string
  file_type: string | null
  expert_id: string
  is_public: boolean
  download_count: number
  created_at: string
  updated_at: string
  expert_name?: string
}

// Validation schemas
const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z
    .string()
    .min(5, "Slug must be at least 5 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  category_id: z.string().uuid().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

const resourceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  file_url: z.string().url("Must be a valid URL"),
  file_type: z.string().optional(),
  is_public: z.boolean().default(false),
})

// Get all categories with article count
export async function getKBCategories() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("kb_categories")
    .select(`
      *,
      article_count:kb_articles(count)
    `)
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching KB categories:", error)
    return []
  }

  return data.map((category) => ({
    ...category,
    article_count: category.article_count[0]?.count || 0,
  })) as KBCategory[]
}

// Get category by slug
export async function getKBCategoryBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("kb_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("Error fetching KB category:", error)
    return null
  }

  return data as KBCategory
}

// Get all articles
export async function getKBArticles(options?: {
  categoryId?: string
  featured?: boolean
  limit?: number
  published?: boolean
}) {
  const supabase = createClient()

  let query = supabase.from("kb_articles").select(`
      *,
      author:author_id(name),
      category:category_id(name)
    `)

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId)
  }

  if (options?.featured) {
    query = query.eq("is_featured", true)
  }

  if (options?.published !== undefined) {
    query = query.eq("is_published", options.published)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching KB articles:", error)
    return []
  }

  // Get tags for each article
  const articlesWithTags = await Promise.all(
    data.map(async (article) => {
      const { data: tagData } = await supabase
        .from("kb_article_tags")
        .select("tag:tag_id(name)")
        .eq("article_id", article.id)

      return {
        ...article,
        author_name: article.author?.name || "Unknown",
        category_name: article.category?.name || "Uncategorized",
        tags: tagData?.map((t) => t.tag.name) || [],
      }
    }),
  )

  return articlesWithTags as KBArticle[]
}

// Get article by slug
export async function getKBArticleBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("kb_articles")
    .select(`
      *,
      author:author_id(name),
      category:category_id(name)
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching KB article:", error)
    return null
  }

  // Get tags
  const { data: tagData } = await supabase.from("kb_article_tags").select("tag:tag_id(name)").eq("article_id", data.id)

  return {
    ...data,
    author_name: data.author?.name || "Unknown",
    category_name: data.category?.name || "Uncategorized",
    tags: tagData?.map((t) => t.tag.name) || [],
  } as KBArticle
}

// Increment article view count
export async function incrementArticleViewCount(articleId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("increment_kb_article_views", {
    article_id: articleId,
  })

  if (error) {
    console.error("Error incrementing view count:", error)
  }
}

// Create or update article
export async function upsertKBArticle(formData: FormData, articleId?: string) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Get user profile to check if expert or admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "expert" && profile.role !== "admin")) {
    return { success: false, error: "Not authorized" }
  }

  // Parse and validate form data
  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const content = formData.get("content") as string
  const excerpt = formData.get("excerpt") as string
  const categoryId = formData.get("category_id") as string
  const isFeatured = formData.get("is_featured") === "true"
  const isPublished = formData.get("is_published") === "true"
  const tagsString = formData.get("tags") as string
  const tags = tagsString ? tagsString.split(",").map((t) => t.trim()) : []

  const validation = articleSchema.safeParse({
    title,
    slug,
    content,
    excerpt,
    category_id: categoryId || undefined,
    is_featured: isFeatured,
    is_published: isPublished,
    tags,
  })

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(", "),
    }
  }

  // Check if slug is unique (except for the current article)
  const { data: existingSlug } = await supabase
    .from("kb_articles")
    .select("id")
    .eq("slug", slug)
    .neq("id", articleId || "")
    .maybeSingle()

  if (existingSlug) {
    return { success: false, error: "Slug already exists" }
  }

  // Create or update article
  const articleData = {
    title,
    slug,
    content,
    excerpt: excerpt || null,
    category_id: categoryId || null,
    is_featured: isFeatured,
    is_published: isPublished,
    ...(articleId ? {} : { author_id: user.id }),
  }

  const { data: article, error } = articleId
    ? await supabase.from("kb_articles").update(articleData).eq("id", articleId).select().single()
    : await supabase.from("kb_articles").insert(articleData).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Handle tags
  if (tags.length > 0) {
    // First, remove existing tags if updating
    if (articleId) {
      await supabase.from("kb_article_tags").delete().eq("article_id", articleId)
    }

    // Create tags that don't exist
    for (const tagName of tags) {
      // Check if tag exists
      const { data: existingTag } = await supabase.from("kb_tags").select("id").eq("name", tagName).maybeSingle()

      let tagId

      if (existingTag) {
        tagId = existingTag.id
      } else {
        // Create new tag
        const { data: newTag } = await supabase
          .from("kb_tags")
          .insert({
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, "-"),
          })
          .select("id")
          .single()

        tagId = newTag?.id
      }

      if (tagId) {
        // Associate tag with article
        await supabase.from("kb_article_tags").insert({
          article_id: article.id,
          tag_id: tagId,
        })
      }
    }
  }

  revalidatePath("/knowledge-base")
  revalidatePath(`/knowledge-base/${article.slug}`)

  return { success: true, articleId: article.id }
}

// Submit article feedback
export async function submitArticleFeedback(articleId: string, isHelpful: boolean, comment?: string) {
  const supabase = createClient()

  // Get current user (optional)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("kb_article_feedback").insert({
    article_id: articleId,
    user_id: user?.id || null,
    is_helpful: isHelpful,
    comment: comment || null,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get expert resources
export async function getExpertResources(options?: {
  expertId?: string
  publicOnly?: boolean
  limit?: number
}) {
  const supabase = createClient()

  let query = supabase.from("expert_resources").select(`
      *,
      expert:expert_id(name)
    `)

  if (options?.expertId) {
    query = query.eq("expert_id", options.expertId)
  }

  if (options?.publicOnly) {
    query = query.eq("is_public", true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching expert resources:", error)
    return []
  }

  return data.map((resource) => ({
    ...resource,
    expert_name: resource.expert?.name || "Unknown Expert",
  })) as ExpertResource[]
}

// Create or update expert resource
export async function upsertExpertResource(formData: FormData, resourceId?: string) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Get user profile to check if expert
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "expert") {
    return { success: false, error: "Not authorized" }
  }

  // Parse and validate form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const fileUrl = formData.get("file_url") as string
  const fileType = formData.get("file_type") as string
  const isPublic = formData.get("is_public") === "true"

  const validation = resourceSchema.safeParse({
    title,
    description,
    file_url: fileUrl,
    file_type: fileType,
    is_public: isPublic,
  })

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(", "),
    }
  }

  // Create or update resource
  const resourceData = {
    title,
    description: description || null,
    file_url: fileUrl,
    file_type: fileType || null,
    is_public: isPublic,
    ...(resourceId ? {} : { expert_id: user.id }),
  }

  const { data: resource, error } = resourceId
    ? await supabase
        .from("expert_resources")
        .update(resourceData)
        .eq("id", resourceId)
        .eq("expert_id", user.id) // Ensure expert can only update their own resources
        .select()
        .single()
    : await supabase.from("expert_resources").insert(resourceData).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/knowledge-base/resources")
  revalidatePath("/dashboard/expert/resources")

  return { success: true, resourceId: resource.id }
}

// Increment resource download count
export async function incrementResourceDownloadCount(resourceId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("increment_resource_downloads", {
    resource_id: resourceId,
  })

  if (error) {
    console.error("Error incrementing download count:", error)
  }
}

// Search knowledge base
export async function searchKnowledgeBase(query: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("kb_articles")
    .select(`
      *,
      author:author_id(name),
      category:category_id(name)
    `)
    .eq("is_published", true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error searching KB:", error)
    return []
  }

  return data.map((article) => ({
    ...article,
    author_name: article.author?.name || "Unknown",
    category_name: article.category?.name || "Uncategorized",
  })) as KBArticle[]
}

