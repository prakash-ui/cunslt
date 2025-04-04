import type { Metadata } from "next"

type MetadataProps = {
  title?: string
  description?: string
  image?: string
  canonical?: string
  type?: "website" | "article" | "profile"
  robots?: string
}

export function generateMetadata({
  title,
  description,
  image,
  canonical,
  type = "website",
  robots,
}: MetadataProps): Metadata {
  const siteName = "Cunslt"
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cunslt.com"

  // Default values
  const defaultTitle = "Cunslt | Expert Consultations on Demand"
  const defaultDescription =
    "Book expert consultations in business, finance, and tech on a pay-per-hour basis. Connect with verified experts through video consultations."
  const defaultImage = `${baseUrl}/images/og-image.jpg`

  // Construct full title
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle

  return {
    title: fullTitle,
    description: description || defaultDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonical ? `${baseUrl}${canonical}` : undefined,
    },
    robots: robots || "index, follow",
    openGraph: {
      title: fullTitle,
      description: description || defaultDescription,
      url: canonical ? `${baseUrl}${canonical}` : baseUrl,
      siteName,
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || defaultDescription,
      images: [image || defaultImage],
    },
  }
}

