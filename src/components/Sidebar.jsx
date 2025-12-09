import React from 'react'

const navSections = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'visibility', label: 'AI Visibility', icon: '👁️', badge: 'NEW' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'topics', label: 'Topics', icon: '🎯' },
      { id: 'competitors', label: 'Competitors', icon: '⚔️' },
      { id: 'platforms', label: 'Platforms', icon: '🤖' },
    ]
  },
  {
    title: 'Data',
    items: [
      { id: 'results', label: 'All Results', icon: '📝', showCount: true },
      { id: 'reports', label: 'Reports', icon: '📈', badge: 'NEW' },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'alerts', label: 'Alerts', icon: '🔔' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ]
  }
]

export default function Sidebar({ activeTab, onTabChange, resultsCount = 0, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-[65px] bottom-0 w-60 border-r border-white/5 bg-dark-400 z-50
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4 space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 mb-2">
                {section.title}
              </div>
              <nav className="space-y-1">
                {section.items.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); onClose?.() }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-white border border-primary-500/30'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="font-medium text-sm">{tab.label}</span>
                    {tab.badge && (
                      <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                        {tab.badge}
                      </span>
                    )}
                    {tab.showCount && resultsCount > 0 && (
                      <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">{resultsCount}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 mt-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/5 border border-primary-500/20">
            <div className="text-sm font-semibold mb-1">Pro Tip</div>
            <p className="text-xs text-white/50 mb-3">Set up topic tracking for comprehensive AI visibility monitoring.</p>
            <a href="#" className="text-xs text-primary-400 hover:text-primary-300 font-medium">Learn More →</a>
          </div>
        </div>
      </aside>
    </>
  )
}