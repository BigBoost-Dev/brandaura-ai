import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../hooks/useStore'

// Logo Icon Component
function LogoIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="authLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="authLogoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#authLogoGradient)" strokeWidth="2" opacity="0.2"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#authLogoGradient)" strokeWidth="2.5" opacity="0.35"/>
      <g filter="url(#authLogoGlow)">
        <text x="50" y="67" textAnchor="middle" fontSize="54" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" fill="url(#authLogoGradient)">B</text>
      </g>
    </svg>
  )
}

// Login Page
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      // OAuth redirects, so we don't navigate here
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <LogoIcon size={64} />
        </Link>
        <h2 className="text-3xl font-extrabold mb-2">Welcome Back</h2>
        <p className="text-white/50">Sign in to your BrandAura AI account</p>
      </div>

      {/* Google Sign In */}
      <button 
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full btn btn-secondary mb-6 py-4 flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <Divider />

      {/* Error Message */}
      {(localError || error) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          {localError || error}
        </div>
      )}

      {/* Email Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white/60 text-sm mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-white/60 text-sm mb-2">Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full btn btn-primary py-4 mb-6"
        >
          {loading ? <Spinner /> : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-white/50 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-400 hover:text-primary-300">Sign up</Link>
      </p>
    </AuthLayout>
  )
}

// Signup Page
export function SignupPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuthStore()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    
    try {
      await signUp(email, password, { full_name: name })
      navigate('/dashboard')
    } catch (err) {
      setLocalError(err.message)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <LogoIcon size={64} />
        </Link>
        <h2 className="text-3xl font-extrabold mb-2">Create Account</h2>
        <p className="text-white/50">Start tracking your AI visibility today</p>
      </div>

      {/* Google Sign In */}
      <button 
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full btn btn-secondary mb-6 py-4 flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <Divider />

      {/* Error Message */}
      {(localError || error) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          {localError || error}
        </div>
      )}

      {/* Email Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white/60 text-sm mb-2">Full Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white/60 text-sm mb-2">Email</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-white/60 text-sm mb-2">Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
            minLength={6}
          />
          <p className="text-white/40 text-xs mt-2">Must be at least 6 characters</p>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-4 mb-6"
        >
          {loading ? <Spinner /> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-white/50 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
      </p>

      <p className="text-center text-white/30 text-xs mt-6">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </AuthLayout>
  )
}

// Auth Layout Wrapper
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center p-5">
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-white/50 hover:text-white text-sm flex items-center gap-2 transition"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-md p-10 rounded-[2rem] bg-gradient-to-br from-dark-50 to-dark-100 border border-white/[0.08] shadow-2xl">
        {children}
      </div>
    </div>
  )
}

// Divider Component
function Divider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-white/40 text-sm">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  )
}

// Google Icon
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// Spinner
function Spinner() {
  return <div className="spinner mx-auto" />
}

export default { LoginPage, SignupPage }
