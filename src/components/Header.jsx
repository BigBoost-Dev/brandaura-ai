import React from 'react'
import { useAuthStore } from '../hooks/useStore'

// Minimal icons
const Icons = {
  play: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  stop: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

export default function Header({ 
  brand, 
  onSetupTracking, 
  onRunTracking, 
  onStopTracking,
  isRunning,
  progress,
  hasTrackingConfig
}) {
  const { user, signOut } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  return (
    <header className="h-14 border-b border-white/[0.04] bg-[#09090b] flex items-center justify-between px-6">
      {/* Left side - Page context */}
      <div className="flex items-center gap-4">
        {brand && (
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-white/80">{brand.name}</span>
            {brand.website && (
              <span className="text-[12px] text-white/30">{brand.website}</span>
            )}
          </div>
        )}
      </div>

      {/* Center - Progress */}
      {isRunning && progress && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress.percentage || 0}%` }}
            />
          </div>
          <span className="text-[12px] text-white/40 tabular-nums">
            {progress.current}/{progress.total}
          </span>
        </div>
      )}

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Tracking button */}
        {brand && (
          <>
            {isRunning ? (
              <button
                onClick={onStopTracking}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                {Icons.stop}
                <span>Stop</span>
              </button>
            ) : hasTrackingConfig ? (
              <button
                onClick={onRunTracking}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
              >
                {Icons.play}
                <span>Run tracking</span>
              </button>
            ) : (
              <button
                onClick={onSetupTracking}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-white/60 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors"
              >
                {Icons.settings}
                <span>Setup tracking</span>
              </button>
            )}
          </>
        )}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[12px] font-medium text-white/60 hover:bg-white/[0.1] transition-colors"
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-[#0c0c0e] border border-white/[0.06] rounded-xl shadow-xl z-50">
                <div className="px-3 py-2 border-b border-white/[0.04]">
                  <div className="text-[13px] text-white/70 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={() => { signOut(); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {Icons.logout}
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
