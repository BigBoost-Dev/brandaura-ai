import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AI_PLATFORMS } from '../lib/constants'

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

// Platform Selector Dropdown
function PlatformSelector({ selectedPlatforms, setSelectedPlatforms, onClose }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId))
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    }
  }

  const selectAll = () => setSelectedPlatforms(Object.keys(AI_PLATFORMS))
  const selectNone = () => setSelectedPlatforms([Object.keys(AI_PLATFORMS)[0]])

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-dark-300 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-white text-sm sm:text-base">Select AI Platforms</h3>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-primary-400 hover:text-primary-300">All</button>
            <span className="text-white/20">|</span>
            <button onClick={selectNone} className="text-xs text-white/50 hover:text-white/70">Min</button>
          </div>
        </div>
        <p className="text-white/40 text-xs">Choose models for this test run</p>
      </div>
      
      <div className="p-2 max-h-64 overflow-y-auto">
        {Object.entries(AI_PLATFORMS).map(([id, platform]) => (
          <button
            key={id}
            onClick={() => togglePlatform(id)}
            className={`w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition ${
              selectedPlatforms.includes(id)
                ? 'bg-primary-500/20 border border-primary-500/40'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl"
              style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
            >
              {platform.icon}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-xs sm:text-sm truncate">{platform.name}</div>
              <div className="text-white/40 text-xs truncate">{platform.model}</div>
            </div>
            <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${
              selectedPlatforms.includes(id) ? 'bg-primary-500 border-primary-500' : 'border-white/20'
            }`}>
              {selectedPlatforms.includes(id) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-3 border-t border-white/10 bg-white/[0.02]">
        <div className="text-center text-white/40 text-xs">
          {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
        </div>
      </div>
    </div>
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
  onStopTests,
  showPlatformSelector,
  setShowPlatformSelector,
  selectedPlatforms,
  setSelectedPlatforms,
  onToggleSidebar
}) {
  const [showBrandMenu, setShowBrandMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const brandMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (brandMenuRef.current && !brandMenuRef.current.contains(event.target)) {
        setShowBrandMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeBrand = brands.find(b => b.id === activeBrandId)

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-dark-400/95 backdrop-blur-xl">
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        {/* Left: Menu Button + Logo + Brand */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <LogoIcon size={32} />
            <span className="text-base sm:text-lg font-bold hidden sm:block">
              BrandAura<span className="text-primary-400 ml-1">AI</span>
            </span>
          </Link>

          {/* Brand Switcher - Desktop */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10">
            {brands.slice(0, 3).map(brand => (
              <button
                key={brand.id}
                onClick={() => onBrandChange(brand.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeBrandId === brand.id
                    ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {brand.name}
              </button>
            ))}
            {brands.length > 3 && (
              <span className="text-white/40 text-sm">+{brands.length - 3}</span>
            )}
            <button
              onClick={onAddBrand}
              className="px-2 py-1.5 rounded-lg border border-dashed border-white/20 text-white/50 text-sm hover:border-white/30"
            >
              +
            </button>
          </div>

          {/* Brand Switcher - Mobile Dropdown */}
          <div className="lg:hidden relative" ref={brandMenuRef}>
            <button
              onClick={() => setShowBrandMenu(!showBrandMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm font-medium"
            >
              <span className="truncate max-w-[100px]">{activeBrand?.name || 'Select'}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBrandMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-dark-300 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => { onBrandChange(brand.id); setShowBrandMenu(false) }}
                    className={`w-full px-4 py-3 text-left text-sm transition ${
                      activeBrandId === brand.id ? 'bg-primary-500/20 text-white' : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
                <button
                  onClick={() => { onAddBrand(); setShowBrandMenu(false) }}
                  className="w-full px-4 py-3 text-left text-sm text-primary-400 hover:bg-white/5 border-t border-white/10"
                >
                  + Add Brand
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Test Progress */}
          {isRunning && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/30">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-400 text-sm font-semibold">
                {progress.current}/{progress.total}
              </span>
            </div>
          )}

          {/* Mobile Progress */}
          {isRunning && (
            <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-400 text-xs font-semibold">
                {progress.current}/{progress.total}
              </span>
            </div>
          )}

          {/* Platform Selector */}
          {!isRunning && (
            <div className="relative">
              <button
                onClick={() => setShowPlatformSelector(!showPlatformSelector)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 hover:text-white text-sm"
              >
                <span>{selectedPlatforms?.length || 0} Models</span>
                <svg className={`w-4 h-4 transition-transform ${showPlatformSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Mobile: Just icon */}
              <button
                onClick={() => setShowPlatformSelector(!showPlatformSelector)}
                className="sm:hidden p-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/70"
              >
                <span className="text-sm">🤖</span>
              </button>
              
              {showPlatformSelector && (
                <PlatformSelector 
                  selectedPlatforms={selectedPlatforms || []}
                  setSelectedPlatforms={setSelectedPlatforms}
                  onClose={() => setShowPlatformSelector(false)}
                />
              )}
            </div>
          )}

          {/* Run/Stop Button */}
          {isRunning ? (
            <button
              onClick={onStopTests}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-semibold"
            >
              <span className="hidden sm:inline">⏹ Stop</span>
              <span className="sm:hidden">⏹</span>
            </button>
          ) : (
            <button
              onClick={onRunTests}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold"
            >
              <span className="hidden sm:inline">▶ Run Tests</span>
              <span className="sm:hidden">▶ Run</span>
            </button>
          )}

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                alt="" 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl"
              />
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-dark-300 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="font-medium text-sm truncate">{profile?.full_name || user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-white/40 capitalize">{profile?.plan || 'Free'} Plan</div>
                </div>
                <button
                  onClick={() => { onSignOut(); setShowUserMenu(false) }}
                  className="w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}