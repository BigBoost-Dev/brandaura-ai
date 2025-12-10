import React, { useState } from 'react'

// Minimal line icons - 1.5px stroke weight
const Icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  eye: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  link: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  lightbulb: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  dollar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  file: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  pieChart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
}

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: 'home' },
  { id: 'score', label: 'AI Score', icon: 'target' },
  { id: 'visibility', label: 'Visibility', icon: 'eye' },
  { id: 'sources', label: 'Sources', icon: 'link' },
  { id: 'recommendations', label: 'Insights', icon: 'lightbulb' },
  { id: 'competitors', label: 'Competitors', icon: 'users' },
  { id: 'ai-search', label: 'AI Search', icon: 'search' },
  { id: 'topics', label: 'Topics', icon: 'folder' },
  { id: 'roi', label: 'Analytics', icon: 'dollar' },
  { id: 'results', label: 'Results', icon: 'file' },
  { id: 'reports', label: 'Reports', icon: 'pieChart' },
  { id: 'alerts', label: 'Alerts', icon: 'bell' },
  { id: 'tracking-settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ activeTab, onTabChange, brands, activeBrand, onBrandChange, onAddBrand, resultCount }) {
  const [expanded, setExpanded] = useState(false)
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-[#09090b] border-r border-white/[0.04] z-40 transition-all duration-300 ease-out ${
          expanded ? 'w-52' : 'w-[52px]'
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setBrandDropdownOpen(false) }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-white/[0.04]">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
            <span className="text-black font-semibold text-xs">B</span>
          </div>
          <span className={`ml-3 font-semibold text-[15px] text-white tracking-tight whitespace-nowrap transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            BrandAura
          </span>
        </div>

        {/* Brand Selector */}
        {brands && brands.length > 0 && (
          <div className={`border-b border-white/[0.04] transition-all duration-200 ${expanded ? 'p-2.5' : 'p-1.5'}`}>
            <button
              onClick={() => expanded && setBrandDropdownOpen(!brandDropdownOpen)}
              className={`w-full flex items-center rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors ${
                expanded ? 'px-2.5 py-2 gap-2' : 'p-2 justify-center'
              }`}
            >
              <div className="w-6 h-6 rounded bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-white/60">{activeBrand?.name?.charAt(0) || 'B'}</span>
              </div>
              {expanded && (
                <>
                  <span className="text-[13px] text-white/60 truncate flex-1 text-left">{activeBrand?.name || 'Select'}</span>
                  <span className={`text-white/30 transition-transform duration-200 ${brandDropdownOpen ? 'rotate-180' : ''}`}>
                    {Icons.chevronDown}
                  </span>
                </>
              )}
            </button>
            
            {brandDropdownOpen && expanded && (
              <div className="mt-1.5 py-1 bg-[#0c0c0e] rounded-lg border border-white/[0.06] max-h-48 overflow-y-auto">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => { onBrandChange(brand); setBrandDropdownOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                      activeBrand?.id === brand.id 
                        ? 'text-white bg-white/[0.05]' 
                        : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
                <button
                  onClick={() => { onAddBrand(); setBrandDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-[13px] text-amber-400 hover:bg-white/[0.03] flex items-center gap-2 border-t border-white/[0.04] mt-1 pt-2"
                >
                  {Icons.plus}
                  <span>Add brand</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-1.5 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={!expanded ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 ${
                activeTab === item.id 
                  ? 'bg-white/[0.06] text-white' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
              } ${expanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
            >
              <span className={`flex-shrink-0 transition-colors ${activeTab === item.id ? 'text-amber-400' : ''}`}>
                {Icons[item.icon]}
              </span>
              <span className={`text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </span>
              {expanded && item.id === 'results' && resultCount > 0 && (
                <span className="ml-auto text-[11px] text-white/30 tabular-nums">
                  {resultCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Spacer for content */}
      <div className="flex-shrink-0 w-[52px]" />
    </>
  )
}
