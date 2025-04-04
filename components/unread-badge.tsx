import { cn } from "@/lib/utils"

interface UnreadBadgeProps {
  count: number
  max?: number
  className?: string
}

export function UnreadBadge({ count, max = 99, className }: UnreadBadgeProps) {
  if (count <= 0) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground",
        className,
      )}
    >
      {displayCount}
    </span>
  )
}

