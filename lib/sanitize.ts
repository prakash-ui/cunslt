import DOMPurify from "isomorphic-dompurify"

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "b",
      "br",
      "code",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "i",
      "li",
      "ol",
      "p",
      "pre",
      "span",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "ul",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style"],
    FORBID_TAGS: ["script", "style", "iframe", "frame", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true },
  })
}

// Sanitize plain text (remove all HTML)
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

// Sanitize URL
export function sanitizeUrl(url: string): string {
  // Basic URL validation
  if (!url) return ""

  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return ""
    }
    return parsed.toString()
  } catch (e) {
    return ""
  }
}

// Sanitize form data
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item))
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

