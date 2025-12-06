import React from 'react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'platforms', label: 'Platforms', icon: '🤖' },
  { id: 'results', label: 'Results', icon: '📝', showCount: true },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

export default function Sidebar({ activeTab, onTabChange, resultsCount = 0 }) {
  return (
    <aside className="fixed left-0 top-[73px] bottom-0 w-60 p-4 border-r border-white/5 bg-dark-400">
      <nav className="space-y-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
            {tab.showCount && resultsCount > 0 && (
              <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {resultsCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Help Section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/5 border border-primary-500/20">
          <div className="text-sm font-semibold mb-1">Need Help?</div>
          <p className="text-xs text-white/50 mb-3">Check our documentation or contact support.</p>
          <a 
            href="#" 
            className="text-xs text-primary-400 hover:text-primary-300 font-medium"
          >
            View Docs →
          </a>
        </div>
      </div>
    </aside>
  )
}
