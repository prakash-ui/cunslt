import type { Metadata } from "next"
import { KnowledgeBaseSearch } from "@/components/knowledge-base/search"

export const metadata: Metadata = {
  title: "Search Knowledge Base | Cunslt",
  description: "Search for articles, guides, and resources in our knowledge base",
}

export default function SearchPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Search Knowledge Base</h1>
        <KnowledgeBaseSearch />
      </div>
    </div>
  )
}

