import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useStore'
import { BorderBeam } from '../components/magicui/border-beam'

function Logo({ size = 32 }) {
  return (
    <div 
      className="rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20"
      style={{ width: size, height: size }}
    >
      <span className="text-black font-semibold" style={{ fontSize: size * 0.5 }}>B</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function ShinyButton({ children, type = "button", disabled }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="relative inline-flex items-center justify-center w-full py-3 rounded-xl font-semibold text-[14px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl" />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  )
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message || 'Failed to sign in')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message || 'Failed to sign in with Google')
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3">
          <Logo size={28} />
          <span className="font-semibold text-[15px] tracking-tight text-white">BrandAura</span>
        </Link>
        <Link to="/signup" className="text-[14px] text-white/50 hover:text-white transition-colors">
          Create account
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 overflow-hidden">
            <BorderBeam size={200} duration={10} colorFrom="#f59e0b" colorTo="#ea580c" />
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-serif tracking-tight text-white mb-1">Welcome back</h1>
                <p className="text-[13px] text-white/40">Sign in to your account</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-[13px] font-medium hover:bg-white/[0.06] transition-all mb-5"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-white/30">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] text-red-400 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 text-[13px] focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 text-[13px] focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="pt-1">
                  <ShinyButton type="submit" disabled={loading}>
                    {loading ? (
                      <React.Fragment>
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Signing in...
                      </React.Fragment>
                    ) : (
                      'Sign in'
                    )}
                  </ShinyButton>
                </div>
              </form>

              <p className="text-center text-[12px] text-white/40 mt-5">
                Don't have an account?{' '}
                <Link to="/signup" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp, signInWithGoogle } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, { full_name: name })
    if (error) {
      setError(error.message || 'Failed to create account')
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message || 'Failed to sign in with Google')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
        
        <header className="relative z-10 p-6">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size={28} />
            <span className="font-semibold text-[15px] tracking-tight text-white">BrandAura</span>
          </Link>
        </header>

        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 text-center overflow-hidden">
              <BorderBeam size={200} duration={10} colorFrom="#f59e0b" colorTo="#ea580c" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h1 className="text-xl font-serif tracking-tight text-white mb-2">Check your email</h1>
                <p className="text-[13px] text-white/50 mb-6">
                  We sent a confirmation link to <span className="text-white">{email}</span>
                </p>
                <Link to="/login" className="text-[13px] text-amber-400 hover:text-amber-300 transition-colors">
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-3">
          <Logo size={28} />
          <span className="font-semibold text-[15px] tracking-tight text-white">BrandAura</span>
        </Link>
        <Link to="/login" className="text-[14px] text-white/50 hover:text-white transition-colors">
          Sign In
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 overflow-hidden">
            <BorderBeam size={200} duration={10} colorFrom="#f59e0b" colorTo="#ea580c" />
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-serif tracking-tight text-white mb-1">Create Account</h1>
                <p className="text-[13px] text-white/40">Start tracking your AI visibility</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-[13px] font-medium hover:bg-white/[0.06] transition-all mb-5"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-white/30">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] text-red-400 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 text-[13px] focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 text-[13px] focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 text-[13px] focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-[10px] text-white/30 mt-1">Must be at least 6 characters</p>
                </div>

                <div className="pt-1">
                  <ShinyButton type="submit" disabled={loading}>
                    {loading ? (
                      <React.Fragment>
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Creating account...
                      </React.Fragment>
                    ) : (
                      'Create Account'
                    )}
                  </ShinyButton>
                </div>
              </form>

              <p className="text-center text-[12px] text-white/40 mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Sign in
                </Link>
              </p>

              <p className="text-center text-[10px] text-white/25 mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="text-white/40 hover:text-white/60 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-white/40 hover:text-white/60 transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
