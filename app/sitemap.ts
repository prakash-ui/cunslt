import type { MetadataRoute } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerComponentClient({ cookies })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cunslt.com"

  // Static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Dynamic routes - Experts
  const { data: experts } = await supabase.from("experts").select("id, updated_at").eq("is_verified", true)

  const expertRoutes =
    experts?.map((expert) => ({
      url: `${baseUrl}/experts/${expert.id}`,
      lastModified: new Date(expert.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || []

  // Dynamic routes - Categories
  const { data: categories } = await supabase.from("categories").select("id, name")

  const categoryRoutes =
    categories?.map((category) => ({
      url: `${baseUrl}/categories/${category.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || []

  return [...staticRoutes, ...expertRoutes, ...categoryRoutes]
}

