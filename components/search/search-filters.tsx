"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getExpertCategories } from "@/app/actions/search"
import type { SearchFilters as SearchFilterType } from "@/app/actions/search"
import { Filter, X } from "lucide-react"

interface SearchFiltersProps {
  initialFilters?: SearchFilterType
  onFiltersChange: (filters: SearchFilterType) => void
  className?: string
}

export function SearchFilters({ initialFilters, onFiltersChange, className }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<SearchFilterType>(initialFilters || {})
  const [categories, setCategories] = useState<any[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice || 0, filters.maxPrice || 500])
  const [isOpen, setIsOpen] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getExpertCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Update filters when URL params change
  useEffect(() => {
    const newFilters: SearchFilterType = {}

    // Parse categories
    const categoriesParam = searchParams.get("categories")
    if (categoriesParam) {
      newFilters.categories = categoriesParam.split(",")
    }

    // Parse rating
    const minRatingParam = searchParams.get("minRating")
    if (minRatingParam) {
      newFilters.minRating = Number.parseFloat(minRatingParam)
    }

    // Parse price range
    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")
    if (minPriceParam) {
      newFilters.minPrice = Number.parseFloat(minPriceParam)
    }
    if (maxPriceParam) {
      newFilters.maxPrice = Number.parseFloat(maxPriceParam)
    }

    // Parse languages
    const languagesParam = searchParams.get("languages")
    if (languagesParam) {
      newFilters.languages = languagesParam.split(",")
    }

    // Parse availability
    const availabilityParam = searchParams.get("availability")
    if (availabilityParam) {
      newFilters.availability = availabilityParam.split(",")
    }

    // Parse experience level
    const experienceLevelParam = searchParams.get("experienceLevel")
    if (experienceLevelParam) {
      newFilters.experienceLevel = experienceLevelParam.split(",")
    }

    // Parse location
    const locationParam = searchParams.get("location")
    if (locationParam) {
      newFilters.location = locationParam
    }

    // Parse sort
    const sortByParam = searchParams.get("sortBy")
    if (sortByParam) {
      newFilters.sortBy = sortByParam as SearchFilterType["sortBy"]
    }

    setFilters(newFilters)

    // Update price range slider
    if (minPriceParam || maxPriceParam) {
      setPriceRange([
        minPriceParam ? Number.parseFloat(minPriceParam) : 0,
        maxPriceParam ? Number.parseFloat(maxPriceParam) : 500,
      ])
    }
  }, [searchParams])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFilterType>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Handle category selection
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.categories || []
    let newCategories: string[] = []

    if (checked) {
      newCategories = [...currentCategories, categoryId]
    } else {
      newCategories = currentCategories.filter((id) => id !== categoryId)
    }

    handleFilterChange({ categories: newCategories })
  }

  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
    handleFilterChange({
      minPrice: value[0],
      maxPrice: value[1],
    })
  }

  // Handle rating change
  const handleRatingChange = (value: string) => {
    handleFilterChange({ minRating: Number.parseInt(value) })
  }

  // Handle language selection
  const handleLanguageChange = (language: string, checked: boolean) => {
    const currentLanguages = filters.languages || []
    let newLanguages: string[] = []

    if (checked) {
      newLanguages = [...currentLanguages, language]
    } else {
      newLanguages = currentLanguages.filter((lang) => lang !== language)
    }

    handleFilterChange({ languages: newLanguages })
  }

  // Handle availability selection
  const handleAvailabilityChange = (day: string, checked: boolean) => {
    const currentAvailability = filters.availability || []
    let newAvailability: string[] = []

    if (checked) {
      newAvailability = [...currentAvailability, day]
    } else {
      newAvailability = currentAvailability.filter((d) => d !== day)
    }

    handleFilterChange({ availability: newAvailability })
  }

  // Handle experience level selection
  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    const currentLevels = filters.experienceLevel || []
    let newLevels: string[] = []

    if (checked) {
      newLevels = [...currentLevels, level]
    } else {
      newLevels = currentLevels.filter((l) => l !== level)
    }

    handleFilterChange({ experienceLevel: newLevels })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    handleFilterChange({ sortBy: value as SearchFilterType["sortBy"] })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({})
    setPriceRange([0, 500])
    onFiltersChange({})
  }

  // Count active filters
  const countActiveFilters = () => {
    let count = 0
    if (filters.categories && filters.categories.length > 0) count++
    if (filters.minRating) count++
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++
    if (filters.languages && filters.languages.length > 0) count++
    if (filters.availability && filters.availability.length > 0) count++
    if (filters.experienceLevel && filters.experienceLevel.length > 0) count++
    if (filters.location) count++
    return count
  }

  const activeFilterCount = countActiveFilters()

  // Mobile filter toggle
  const toggleFilters = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <Button onClick={toggleFilters} variant="outline" className="w-full flex items-center justify-between">
          <span className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </span>
          {isOpen ? <X className="h-4 w-4" /> : null}
        </Button>
      </div>

      {/* Filter sidebar */}
      <Card className={`${className} ${isOpen ? "block" : "hidden md:block"}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categories */}
          <div>
            <Accordion type="single" collapsible defaultValue="categories">
              <AccordionItem value="categories">
                <AccordionTrigger>Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={(filters.categories || []).includes(category.id)}
                            onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="font-medium">
                            {category.name}
                          </Label>
                        </div>
                        {category.children && category.children.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {category.children.map((child: any) => (
                              <div key={child.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${child.id}`}
                                  checked={(filters.categories || []).includes(child.id)}
                                  onCheckedChange={(checked) => handleCategoryChange(child.id, checked as boolean)}
                                />
                                <Label htmlFor={`category-${child.id}`}>{child.name}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <Accordion type="single" collapsible defaultValue="price">
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="pt-4">
                      <Slider value={priceRange} min={0} max={500} step={10} onValueChange={handlePriceChange} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="border rounded-md px-2 py-1">${priceRange[0]}</div>
                      <div className="border rounded-md px-2 py-1">${priceRange[1]}</div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Rating */}
          <div>
            <Accordion type="single" collapsible defaultValue="rating">
              <AccordionItem value="rating">
                <AccordionTrigger>Minimum Rating</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup value={filters.minRating?.toString() || ""} onValueChange={handleRatingChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="r4" />
                      <Label htmlFor="r4">4+ Stars</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="r3" />
                      <Label htmlFor="r3">3+ Stars</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="r2" />
                      <Label htmlFor="r2">2+ Stars</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="r0" />
                      <Label htmlFor="r0">Any Rating</Label>
                    </div>
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Languages */}
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="languages">
                <AccordionTrigger>Languages</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic"].map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${language}`}
                          checked={(filters.languages || []).includes(language)}
                          onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
                        />
                        <Label htmlFor={`lang-${language}`}>{language}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Availability */}
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="availability">
                <AccordionTrigger>Availability</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {[
                      { value: "0", label: "Sunday" },
                      { value: "1", label: "Monday" },
                      { value: "2", label: "Tuesday" },
                      { value: "3", label: "Wednesday" },
                      { value: "4", label: "Thursday" },
                      { value: "5", label: "Friday" },
                      { value: "6", label: "Saturday" },
                    ].map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={(filters.availability || []).includes(day.value)}
                          onCheckedChange={(checked) => handleAvailabilityChange(day.value, checked as boolean)}
                        />
                        <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Experience Level */}
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="experience">
                <AccordionTrigger>Experience Level</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {["Beginner", "Intermediate", "Expert"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exp-${level}`}
                          checked={(filters.experienceLevel || []).includes(level)}
                          onCheckedChange={(checked) => handleExperienceLevelChange(level, checked as boolean)}
                        />
                        <Label htmlFor={`exp-${level}`}>{level}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Sort By */}
          <div>
            <Accordion type="single" collapsible defaultValue="sort">
              <AccordionItem value="sort">
                <AccordionTrigger>Sort By</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup value={filters.sortBy || "relevance"} onValueChange={handleSortChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="relevance" id="s1" />
                      <Label htmlFor="s1">Relevance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rating" id="s2" />
                      <Label htmlFor="s2">Highest Rated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price_low" id="s3" />
                      <Label htmlFor="s3">Price: Low to High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price_high" id="s4" />
                      <Label htmlFor="s4">Price: High to Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="availability" id="s5" />
                      <Label htmlFor="s5">Most Available</Label>
                    </div>
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

