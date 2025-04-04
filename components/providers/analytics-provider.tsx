"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"
import { trackPageView } from "@/lib/analytics"
import { useCookieConsent } from "@/hooks/use-cookie-consent"
import { ErrorTracker } from "@/components/error-tracker"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { getConsent } = useCookieConsent()

  // Track page views
  useEffect(() => {
    if (getConsent("analytics")) {
      // Construct the URL with search params
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
      trackPageView(url)
    }
  }, [pathname, searchParams, getConsent])

  const hasAnalyticsConsent = getConsent("analytics")

  return (
    <>
      {hasAnalyticsConsent && (
        <>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>

          {/* Error tracking */}
          <ErrorTracker />
        </>
      )}
      {children}
    </>
  )
}

