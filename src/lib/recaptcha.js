// reCAPTCHA v3 utility
// Invisible reCAPTCHA that runs in background and returns a score

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

let recaptchaReady = false
let recaptchaLoadPromise = null

// Initialize reCAPTCHA
export function initRecaptcha() {
  if (recaptchaLoadPromise) return recaptchaLoadPromise
  
  recaptchaLoadPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    // If no site key, skip reCAPTCHA
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA site key not configured. Skipping reCAPTCHA.')
      resolve(false)
      return
    }

    // Wait for grecaptcha to be ready
    const checkReady = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          recaptchaReady = true
          resolve(true)
        })
      } else {
        setTimeout(checkReady, 100)
      }
    }
    
    checkReady()
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (!recaptchaReady) {
        console.warn('reCAPTCHA failed to load')
        resolve(false)
      }
    }, 5000)
  })

  return recaptchaLoadPromise
}

// Execute reCAPTCHA and get token
export async function executeRecaptcha(action = 'submit') {
  // If no site key configured, return null (skip verification)
  if (!RECAPTCHA_SITE_KEY) {
    return null
  }

  await initRecaptcha()
  
  if (!recaptchaReady || !window.grecaptcha) {
    console.warn('reCAPTCHA not ready')
    return null
  }

  try {
    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
    return token
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error)
    return null
  }
}

// Token verification must happen on a server (e.g. a Supabase edge function that
// reads the reCAPTCHA secret from server-side secrets). Never verify in the browser:
// any VITE_* variable is inlined into the public JS bundle, so a secret placed in
// VITE_RECAPTCHA_SECRET_KEY would be readable by every visitor.

// Check if score is acceptable (0.5+ is generally human)
export function isHuman(score, threshold = 0.5) {
  return score >= threshold
}

export default {
  initRecaptcha,
  executeRecaptcha,
  isHuman
}
