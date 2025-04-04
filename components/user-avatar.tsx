import type { User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface UserAvatarProps {
  user: Pick<User, "image" | "name">
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function UserAvatar({ user, className, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ""}`}>
      <AvatarImage src={user.image || ""} alt={user.name || "User"} />
      <AvatarFallback>{user.name ? getInitials(user.name) : "U"}</AvatarFallback>
    </Avatar>
  )
}

