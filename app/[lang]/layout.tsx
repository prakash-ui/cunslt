import type { ReactNode } from "react"
import { getDictionary } from "@/i18n/dictionaries"
import { LanguageProvider } from "@/i18n/language-provider"
import { CurrencyProvider } from "@/context/currency-provider"
import { TimezoneProvider } from "@/context/timezone-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { type Locale, getLocaleDirection } from "@/i18n/config"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"





export async function generateMetadata({ params }: { params: { lang: string } }) {
  // const locale = params.lang as Locale
  const { locale }:any = await params 
  const dictionary = await getDictionary(locale)

  return {
    title: {
      default: dictionary.common.appName,
      template: `%s | ${dictionary.common.appName}`,
    },
    description: dictionary.common.tagline,
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { lang: string }
}) {
  // const locale = params.lang as Locale
  const { locale }:any = await params
  const dictionary = await getDictionary(locale)
  const dir = getLocaleDirection(locale)

  return (
    <div lang={locale} dir={dir}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageProvider dictionary={dictionary} locale={locale}>
          <CurrencyProvider>
            <TimezoneProvider>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </TimezoneProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </div>
  )
}