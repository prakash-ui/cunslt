"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { useCookieConsent } from "@/hooks/use-cookie-consent"

export function ThirdPartyScripts() {
  const { getConsent } = useCookieConsent()
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false)
  const [shouldLoadMarketing, setShouldLoadMarketing] = useState(false)

  useEffect(() => {
    const analyticsConsent = getConsent("analytics")
    const marketingConsent = getConsent("marketing")

    setShouldLoadAnalytics(analyticsConsent)
    setShouldLoadMarketing(marketingConsent)
  }, [getConsent])

  return (
    <>
      {/* Essential scripts - always load */}
      <Script
        id="essential-scripts"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Essential functionality scripts
            console.log('Essential scripts loaded');
          `,
        }}
      />

      {/* Analytics scripts - load only with consent */}
      {shouldLoadAnalytics && (
        <>
          <Script
            id="google-analytics"
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics-config"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Marketing scripts - load only with consent */}
      {shouldLoadMarketing && (
        <Script
          id="marketing-scripts"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              // Marketing scripts
              console.log('Marketing scripts loaded');
            `,
          }}
        />
      )}
    </>
  )
}

