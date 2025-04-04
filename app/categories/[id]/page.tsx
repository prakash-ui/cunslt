import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { SearchResults } from "@/components/search/search-results"
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata"
import { JsonLd, generateFAQSchema } from "@/components/seo/json-ld"

interface CategoryPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data: category } = await supabase.from("categories").select("*").eq("id", params.id).single()

    if (!category) {
      return baseGenerateMetadata({
        title: "Category Not Found",
        description: "The category you are looking for could not be found.",
        robots: "noindex, nofollow",
      })
    }

    return baseGenerateMetadata({
      title: `${category.name} Experts`,
      description: `Find and book consultations with top ${category.name.toLowerCase()} experts. Get professional advice and solutions for your ${category.name.toLowerCase()} needs.`,
      canonical: `/categories/${params.id}`,
    })
  } catch (error) {
    return baseGenerateMetadata({
      title: "Category Not Found",
      description: "The category you are looking for could not be found.",
      robots: "noindex, nofollow",
    })
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data: category } = await supabase.from("categories").select("*").eq("id", params.id).single()

    if (!category) {
      notFound()
    }

    // Get experts in this category
    const { data: experts, count } = await supabase
      .from("experts")
      .select(
        `
        *,
        profiles!inner(*)
      `,
        { count: "exact" },
      )
      .eq("is_verified", true)
      .in("id", supabase.from("expert_categories").select("expert_id").eq("category_id", params.id))
      .order("rating", { ascending: false })
      .limit(10)

    // FAQ data for structured data
    const faqs = [
      {
        question: `How do I find the best ${category.name} expert?`,
        answer: `To find the best ${category.name} expert, use our search filters to narrow down by rating, price, and availability. Read reviews from other clients and check the expert's verification status.`,
      },
      {
        question: `What is the average hourly rate for ${category.name} consultations?`,
        answer: `The average hourly rate for ${category.name} consultations varies based on experience and specialization. You can use our price filter to find experts within your budget.`,
      },
      {
        question: `How do I book a consultation with a ${category.name} expert?`,
        answer: `To book a consultation, select an expert, choose an available time slot, and complete the booking process. You'll receive a confirmation email with details about your upcoming consultation.`,
      },
    ]

    return (
      <div className="container mx-auto py-6 px-4">
        <JsonLd data={generateFAQSchema(faqs)} />

        <Breadcrumb
          items={[
            { name: "Categories", url: "/search" },
            { name: category.name, url: `/categories/${params.id}` },
          ]}
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold mb-2">{category.name} Experts</h1>
          <p className="text-lg text-gray-600 mb-6">
            Find and book consultations with top {category.name.toLowerCase()} experts
          </p>

          <SearchResults
            experts={experts || []}
            total={count || 0}
            page={1}
            limit={10}
            isLoading={false}
            showCategoryLink={false}
          />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

