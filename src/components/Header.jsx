import React from 'react'
import { Link } from 'react-router-dom'

// Logo Icon Component
function LogoIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="headerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="headerLogoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#headerLogoGradient)" strokeWidth="2" opacity="0.2"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#headerLogoGradient)" strokeWidth="2.5" opacity="0.35"/>
      <g filter="url(#headerLogoGlow)">
        <text x="50" y="67" textAnchor="middle" fontSize="54" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" fill="url(#headerLogoGradient)">B</text>
      </g>
    </svg>
  )
}

export default function Header({ 
  user, 
  profile, 
  brands, 
  activeBrandId, 
  onBrandChange, 
  onAddBrand, 
  onSignOut,
  isRunning,
  progress,
  onRunTests,
  onStopTests
}) {
  return (
    <header className="sticky top-0 z-50 px-6 py-4 border-b border-white/5 bg-dark-400/90 backdrop-blur-xl">
      <div className="flex justify-between items-center">
        {/* Left: Logo + Brand Switcher */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <LogoIcon size={36} />
            <span className="text-lg font-bold hidden sm:block">
              BrandAura<span className="text-primary-400 ml-1">AI</span>
            </span>
          </Link>

          {/* Brand Switcher */}
          <div className="flex items-center gap-2 pl-6 border-l border-white/10">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => onBrandChange(brand.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeBrandId === brand.id
                    ? 'bg-primary-500/20 border-2 border-primary-500/50 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {brand.name}
              </button>
            ))}
            <button
              onClick={onAddBrand}
              className="px-3 py-2 rounded-xl border border-dashed border-white/20 text-white/50 text-sm hover:border-white/30 hover:text-white/70 transition"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Right: Progress + Run Button + User */}
        <div className="flex items-center gap-4">
          {/* Test Progress */}
          {isRunning && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-400 text-sm font-semibold">
                {progress.current}/{progress.total}
              </span>
              <span className="text-white/40 text-xs max-w-40 truncate">
                {progress.platform}
              </span>
            </div>
          )}

          {/* Run/Stop Button */}
          {isRunning ? (
            <button
              onClick={onStopTests}
              className="btn bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              ⏹ Stop
            </button>
          ) : (
            <button
              onClick={onRunTests}
              className="btn btn-primary"
            >
              ▶ Run Tests
            </button>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <img 
              src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="" 
              className="w-9 h-9 rounded-xl"
            />
            <div className="hidden md:block">
              <div className="text-sm font-medium">{profile?.full_name || user?.email?.split('@')[0]}</div>
              <div className="text-xs text-white/40 capitalize">{profile?.plan || 'Free'} Plan</div>
            </div>
            <button
              onClick={onSignOut}
              className="ml-2 px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-xs hover:bg-white/5 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
