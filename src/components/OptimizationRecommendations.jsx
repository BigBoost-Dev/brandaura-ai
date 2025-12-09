import React, { useMemo, useState } from 'react'
import { generateRecommendations } from '../lib/analysis'

const PRIORITY_CONFIG = {
  critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-400', icon: '🚨' },
  high: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400', icon: '⚠️' },
  medium: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400', icon: '📌' },
  low: { bg: 'bg-white/5', border: 'border-white/10', badge: 'bg-white/10 text-white/60', icon: '💡' }
}

const CATEGORY_CONFIG = {
  visibility: { icon: '👁️', label: 'Visibility' },
  competitive: { icon: '⚔️', label: 'Competitive' },
  content: { icon: '📝', label: 'Content' },
  reputation: { icon: '🛡️', label: 'Reputation' },
  technical: { icon: '⚙️', label: 'Technical' },
  tracking: { icon: '📊', label: 'Tracking' }
}

export default function OptimizationRecommendations({ results = [], brand = {}, competitors = [] }) {
  const [expandedId, setExpandedId] = useState(null)
  const [completedIds, setCompletedIds] = useState(new Set())
  
  const recommendations = useMemo(() => generateRecommendations(results, brand, competitors), [results, brand, competitors])
  
  const toggleComplete = (id) => {
    const newSet = new Set(completedIds)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setCompletedIds(newSet)
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
        <p className="text-white/60">Run tracking to get personalized optimization suggestions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Optimization Recommendations</h2>
          <p className="text-white/60">{completedIds.size}/{recommendations.length} completed</p>
        </div>
        <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500" style={{ width: `${(completedIds.size / recommendations.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const p = PRIORITY_CONFIG[rec.priority]
          const c = CATEGORY_CONFIG[rec.category] || {}
          const isExpanded = expandedId === rec.id
          const isDone = completedIds.has(rec.id)

          return (
            <div key={rec.id} className={`${p.bg} border ${p.border} rounded-xl p-5 ${isDone ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-4">
                <button onClick={() => toggleComplete(rec.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                  {isDone && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span>{p.icon}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${p.badge}`}>{rec.priority}</span>
                    <span className="text-xs text-white/60">{c.icon} {c.label}</span>
                  </div>
                  <h4 className={`text-lg font-semibold mb-1 ${isDone ? 'line-through' : ''}`}>{rec.title}</h4>
                  <p className="text-sm text-white/70">{rec.description}</p>
                  {isExpanded && rec.details && (
                    <ul className="mt-4 space-y-2">
                      {rec.details.map((d, i) => <li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="text-primary-400">→</span>{d}</li>)}
                    </ul>
                  )}
                </div>
                {rec.details && (
                  <button onClick={() => setExpandedId(isExpanded ? null : rec.id)} className="p-2">
                    <svg className={`w-5 h-5 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
