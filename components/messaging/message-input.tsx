"use client"

import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendMessage, type MessageTemplate } from "@/app/actions/messaging"
import { PaperclipIcon, SendIcon, SmileIcon, SaveIcon, LayoutTemplateIcon as TemplateIcon } from "lucide-react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"

interface MessageInputProps {
  conversationId: string
  userId: string
  templates?: MessageTemplate[]
  onSendMessage: () => void
  onSaveTemplate?: (title: string, content: string) => Promise<void>
}

export function MessageInput({
  conversationId,
  userId,
  templates = [],
  onSendMessage,
  onSaveTemplate,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templateTitle, setTemplateTitle] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!message.trim() && files.length === 0) return

    try {
      setIsSubmitting(true)
      await sendMessage(conversationId, message, userId, files)
      setMessage("")
      setFiles([])
      onSendMessage()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native)
  }

  const handleTemplateSelect = (content: string) => {
    setMessage(content)
  }

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim() || !message.trim()) return

    try {
      await onSaveTemplate?.(templateTitle, message)
      setTemplateTitle("")
      setShowSaveDialog(false)
      toast({
        title: "Success",
        description: "Template saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center bg-muted rounded-md p-2 text-sm">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-1 ml-1"
                onClick={() => removeFile(index)}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[80px] flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />

        <div className="flex flex-col gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

          <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <PaperclipIcon className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" size="icon" variant="outline">
                <SmileIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} theme={theme === "dark" ? "dark" : "light"} />
            </PopoverContent>
          </Popover>

          {templates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="icon" variant="outline">
                  <TemplateIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {templates.map((template) => (
                  <DropdownMenuItem key={template.id} onClick={() => handleTemplateSelect(template.content)}>
                    {template.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onSaveTemplate && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button type="button" size="icon" variant="outline">
                  <SaveIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save as Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-title">Template Name</Label>
                    <Input
                      id="template-title"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      placeholder="E.g., Greeting, Follow-up, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message Content</Label>
                    <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">{message}</div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={!templateTitle.trim() || !message.trim()}
                  >
                    Save Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button type="submit" size="icon" disabled={isSubmitting}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}

