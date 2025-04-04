import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/i18n-config"

interface PageProps {
  params: { lang: Locale }
}

export default async function Home(props: PageProps) {
  const { params } =  props
  const { lang } =await params

  const dict = await getDictionary(lang)
  const supabase = createClient()

  const { data: featuredExperts } = await supabase
    .from("experts")
    .select(`
      id,
      profiles:profile_id (
        full_name,
        avatar_url
      ),
      title,
      hourly_rate,
      rating,
      total_reviews,
      expert_categories (
        category
      )
    `)
    .eq("featured", true)
    .limit(3)
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  {dict.home.hero.Badge}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  {dict.home.hero.title}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">{dict.home.hero.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 min-[400px]:gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={`/${lang}/experts`}>{dict.home.hero.findExpert}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href={`/${lang}/register?as=expert`}>{dict.home.hero.becomeExpert}</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Check className="mr-1 h-4 w-4 text-primary" />
                  <span>{dict.home.hero.verifiedExperts}</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-1 h-4 w-4 text-primary" />
                  <span>{dict.home.hero.securePayments}</span>
                </div>
                <div className="flex items-center">
                  <Check className="mr-1 h-4 w-4 text-primary" />
                  <span>{dict.home.hero.moneyBack}</span>
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="aspect-video overflow-hidden rounded-xl bg-muted/30 object-cover">
                <img
                  alt="Hero Image"
                  className="w-full h-full object-cover"
                  src="https://cdn.pixabay.com/photo/2019/04/23/04/50/consulting-4148449_1280.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experts */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit mx-auto">
                {"featuredExperts" in dict.home ? dict.home.featuredExperts.badge : ""}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{dict.home.featuredExperts.title}</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">{dict.home.featuredExperts.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {featuredExperts?.map((expert) => (
              <Card key={expert.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        alt="Expert Image"
                        className="w-full h-full object-cover"
                        src="https://media.istockphoto.com/id/2077560078/photo/closeup-lawyer-or-insurance-agent-pointing-at-contract-showing-male-client-where-to-signature.jpg?s=612x612&w=is&k=20&c=kugmgHtE6BiN7Z-32rV0xjvVhZ_5FT7fDKVicd8l5-I="
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6">
                      <div className="flex items-center gap-4">
                      <img
                        alt="Expert Image"
                        className="w-full h-full object-cover"
                        src="https://archerpoint.com/wp-content/uploads/2021/05/Header-Services-Consulting.jpg"
                      />
                        <div>
                          <h3 className="font-semibold text-lg">{expert.profiles.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{expert.title}</p>
                        </div>
                      </div>
                   </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(expert.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">
                      {expert.rating.toFixed(1)} ({expert.total_reviews})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {expert.expert_categories.slice(0, 3).map((category: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category.category}
                      </Badge>
                    ))}
                  </div>
                  <p className="font-medium">${expert.hourly_rate}/hr</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/${lang}/experts/${expert.id}`}>
                      {dict.home.featuredExperts.viewProfile}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline">
              <Link href={`/${lang}/experts`}>{dict.home.featuredExperts.viewAll}</Link>
            </Button>
          </div>
        </div>
      </section>
    
     
    </div>
  )
}

