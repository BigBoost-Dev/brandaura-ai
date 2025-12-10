// Validation and sanitization utilities
// Protects against XSS, SQL injection patterns, and ensures data quality

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

// Sanitize string input - removes dangerous characters and XSS vectors
export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove potential script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Light sanitization - preserve readability but remove dangerous patterns
export function sanitizeLight(input) {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

// Sanitize for database - strips SQL injection patterns
// Note: Supabase uses parameterized queries, this is defense-in-depth
export function sanitizeForDB(input) {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    // Remove SQL comment patterns
    .replace(/--/g, '—')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove common SQL injection patterns
    .replace(/;\s*DROP/gi, '')
    .replace(/;\s*DELETE/gi, '')
    .replace(/;\s*UPDATE/gi, '')
    .replace(/;\s*INSERT/gi, '')
    .replace(/;\s*SELECT/gi, '')
    .replace(/;\s*TRUNCATE/gi, '')
    .replace(/;\s*ALTER/gi, '')
    .replace(/;\s*CREATE/gi, '')
    .replace(/;\s*EXEC/gi, '')
    .replace(/UNION\s+SELECT/gi, '')
    .replace(/UNION\s+ALL\s+SELECT/gi, '')
    .replace(/OR\s+1\s*=\s*1/gi, '')
    .replace(/OR\s+'1'\s*=\s*'1'/gi, '')
    .replace(/OR\s+"1"\s*=\s*"1"/gi, '')
    .replace(/'\s*OR\s+'/gi, '')
    .replace(/"\s*OR\s+"/gi, '')
    .replace(/'\s*;\s*/g, '')
    .replace(/"\s*;\s*/g, '')
    // Remove hex injection attempts
    .replace(/0x[0-9a-fA-F]+/g, '')
    // Remove CHAR() injection
    .replace(/CHAR\s*\(/gi, '')
}

// Combined sanitization for user inputs
export function sanitizeUserInput(input) {
  return sanitizeForDB(sanitizeLight(input))
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Email validation
export function validateEmail(email) {
  const errors = []
  
  if (!email || !email.trim()) {
    errors.push('Email is required')
    return { valid: false, errors, sanitized: '' }
  }

  const sanitized = email.trim().toLowerCase()
  
  // Check length
  if (sanitized.length > 254) {
    errors.push('Email is too long')
  }
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(sanitized)) {
    errors.push('Please enter a valid email address')
  }

  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.includes('.@')) {
    errors.push('Invalid email format')
  }

  // Check for SQL injection in email
  if (/('|"|;|--|\*|\/\*|\*\/)/i.test(email)) {
    errors.push('Email contains invalid characters')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Password validation
export function validatePassword(password, options = {}) {
  const {
    minLength = 6,
    maxLength = 128,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false
  } = options

  const errors = []

  if (!password) {
    errors.push('Password is required')
    return { valid: false, errors, strength: 0 }
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  }

  if (password.length > maxLength) {
    errors.push(`Password must be less than ${maxLength} characters`)
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common weak passwords
  const weakPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master']
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.')
  }

  // Calculate password strength (0-4)
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  strength = Math.min(4, strength)

  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}

// Name validation
export function validateName(name) {
  const errors = []

  if (!name || !name.trim()) {
    errors.push('Name is required')
    return { valid: false, errors, sanitized: '' }
  }

  const sanitized = sanitizeUserInput(name.trim())

  if (sanitized.length < 2) {
    errors.push('Name must be at least 2 characters')
  }

  if (sanitized.length > 100) {
    errors.push('Name is too long (max 100 characters)')
  }

  // Only allow letters, spaces, hyphens, apostrophes, and common international chars
  if (!/^[\p{L}\s\-'\.]+$/u.test(name.trim())) {
    errors.push('Name contains invalid characters')
  }

  // Check for suspicious patterns
  if (/(<|>|script|javascript|onclick|onerror|onload)/i.test(name)) {
    errors.push('Name contains invalid characters')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// URL validation
export function validateURL(url, required = false) {
  const errors = []

  if (!url || !url.trim()) {
    if (required) {
      errors.push('URL is required')
    }
    return { valid: !required, errors, sanitized: '' }
  }

  let sanitized = url.trim()

  // Add https:// if no protocol
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = 'https://' + sanitized
  }

  try {
    const urlObj = new URL(sanitized)
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('Only HTTP and HTTPS URLs are allowed')
    }

    // Check for suspicious patterns
    if (urlObj.hostname.includes('..') || urlObj.hostname.startsWith('-')) {
      errors.push('Invalid URL format')
    }

    // Check for javascript: in URL
    if (/javascript:/i.test(url)) {
      errors.push('Invalid URL')
    }

    // Validate hostname has at least one dot (TLD)
    if (!urlObj.hostname.includes('.')) {
      errors.push('Please enter a valid domain')
    }

  } catch (e) {
    errors.push('Please enter a valid URL')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Brand name validation
export function validateBrandName(name, required = true) {
  const errors = []

  if (!name || !name.trim()) {
    if (required) {
      errors.push('Brand name is required')
    }
    return { valid: !required, errors, sanitized: '' }
  }

  const sanitized = sanitizeUserInput(name.trim())

  if (sanitized.length < 1) {
    errors.push('Brand name is required')
  }

  if (sanitized.length > 100) {
    errors.push('Brand name is too long (max 100 characters)')
  }

  // Check for suspicious patterns
  if (/(<|>|script|javascript)/i.test(name)) {
    errors.push('Brand name contains invalid characters')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Competitor name validation
export function validateCompetitor(name) {
  const errors = []

  if (!name || !name.trim()) {
    return { valid: true, errors, sanitized: '' }
  }

  const sanitized = sanitizeUserInput(name.trim())

  if (sanitized.length > 100) {
    errors.push('Competitor name is too long')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Topic name validation
export function validateTopic(name, required = true) {
  const errors = []

  if (!name || !name.trim()) {
    if (required) {
      errors.push('Topic is required')
    }
    return { valid: !required, errors, sanitized: '' }
  }

  const sanitized = sanitizeUserInput(name.trim())

  if (sanitized.length < 2) {
    errors.push('Topic must be at least 2 characters')
  }

  if (sanitized.length > 200) {
    errors.push('Topic is too long (max 200 characters)')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Prompt/Query validation
export function validatePrompt(prompt, required = true) {
  const errors = []

  if (!prompt || !prompt.trim()) {
    if (required) {
      errors.push('Prompt is required')
    }
    return { valid: !required, errors, sanitized: '' }
  }

  const sanitized = sanitizeUserInput(prompt.trim())

  if (sanitized.length < 5) {
    errors.push('Prompt must be at least 5 characters')
  }

  if (sanitized.length > 1000) {
    errors.push('Prompt is too long (max 1000 characters)')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Generic text validation
export function validateText(text, options = {}) {
  const {
    required = false,
    minLength = 0,
    maxLength = 5000,
    fieldName = 'Field'
  } = options

  const errors = []

  if (!text || !text.trim()) {
    if (required) {
      errors.push(`${fieldName} is required`)
    }
    return { valid: !required, errors, sanitized: '' }
  }

  const sanitized = sanitizeUserInput(text.trim())

  if (sanitized.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters`)
  }

  if (sanitized.length > maxLength) {
    errors.push(`${fieldName} is too long (max ${maxLength} characters)`)
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Number validation
export function validateNumber(value, options = {}) {
  const {
    required = false,
    min,
    max,
    integer = false,
    fieldName = 'Value'
  } = options

  const errors = []

  if (value === undefined || value === null || value === '') {
    if (required) {
      errors.push(`${fieldName} is required`)
    }
    return { valid: !required, errors, sanitized: null }
  }

  const num = Number(value)

  if (isNaN(num)) {
    errors.push(`${fieldName} must be a number`)
    return { valid: false, errors, sanitized: null }
  }

  if (integer && !Number.isInteger(num)) {
    errors.push(`${fieldName} must be a whole number`)
  }

  if (min !== undefined && num < min) {
    errors.push(`${fieldName} must be at least ${min}`)
  }

  if (max !== undefined && num > max) {
    errors.push(`${fieldName} must be at most ${max}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: num
  }
}

// ============================================
// FORM VALIDATION HELPER
// ============================================

// Form validation helper - validates multiple fields at once
export function validateForm(fields) {
  const results = {}
  let isValid = true

  for (const [fieldName, { value, validator, options }] of Object.entries(fields)) {
    const result = validator(value, options)
    results[fieldName] = result
    if (!result.valid) isValid = false
  }

  return {
    valid: isValid,
    fields: results,
    getFirstError: () => {
      for (const field of Object.values(results)) {
        if (field.errors && field.errors.length > 0) {
          return field.errors[0]
        }
      }
      return null
    },
    getAllErrors: () => {
      const allErrors = []
      for (const [name, field] of Object.entries(results)) {
        if (field.errors && field.errors.length > 0) {
          allErrors.push({ field: name, errors: field.errors })
        }
      }
      return allErrors
    }
  }
}

// ============================================
// RATE LIMITING
// ============================================

// Rate limiting helper (client-side)
const rateLimitMap = new Map()

export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(key) || { attempts: 0, resetTime: now + windowMs }

  // Reset if window has passed
  if (now > record.resetTime) {
    record.attempts = 0
    record.resetTime = now + windowMs
  }

  record.attempts++
  rateLimitMap.set(key, record)

  return {
    allowed: record.attempts <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.attempts),
    resetIn: Math.max(0, Math.ceil((record.resetTime - now) / 1000))
  }
}

export function resetRateLimit(key) {
  rateLimitMap.delete(key)
}

// ============================================
// UTILITY EXPORTS
// ============================================

export default {
  sanitizeInput,
  sanitizeLight,
  sanitizeForDB,
  sanitizeUserInput,
  validateEmail,
  validatePassword,
  validateName,
  validateURL,
  validateBrandName,
  validateCompetitor,
  validateTopic,
  validatePrompt,
  validateText,
  validateNumber,
  validateForm,
  checkRateLimit,
  resetRateLimit
}
