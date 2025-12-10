import React, { useState } from 'react'

const Icons = {
  play: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  stop: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  wizard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
}

export default function Header({ 
  user,
  brands = [],
  activeBrand,
  onBrandChange,
  onAddBrand,
  onDeleteBrand,
  onOpenTopicWizard,
  onRunTracking, 
  onStopTracking,
  onSignOut,
  isTracking,
  trackingProgress,
  hasTrackingConfig
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showBrandMenu, setShowBrandMenu] = useState(false)

  return (
    <header className="h-14 border-b border-white/[0.04] bg-[#09090b] flex items-center justify-between px-4 lg:px-6 ml-[52px]">
      {/* Left - Brand Selector */}
      <div className="flex items-center gap-3">
        {brands.length > 0 ? (
          <div className="relative">
            <button
              onClick={() => setShowBrandMenu(!showBrandMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-amber-400">
                  {activeBrand?.name?.charAt(0) || 'B'}
                </span>
              </div>
              <span className="text-[14px] text-white max-w-[150px] truncate">{activeBrand?.name || 'Select Brand'}</span>
              <span className="text-white/30">{Icons.chevronDown}</span>
            </button>

            {showBrandMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBrandMenu(false)} />
                <div className="absolute left-0 top-full mt-2 w-64 py-2 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-xl z-50">
                  <div className="px-3 pb-2 mb-2 border-b border-white/[0.06]">
                    <span className="text-[11px] text-white/30 uppercase tracking-wider">Your Brands</span>
                  </div>
                  {brands.map(brand => (
                    <div 
                      key={brand.id}
                      className={`flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer ${
                        activeBrand?.id === brand.id 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'text-white/70 hover:bg-white/[0.04]'
                      }`}
                    >
                      <button
                        onClick={() => { onBrandChange(brand.id); setShowBrandMenu(false) }}
                        className="flex-1 text-left text-[13px]"
                      >
                        {brand.name}
                      </button>
                      {onDeleteBrand && brands.length > 1 && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation()
                            if (confirm(`Delete "${brand.name}"? This cannot be undone.`)) onDeleteBrand(brand.id)
                          }}
                          className="p-1.5 ml-2 rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete brand"
                        >
                          {Icons.trash}
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-white/[0.06] mt-2 pt-2 px-1">
                    <button
                      onClick={() => { onAddBrand(); setShowBrandMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      {Icons.plus}
                      <span>Add New Brand</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onAddBrand}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[13px] font-medium hover:bg-amber-500/20 transition-colors"
          >
            {Icons.plus}
            <span>Add Your First Brand</span>
          </button>
        )}
      </div>

      {/* Center - Progress */}
      {isTracking && trackingProgress && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${trackingProgress.percentage || 0}%` }}
            />
          </div>
          <span className="text-[12px] text-white/40 tabular-nums">
            {trackingProgress.current}/{trackingProgress.total}
          </span>
        </div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Configure Tracking */}
        {activeBrand && (
          <button
            onClick={onOpenTopicWizard}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-colors"
          >
            {Icons.wizard}
            <span className="hidden sm:inline">Configure</span>
          </button>
        )}

        {/* Run/Stop Tracking */}
        {activeBrand && hasTrackingConfig && (
          isTracking ? (
            <button
              onClick={onStopTracking}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              {Icons.stop}
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={onRunTracking}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-black font-medium bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 rounded-lg transition"
            >
              {Icons.play}
              <span>Run Tests</span>
            </button>
          )
        )}

        {/* User Menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[12px] font-medium text-white/60 hover:bg-white/[0.1] transition-colors"
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-[#0c0c0e] border border-white/[0.06] rounded-xl shadow-xl z-50">
                <div className="px-3 py-2 border-b border-white/[0.04]">
                  <div className="text-[13px] text-white/70 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={() => { onSignOut(); setShowUserMenu(false) }}
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
