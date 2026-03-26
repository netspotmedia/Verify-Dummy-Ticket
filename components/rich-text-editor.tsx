"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bold, Italic, List, ListOrdered, Link, Undo, Redo } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Enter content...",
  className,
  minHeight = "200px"
}: RichTextEditorProps) {
  const [isLinkMode, setIsLinkMode] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const insertFormatting = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = document.querySelector(`[data-rich-editor="${className}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText: string
    let newCursorPos: number

    if (selectedText) {
      newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end)
      newCursorPos = end + prefix.length + suffix.length
    } else {
      newText = value.substring(0, start) + prefix + suffix + value.substring(end)
      newCursorPos = start + prefix.length
    }

    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange, className])

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = document.querySelector(`[data-rich-editor="${className}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    
    let newText: string
    
    if (value.substring(lineStart, lineStart + prefix.length) === prefix) {
      newText = value.substring(0, lineStart) + value.substring(lineStart + prefix.length)
    } else {
      newText = value.substring(0, lineStart) + prefix + value.substring(lineStart)
    }

    onChange(newText)
  }, [value, onChange, className])

  const insertLink = useCallback(() => {
    if (isLinkMode && linkUrl) {
      const textarea = document.querySelector(`[data-rich-editor="${className}"]`) as HTMLTextAreaElement
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end) || "link text"
      
      const linkMarkdown = `[${selectedText}](${linkUrl})`
      const newText = value.substring(0, start) + linkMarkdown + value.substring(end)
      
      onChange(newText)
      setIsLinkMode(false)
      setLinkUrl("")
    } else {
      setIsLinkMode(true)
    }
  }, [isLinkMode, linkUrl, value, onChange, className])

  const handleUndo = useCallback(() => {
    // Simple undo - just track previous value
    const textarea = document.querySelector(`[data-rich-editor="${className}"]`) as HTMLTextAreaElement
    if (textarea) {
      document.execCommand("undo")
    }
  }, [className])

  const handleRedo = useCallback(() => {
    const textarea = document.querySelector(`[data-rich-editor="${className}"]`) as HTMLTextAreaElement
    if (textarea) {
      document.execCommand("redo")
    }
  }, [className])

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-slate-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting("**")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting("*")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("- ")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart("1. ")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-300 mx-1" />
        
        <Button
          type="button"
          variant={isLinkMode ? "default" : "ghost"}
          size="sm"
          onClick={insertLink}
          className={cn("h-8 w-8 p-0", isLinkMode && "bg-primary text-primary-foreground")}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="h-8 w-8 p-0"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          className="h-8 w-8 p-0"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Link Input */}
      {isLinkMode && (
        <div className="flex items-center gap-2 p-2 border-b bg-slate-100">
          <span className="text-sm text-slate-600">Link URL:</span>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 h-8 px-3 text-sm border rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                insertLink()
              }
              if (e.key === "Escape") {
                setIsLinkMode(false)
              }
            }}
            autoFocus
          />
          <Button type="button" size="sm" onClick={insertLink} disabled={!linkUrl}>
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setIsLinkMode(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Editor */}
      <textarea
        data-rich-editor={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full p-4 resize-none focus:outline-none"
        style={{ minHeight }}
      />

      {/* Help Text */}
      <div className="px-4 pb-2 text-xs text-slate-500">
        Tip: Use **text** for bold, *text* for italic, - item for lists, [text](url) for links
      </div>
    </div>
  )
}

// Function to convert markdown-like content to HTML for display
export function renderRichText(content: string): string {
  if (!content) return ""
  
  let html = content
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Links: [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Bullet lists: - item
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1">$&</ul>')
  
  // Numbered lists: 1. item
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol class="list-decimal list-inside space-y-1">$&</ol>')
  
  // Line breaks
  html = html.replace(/\n/g, '<br />')
  
  return html
}
