import { redirect } from "next/navigation"
import { i18n } from "@/i18n-config"

export default async function RootPage() { // Add async
  redirect(`/${i18n.defaultLocale}`)
}

