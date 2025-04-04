type EventName =
  | "page_view"
  | "search"
  | "expert_view"
  | "booking_started"
  | "booking_completed"
  | "consultation_joined"
  | "message_sent"
  | "signup"
  | "login"
  | "error"

type EventProperties = Record<string, string | number | boolean | null>

export function trackEvent(eventName: EventName, properties?: EventProperties) {
  // Don't track events during development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties)
    return
  }

  // Google Analytics
  if (typeof window !== "undefined" && "gtag" in window) {
    // @ts-ignore
    window.gtag("event", eventName, properties)
  }

  // Send to our own analytics endpoint
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch((error) => {
      console.error("Error sending analytics:", error)
    })
  } catch (error) {
    console.error("Error tracking event:", error)
  }
}

export function trackPageView(url: string) {
  trackEvent("page_view", { url })
}

export function trackSearch(query: string, filters?: Record<string, any>, resultsCount?: number) {
  trackEvent("search", {
    query,
    filters: filters ? JSON.stringify(filters) : null,
    results_count: resultsCount || 0,
  })
}

export function trackError(error: Error, componentName?: string) {
  trackEvent("error", {
    message: error.message,
    stack: error.stack || "",
    component: componentName || "unknown",
  })
}

