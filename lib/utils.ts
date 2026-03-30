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
  return String(text).replace(/[&<>"'/]/g, (char) => map[char] || char)
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'div', 'a', 'blockquote', 'code', 'pre', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'figure', 'figcaption'
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  'a': new Set(['href', 'title', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'title', 'width', 'height']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
}

const DANGEROUS_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'applet',
  'form', 'input', 'button', 'select', 'textarea', 'option',
  'svg', 'math', 'link', 'meta', 'base', 'noscript', 'frame',
  'frameset', 'bgsound', 'blink', 'marquee', 'xml'
])

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<!--[\s\S]*?-->/g,
  /\bj\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi,
  /\bd\s*a\s*t\s*a\s*:/gi,
  /\bv\s*b\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi,
  /\bo\s*n\s*\w+\s*=/gi,
]

function sanitizeAttributeValue(name: string, value: string): string | null {
  const valueLower = value.toLowerCase().trim()
  
  if (valueLower.startsWith('javascript:') || 
      valueLower.startsWith('data:') || 
      valueLower.startsWith('vbscript:')) {
    return null
  }
  
  if (name === 'href' || name === 'src') {
    if (valueLower.startsWith('http://') || 
        valueLower.startsWith('https://') ||
        valueLower.startsWith('/') ||
        valueLower.startsWith('#')) {
      return value
    }
    return null
  }
  
  if (name === 'class' || name === 'style') {
    return value
  }
  
  if (name === 'id' || name === 'name') {
    if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) {
      return value
    }
    return null
  }
  
  if (name === 'alt' || name === 'title' || name === 'width' || name === 'height') {
    return value
  }
  
  return null
}

function sanitizeAttribute(tagName: string, attrName: string, value: string): string {
  const allowedForTag = ALLOWED_ATTRS[tagName.toLowerCase()]
  if (!allowedForTag || !allowedForTag.has(attrName.toLowerCase())) return ''

  const sanitized = sanitizeAttributeValue(attrName, value)
  if (sanitized === null) return ''

  return `${attrName}="${sanitized.replace(/"/g, '&quot;')}"`
}

function parseAndSanitize(html: string): string {
  const result: string[] = []
  let remaining = html
  
  while (remaining.length > 0) {
    const tagMatch = remaining.match(/^([^<]*)(<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>)(.*)$/)
    
    if (!tagMatch) {
      result.push(escapeHtml(remaining))
      break
    }
    
    const [, before, fullTag, tagName, attrs, selfClosing, after] = tagMatch
    result.push(escapeHtml(before))
    
    const tagLower = tagName.toLowerCase()
    
    if (DANGEROUS_TAGS.has(tagLower)) {
      result.push(escapeHtml(fullTag))
      remaining = after
      continue
    }
    
    if (!ALLOWED_TAGS.has(tagLower)) {
      result.push(escapeHtml(fullTag))
      remaining = after
      continue
    }
    
    const attrParts: string[] = []
    const attrString = attrs.trim()
    
    const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
    let attrMatch
    
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const [, attrName, dblQuoted, sglQuoted, unquoted] = attrMatch
      const value = dblQuoted ?? sglQuoted ?? unquoted ?? ''
      const sanitized = sanitizeAttribute(tagLower, attrName, value)
      if (sanitized) {
        attrParts.push(sanitized)
      }
    }
    
    const attrStr = attrParts.length > 0 ? ' ' + attrParts.join(' ') : ''
    
    if (selfClosing === '/') {
      result.push(`<${tagName}${attrStr} />`)
    } else {
      result.push(`<${tagName}${attrStr}>`)
    }
    
    remaining = after
  }
  
  return result.join('')
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  let sanitized = String(html)
  
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '')
  }
  
  sanitized = parseAndSanitize(sanitized)
  
  return sanitized
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return escapeHtml(text)
}

export function stripAllHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
