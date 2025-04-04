"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FormField {
  id: string
  label: string
  type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "radio"
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  description?: string
  error?: string
}

interface AccessibleFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  submitLabel: string
  className?: string
  resetLabel?: string
  showReset?: boolean
  title?: string
  description?: string
}

export function AccessibleForm({
  fields,
  onSubmit,
  submitLabel,
  className,
  resetLabel = "Reset",
  showReset = false,
  title,
  description,
}: AccessibleFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }))

    // Clear error when field is changed
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const handleBlur = (id: string) => {
    setTouched((prev) => ({ ...prev, [id]: true }))

    // Validate on blur
    validateField(id, formData[id])
  }

  const validateField = (id: string, value: any) => {
    const field = fields.find((f) => f.id === id)
    if (!field) return

    if (field.required && (value === undefined || value === "" || value === false)) {
      setErrors((prev) => ({ ...prev, [id]: `${field.label} is required` }))
      return false
    }

    if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      setErrors((prev) => ({ ...prev, [id]: "Please enter a valid email address" }))
      return false
    }

    return true
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach((field) => {
      const value = formData[field.id]
      if (field.required && (value === undefined || value === "" || value === false)) {
        newErrors[field.id] = `${field.label} is required`
        isValid = false
      }

      if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field.id] = "Please enter a valid email address"
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleReset = () => {
    setFormData({})
    setErrors({})
    setTouched({})
  }

  const renderField = (field: FormField) => {
    const { id, label, type, placeholder, required, options, description } = field
    const value = formData[id] || ""
    const error = errors[id]
    const isTouched = touched[id]
    const showError = error && isTouched

    const fieldId = `form-field-${id}`
    const descriptionId = description ? `${fieldId}-description` : undefined
    const errorId = showError ? `${fieldId}-error` : undefined

    const commonProps = {
      id: fieldId,
      name: id,
      "aria-required": required,
      "aria-invalid": showError ? "true" : undefined,
      "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
    }

    switch (type) {
      case "text":
      case "email":
      case "password":
        return (
          <div className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            <input
              type={type}
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              placeholder={placeholder}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                showError ? "border-destructive" : "border-input",
              )}
              {...commonProps}
            />
            {showError && (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            <textarea
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              placeholder={placeholder}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                showError ? "border-destructive" : "border-input",
              )}
              rows={4}
              {...commonProps}
            />
            {showError && (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            <select
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                showError ? "border-destructive" : "border-input",
              )}
              {...commonProps}
            >
              <option value="">Select an option</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showError && (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleChange(id, e.target.checked)}
                onBlur={() => handleBlur(id)}
                className={cn(
                  "h-4 w-4 rounded border focus:outline-none focus:ring-2 focus:ring-primary",
                  showError ? "border-destructive" : "border-input",
                )}
                {...commonProps}
              />
              <label htmlFor={fieldId} className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
              </label>
            </div>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground pl-6">
                {description}
              </p>
            )}
            {showError && (
              <p id={errorId} className="text-sm text-destructive pl-6">
                {error}
              </p>
            )}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </div>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            <div className="space-y-2">
              {options?.map((option) => {
                const optionId = `${fieldId}-${option.value}`
                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={optionId}
                      name={id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => handleChange(id, option.value)}
                      onBlur={() => handleBlur(id)}
                      className={cn(
                        "h-4 w-4 border focus:outline-none focus:ring-2 focus:ring-primary",
                        showError ? "border-destructive" : "border-input",
                      )}
                      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
                    />
                    <label htmlFor={optionId} className="text-sm">
                      {option.label}
                    </label>
                  </div>
                )
              })}
            </div>
            {showError && (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)} noValidate>
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>{renderField(field)}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        {showReset && (
          <Button type="button" variant="outline" onClick={handleReset}>
            {resetLabel}
          </Button>
        )}
      </div>
    </form>
  )
}

