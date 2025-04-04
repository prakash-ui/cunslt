import type { Expert } from "@/types"

type JsonLdProps = {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cunslt",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
    sameAs: ["https://twitter.com/cunslt", "https://facebook.com/cunslt", "https://linkedin.com/company/cunslt"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-555-5555",
      contactType: "customer service",
      email: "support@cunslt.com",
      availableLanguage: ["English"],
    },
  }
}

export function generateExpertSchema(expert: Expert) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: expert.title,
    description: expert.bio,
    image: expert.profile_image,
    jobTitle: expert.title,
    worksFor: {
      "@type": "Organization",
      name: "Cunslt",
    },
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `Consultation with ${expert.title}`,
        description: expert.bio,
        offers: {
          "@type": "Offer",
          price: expert.hourly_rate,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/experts/${expert.id}`,
          validFrom: new Date().toISOString(),
        },
      },
    },
    review: expert.reviews?.map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: review.reviewer_name,
      },
      datePublished: review.created_at,
      reviewBody: review.comment,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: expert.rating,
      reviewCount: expert.review_count,
      bestRating: "5",
      worstRating: "1",
    },
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.url}`,
    })),
  }
}

