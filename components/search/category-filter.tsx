"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Category {
  id: string
  name: string
}

interface CategoryFilterProps {
  categories: Category[]
  onChange: (categoryIds: string[]) => void
  defaultSelected?: string[]
}

export function CategoryFilter({ categories, onChange, defaultSelected = [] }: CategoryFilterProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultSelected)

  useEffect(() => {
    setSelectedCategories(defaultSelected)
  }, [defaultSelected])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId)

    setSelectedCategories(newSelected)
    onChange(newSelected)
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Categories</Label>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
            />
            <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
              {category.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

