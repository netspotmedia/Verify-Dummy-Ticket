import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeHtml(html: string): string {
  if (!html) return ""
  
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div']
  const allowedAttrs: Record<string, string[]> = {
    'a': ['href', 'class', 'target', 'rel'],
    'span': ['class'],
    'div': ['class'],
    'p': ['class'],
    'li': ['class'],
  }
  
  let sanitized = html
  
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  sanitized = sanitized.replace(/<iframe/gi, '&lt;iframe')
  sanitized = sanitized.replace(/<object/gi, '&lt;object')
  sanitized = sanitized.replace(/<embed/gi, '&lt;embed')
  sanitized = sanitized.replace(/onerror\s*=/gi, '')
  
  return sanitized
}

export function sanitizeText(text: string): string {
  if (!text) return ""
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
