import { pinyin } from 'pinyin-pro'

interface SecurityCheckResult {
  isSafe: boolean
  errors: string[]
}

export function checkToolSecurity(code: string): SecurityCheckResult {
  const errors: string[] = []

  // Check for dangerous patterns
  const dangerousPatterns = [
    {
      pattern: /<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/gi,
      message: 'External script loading is not allowed'
    },
    {
      pattern: /eval\s*\(/gi,
      message: 'eval() function is not allowed'
    },
    {
      pattern: /Function\s*\(/gi,
      message: 'Function constructor is not allowed'
    },
    {
      pattern: /<iframe[^>]*src\s*=\s*["'][^"']*["'][^>]*>/gi,
      message: 'External iframe loading is not allowed'
    },
    {
      pattern: /document\.write/gi,
      message: 'document.write() is not recommended'
    },
    {
      pattern: /XMLHttpRequest|fetch\s*\(/gi,
      message: 'External API calls should be carefully reviewed'
    }
  ]

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(message)
    }
  }

  return {
    isSafe: errors.length === 0,
    errors
  }
}

export function generateSlug(name: string): string {
  // Check if name contains Chinese characters
  const hasChinese = /[\u4e00-\u9fa5]/.test(name)

  let processedName: string

  if (hasChinese) {
    // Convert Chinese characters to pinyin
    processedName = pinyin(name, {
      toneType: 'none',
      separator: ' '
    })
  } else {
    // For non-Chinese text, use as-is
    processedName = name
  }

  // Generate slug: lowercase, replace spaces/special chars with hyphens
  return processedName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with single hyphen
    .replace(/[^a-z0-9-]+/g, '-')  // Replace other non-alphanumeric with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
}
