"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AccessibleDialogProps {
  trigger?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  showCloseButton?: boolean
  closeOnEscape?: boolean
  closeOnOutsideClick?: boolean
}

export function AccessibleDialog({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  className,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: AccessibleDialogProps) {
  const initialFocusRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (open && initialFocusRef.current) {
      initialFocusRef.current.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn("sm:max-w-[425px]", className)}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
        onPointerDownOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {showCloseButton && (
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  )
}

