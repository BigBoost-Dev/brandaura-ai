import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AI_PLATFORMS } from '../lib/constants'

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

  return (
    <div ref={dropdownRef} className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-full md:mt-2 md:w-80 bg-dark-300 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-white">Select AI Platforms</h3>
          <div className="flex gap-2">
            <button onClick={() => setSelectedPlatforms(Object.keys(AI_PLATFORMS))} className="text-xs text-primary-400">All</button>
            <span className="text-white/20">|</span>
            <button onClick={() => setSelectedPlatforms([Object.keys(AI_PLATFORMS)[0]])} className="text-xs text-white/50">Min</button>
          </div>
        </div>
        <p className="text-white/40 text-xs">Choose models for this test run</p>
      </div>
      
      <div className="p-2 max-h-72 overflow-y-auto">
        {Object.entries(AI_PLATFORMS).map(([id, platform]) => (
          <button
            key={id}
            onClick={() => togglePlatform(id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
              selectedPlatforms.includes(id) ? 'bg-primary-500/20 border border-primary-500/40' : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>
              {platform.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">{platform.name}</div>
              <div className="text-white/40 text-xs">{platform.model}</div>
            </div>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedPlatforms.includes(id) ? 'bg-primary-500 border-primary-500' : 'border-white/20'}`}>
              {selectedPlatforms.includes(id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-3 border-t border-white/10 bg-white/[0.02] text-center text-white/40 text-xs">
        {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  )
}

export default function Header({ 
  user, profile, brands, activeBrandId, onBrandChange, onAddBrand, onSignOut,
  isRunning, progress, onRunTests, onStopTests,
  showPlatformSelector, setShowPlatformSelector, selectedPlatforms, setSelectedPlatforms,
  onToggleSidebar
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

          <Link to="/" className="flex items-center">
            <LogoIcon size={36} />
          </Link>

          {/* Brand Switcher - visible on md and up */}
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
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-400 text-sm font-bold">{progress.current}/{progress.total}</span>
            </div>
          )}

          {!isRunning && (
            <div className="relative">
              <button
                onClick={() => setShowPlatformSelector(!showPlatformSelector)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/20 text-white hover:bg-white/10 transition text-sm font-semibold"
              >
                <span className="text-lg">🤖</span>
                <span>{selectedPlatforms?.length || 0} Models</span>
                <svg className={`w-4 h-4 transition-transform ${showPlatformSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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

          {isRunning ? (
            <button onClick={onStopTests} className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition">
              ⏹ Stop
            </button>
          ) : (
            <button onClick={onRunTests} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white text-sm font-bold shadow-lg shadow-primary-500/30 transition">
              ▶ Run Tests
            </button>
          )}

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)}>
              <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="" className="w-8 h-8 rounded-lg" />
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
    </header>
  )
}