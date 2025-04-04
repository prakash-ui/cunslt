"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Skill {
  id: string
  name: string
  category_id: string
}

interface SkillsFilterProps {
  skills: Skill[]
  onChange: (skillIds: string[]) => void
  defaultSelected?: string[]
  selectedCategories?: string[]
}

export function SkillsFilter({ skills, onChange, defaultSelected = [], selectedCategories = [] }: SkillsFilterProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultSelected)

  useEffect(() => {
    setSelectedSkills(defaultSelected)
  }, [defaultSelected])

  const handleSkillChange = (skillId: string, checked: boolean) => {
    const newSelected = checked ? [...selectedSkills, skillId] : selectedSkills.filter((id) => id !== skillId)

    setSelectedSkills(newSelected)
    onChange(newSelected)
  }

  // Filter skills by selected categories if any
  const filteredSkills =
    selectedCategories.length > 0 ? skills.filter((skill) => selectedCategories.includes(skill.category_id)) : skills

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Skills</Label>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="flex items-center space-x-2">
            <Checkbox
              id={`skill-${skill.id}`}
              checked={selectedSkills.includes(skill.id)}
              onCheckedChange={(checked) => handleSkillChange(skill.id, checked as boolean)}
            />
            <Label htmlFor={`skill-${skill.id}`} className="text-sm font-normal cursor-pointer">
              {skill.name}
            </Label>
          </div>
        ))}
        {filteredSkills.length === 0 && (
          <p className="text-sm text-gray-500">
            {selectedCategories.length > 0 ? "Select a category to see related skills" : "No skills available"}
          </p>
        )}
      </div>
    </div>
  )
}

