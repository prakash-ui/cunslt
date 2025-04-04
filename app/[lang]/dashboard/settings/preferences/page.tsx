import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguagePreferences } from "@/components/settings/language-preferences"
import { CurrencyPreferences } from "@/components/settings/currency-preferences"
import { TimezonePreferences } from "@/components/settings/timezone-preferences"
import { getCurrentUser } from "@/app/actions/auth"
import { getDictionary } from "@/i18n/dictionaries"
import { redirect } from "next/navigation"

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const dictionary = await getDictionary(params.lang as any)

  return {
    title: `${dictionary.settings.settings} | ${dictionary.common.appName}`,
    description: "Manage your account preferences and settings",
  }
}

async function fetchPreferencesData(lang: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const dictionary = await getDictionary(lang as any)

    return { dictionary }
  } catch (error) {
    console.error("Error fetching preferences data:", error)
    redirect("/error") // Redirect to an error page or handle gracefully
  }
}

function PreferencesContent({ dictionary }: { dictionary: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.settings.language}</CardTitle>
          <CardDescription>{dictionary.settings.languageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguagePreferences />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.settings.currency}</CardTitle>
          <CardDescription>{dictionary.settings.currencyDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyPreferences />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.settings.timezone}</CardTitle>
          <CardDescription>{dictionary.settings.timezoneDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <TimezonePreferences />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PreferencesPage({ params }: {params: { lang: string } }) {
  const { dictionary } = await fetchPreferencesData(params.lang)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Preferences</h1>
      <PreferencesContent dictionary={dictionary} />
    </div>
  )
}

