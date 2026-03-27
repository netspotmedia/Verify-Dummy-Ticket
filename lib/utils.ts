import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

export function sanitizeHtml(html: string): string {
  if (!html) return ""
  
  let sanitized = String(html)
  
  const dangerousPatterns = [
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, replacement: '' },
    { pattern: /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, replacement: '' },
    { pattern: /javascript:/gi, replacement: '' },
    { pattern: /data:/gi, replacement: '' },
    { pattern: /vbscript:/gi, replacement: '' },
    { pattern: /\son\w+\s*=/gi, replacement: ' ' },
    { pattern: /<iframe/gi, replacement: '&lt;iframe' },
    { pattern: /<object/gi, replacement: '&lt;object' },
    { pattern: /<embed/gi, replacement: '&lt;embed' },
    { pattern: /<applet/gi, replacement: '&lt;applet' },
    { pattern: /<form/gi, replacement: '&lt;form' },
    { pattern: /<input/gi, replacement: '&lt;input' },
    { pattern: /<button/gi, replacement: '&lt;button' },
    { pattern: /<select/gi, replacement: '&lt;select' },
    { pattern: /<textarea/gi, replacement: '&lt;textarea' },
    { pattern: /<svg/gi, replacement: '&lt;svg' },
    { pattern: /<math/gi, replacement: '&lt;math' },
    { pattern: /onerror\s*=/gi, replacement: '' },
    { pattern: /onload\s*=/gi, replacement: '' },
    { pattern: /onclick\s*=/gi, replacement: '' },
    { pattern: /onmouseover\s*=/gi, replacement: '' },
    { pattern: /onfocus\s*=/gi, replacement: '' },
    { pattern: /onblur\s*=/gi, replacement: '' },
    { pattern: /onchange\s*=/gi, replacement: '' },
    { pattern: /onsubmit\s*=/gi, replacement: '' },
  ]
  
  for (const { pattern, replacement } of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, replacement)
  }
  
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*vbscript:/gi, 'href="')
  
  return sanitized
}

export function sanitizeText(text: string): string {
  if (!text) return ""
  return escapeHtml(text)
}
