export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    const body = JSON.stringify(metric)
    const url = "/api/vitals"

    // Use `navigator.sendBeacon()` if available
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      // Fall back to fetch
      fetch(url, {
        body,
        method: "POST",
        keepalive: true,
      })
    }
  }
}

// Helper to measure component render time
export function useComponentTimer(componentName: string) {
  if (process.env.NODE_ENV !== "development") {
    return { startTimer: () => {}, endTimer: () => {} }
  }

  return {
    startTimer: () => {
      performance.mark(`${componentName}-start`)
    },
    endTimer: () => {
      performance.mark(`${componentName}-end`)
      performance.measure(`${componentName} render time`, `${componentName}-start`, `${componentName}-end`)
      const measurements = performance.getEntriesByName(`${componentName} render time`)
      console.log(`${componentName} render time:`, measurements[0].duration.toFixed(2), "ms")
    },
  }
}

