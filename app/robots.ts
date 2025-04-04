import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cunslt.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard/",
        "/messages/",
        "/bookings/",
        "/expert/dashboard/",
        "/expert/wallet/",
        "/expert/availability/",
        "/expert/verification/",
        "/expert/reviews/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

