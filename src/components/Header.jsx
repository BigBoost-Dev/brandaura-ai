import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

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
  user, profile, brands, activeBrandId, onBrandChange, onAddBrand, onSignOut,
  onToggleSidebar, onOpenTopicWizard,
  // Tracking props
  isTracking, trackingProgress, onRunTracking, onStopTracking, hasTrackingConfig
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const progressPercent = trackingProgress?.total > 0 
    ? Math.round((trackingProgress.current / trackingProgress.total) * 100) 
    : 0

  return (
    <header className="sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-dark-400/95 backdrop-blur-xl">
      <div className="flex justify-between items-center">
        {/* Left */}
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <LogoIcon size={36} />
            <span className="text-lg font-bold hidden md:block">BrandAura<span className="text-primary-400 ml-1">AI</span></span>
          </Link>

          {/* Brand Switcher */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => onBrandChange(brand.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                  activeBrandId === brand.id
                    ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {brand.name}
              </button>
            ))}
            <button onClick={onAddBrand} className="px-2 py-1.5 rounded-xl border border-dashed border-white/20 text-white/50 text-sm hover:border-white/30">+</button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Track Topics Button - shown when no config */}
          {!hasTrackingConfig && onOpenTopicWizard && (
            <button 
              onClick={onOpenTopicWizard} 
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Setup Tracking</span>
            </button>
          )}

          {/* Run/Stop Tracking Button - shown when config exists */}
          {hasTrackingConfig && (
            <>
              {isTracking ? (
                <div className="flex items-center gap-3">
                  {/* Progress indicator */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{progressPercent}%</span>
                  </div>
                  
                  {/* Stop button */}
                  <button 
                    onClick={onStopTracking}
                    className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Edit config button */}
                  <button 
                    onClick={onOpenTopicWizard}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
                    title="Edit tracking configuration"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  {/* Run button */}
                  <button 
                    onClick={onRunTracking}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-semibold hover:from-primary-600 hover:to-purple-600 transition flex items-center gap-2 shadow-lg shadow-primary-500/20"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="hidden sm:inline">Run Tracking</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)}>
              <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="" className="w-9 h-9 rounded-xl border border-white/10" />
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-dark-300 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="font-medium text-sm truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-white/40">{profile?.plan || 'Free'} Plan</div>
                </div>
                <button onClick={() => { onSignOut(); setShowUserMenu(false) }} className="w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for mobile */}
      {isTracking && (
        <div className="sm:hidden mt-2">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span>{trackingProgress?.current}/{trackingProgress?.total}</span>
          </div>
          <div className="text-xs text-white/40 mt-1 truncate">
            {trackingProgress?.engine}: {trackingProgress?.prompt}
          </div>
        </div>
      )}
    </header>
  )
}
