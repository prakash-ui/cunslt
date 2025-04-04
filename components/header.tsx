"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { useLanguage } from "@/i18n/language-provider"
import { cn } from "@/lib/utils"

interface HeaderProps {
  user?: {
    id: string
    full_name: string
    avatar_url?: string
    email: string
    user_type: "client" | "expert" | "admin"
  } | null
}

export function Header({ user }: HeaderProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => {
    return pathname.includes(path)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-md" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            {t("common.appName")}
          </Link>

          <nav className="hidden md:flex ml-10 space-x-8">
            <Link
              href="/experts"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/experts") ? "text-primary" : "text-gray-600 hover:text-primary",
              )}
            >
              {t("experts.findExperts")}
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/how-it-works") ? "text-primary" : "text-gray-600 hover:text-primary",
              )}
            >
              {t("common.howItWorks")}
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/pricing") ? "text-primary" : "text-gray-600 hover:text-primary",
              )}
            >
              {t("common.pricing")}
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <CurrencySwitcher />

          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </Link>

              <Link href="/dashboard">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                  <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">{t("auth.signIn")}</Button>
              </Link>
              <Link href="/signup">
                <Button>{t("auth.signUp")}</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/experts"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive("/experts") ? "text-primary" : "text-gray-600",
                )}
                onClick={closeMenu}
              >
                {t("experts.findExperts")}
              </Link>
              <Link
                href="/how-it-works"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive("/how-it-works") ? "text-primary" : "text-gray-600",
                )}
                onClick={closeMenu}
              >
                {t("common.howItWorks")}
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive("/pricing") ? "text-primary" : "text-gray-600",
                )}
                onClick={closeMenu}
              >
                {t("common.pricing")}
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            {user ? (
              <div className="flex flex-col space-y-4">
                <Link href="/dashboard/notifications" className="flex items-center space-x-2" onClick={closeMenu}>
                  <Bell className="h-5 w-5" />
                  <span>{t("common.notifications")}</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-2" onClick={closeMenu}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                    <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{t("dashboard.dashboard")}</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full">
                    {t("auth.signIn")}
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeMenu}>
                  <Button className="w-full">{t("auth.signUp")}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

