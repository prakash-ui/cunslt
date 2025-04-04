// List of common timezones
export const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Europe/Moscow", label: "Moscow Time" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Asia/Shanghai", label: "China Standard Time" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
  { value: "Pacific/Auckland", label: "New Zealand Time" },
]

// Get user's timezone
export function getUserTimezone(): string {
  if (typeof Intl !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return "UTC"
}

// Format date to user's timezone
export function formatDateToTimezone(
  date: Date | string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  },
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: timezone,
  }).format(dateObj)
}

// Convert date from one timezone to another
export function convertDateBetweenTimezones(date: Date | string, fromTimezone: string, toTimezone: string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date

  // Get the UTC timestamp
  const utcDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "UTC" }))
  const utcTimestamp = utcDate.getTime()

  // Get the offset between UTC and fromTimezone
  const fromOffset = getTimezoneOffset(fromTimezone)

  // Get the offset between UTC and toTimezone
  const toOffset = getTimezoneOffset(toTimezone)

  // Calculate the new timestamp
  const newTimestamp = utcTimestamp + (toOffset - fromOffset) * 60 * 1000

  return new Date(newTimestamp)
}

// Get timezone offset in minutes
function getTimezoneOffset(timezone: string): number {
  const date = new Date()
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }))
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }))
  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000)
}

// Get timezone name from timezone ID
export function getTimezoneName(timezoneId: string): string {
  const timezone = timezones.find((tz) => tz.value === timezoneId)
  return timezone?.label || timezoneId
}

// Get current time in a specific timezone
export function getCurrentTimeInTimezone(timezone: string): Date {
  const date = new Date()
  return convertDateBetweenTimezones(date, getUserTimezone(), timezone)
}

