import React, { useMemo, useState } from 'react'
import { generateRecommendations, analyzeContentGaps, extractSources } from '../lib/aiAnalysis'

const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', icon: '🚨' },
  high: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', icon: '⚠️' },
  medium: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', icon: '💡' },
  low: { bg: 'bg-white/10', border: 'border-white/20', text: 'text-white/60', icon: '📝' }
}

const CATEGORY_INFO = {
  visibility: { icon: '👁️', label: 'Visibility', description: 'Get seen in more AI responses' },
  content: { icon: '✍️', label: 'Content', description: 'Create content that AI will cite' },
  optimization: { icon: '⚡', label: 'Optimization', description: 'Improve existing content' },
  technical: { icon: '🔧', label: 'Technical', description: 'Technical SEO for AI' },
  reputation: { icon: '⭐', label: 'Reputation', description: 'Manage brand perception' }
}

const EFFORT_LABELS = {
  low: { label: 'Quick Win', color: 'text-green-400', time: '< 1 hour' },
  medium: { label: 'Moderate', color: 'text-amber-400', time: '1-5 hours' },
  high: { label: 'Project', color: 'text-red-400', time: '1+ week' }
}

export default function RecommendationsDashboard({ results = [], brand, competitors = [] }) {
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [expandedRec, setExpandedRec] = useState(null)
  const [completedRecs, setCompletedRecs] = useState(new Set())

  // Generate all analysis
  const analysis = useMemo(() => {
    if (results.length === 0) return null

    // Extract sources from all results
    const allSources = []
    results.forEach(r => {
      const sources = extractSources(r.full_response || '', r.cited_urls || [])
      allSources.push(...sources)
    })

    // Analyze content gaps
    const gaps = analyzeContentGaps(results, brand?.name || '', competitors)

    // Generate recommendations
    const recommendations = generateRecommendations(results, gaps, allSources, brand || {})

    return { gaps, recommendations, sources: allSources }
  }, [results, brand, competitors])

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    if (!analysis) return []
    
    return analysis.recommendations.filter(rec => {
      if (filterCategory !== 'all' && rec.category !== filterCategory) return false
      if (filterPriority !== 'all' && rec.priority !== filterPriority) return false
      return true
    })
  }, [analysis, filterCategory, filterPriority])

  // Stats
  const stats = useMemo(() => {
    if (!analysis) return null
    
    const recs = analysis.recommendations
    return {
      total: recs.length,
      critical: recs.filter(r => r.priority === 'critical').length,
      high: recs.filter(r => r.priority === 'high').length,
      quickWins: recs.filter(r => r.effort === 'low').length,
      completed: completedRecs.size
    }
  }, [analysis, completedRecs])

  const toggleComplete = (recId) => {
    setCompletedRecs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recId)) {
        newSet.delete(recId)
      } else {
        newSet.add(recId)
      }
      return newSet
    })
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-xl font-bold mb-2">No Recommendations Yet</h3>
        <p className="text-white/60">Run tracking to get personalized optimization recommendations</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Optimization Recommendations</h2>
          <p className="text-white/60">Actionable steps to improve your AI visibility</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-white/50">Total Actions</div>
          </div>
          <div className="card p-4 text-center border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-white/50">Critical</div>
          </div>
          <div className="card p-4 text-center border-amber-500/30">
            <div className="text-2xl font-bold text-amber-400">{stats.high}</div>
            <div className="text-xs text-white/50">High Priority</div>
          </div>
          <div className="card p-4 text-center border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{stats.quickWins}</div>
            <div className="text-xs text-white/50">Quick Wins</div>
          </div>
          <div className="card p-4 text-center border-primary-500/30">
            <div className="text-2xl font-bold text-primary-400">{stats.completed}</div>
            <div className="text-xs text-white/50">Completed</div>
          </div>
        </div>
      )}

      {/* Content Gaps Summary */}
      {analysis?.gaps?.summary && analysis.gaps.summary.totalGaps > 0 && (
        <div className="card p-6 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📊</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Content Gap Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Total Gaps Found:</span>
                  <span className="ml-2 font-bold text-amber-400">{analysis.gaps.summary.totalGaps}</span>
                </div>
                <div>
                  <span className="text-white/50">Critical Gaps:</span>
                  <span className="ml-2 font-bold text-red-400">{analysis.gaps.summary.criticalGaps}</span>
                </div>
                {analysis.gaps.summary.topCompetitor && (
                  <div>
                    <span className="text-white/50">Top Competitor:</span>
                    <span className="ml-2 font-bold">{analysis.gaps.summary.topCompetitor}</span>
                  </div>
                )}
              </div>
              
              {/* Top gaps */}
              {analysis.gaps.gaps.slice(0, 3).length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-white/50">Biggest Opportunities:</div>
                  {analysis.gaps.gaps.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        gap.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        gap.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {Math.round(gap.gap * 100)}% gap
                      </span>
                      <span>"{gap.topic}"</span>
                      <span className="text-white/40">vs {gap.competitor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-white/50 block mb-1">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <option key={key} value={key}>{info.icon} {info.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">⚠️ High</option>
            <option value="medium">💡 Medium</option>
            <option value="low">📝 Low</option>
          </select>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const priority = PRIORITY_COLORS[rec.priority]
          const category = CATEGORY_INFO[rec.category]
          const effort = EFFORT_LABELS[rec.effort]
          const isExpanded = expandedRec === rec.id
          const isCompleted = completedRecs.has(rec.id)

          return (
            <div 
              key={rec.id}
              className={`card p-5 transition-all ${priority.border} ${isCompleted ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(rec.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text}`}>
                      {priority.icon} {rec.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                      {category?.icon} {category?.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs bg-white/5 ${effort?.color}`}>
                      {effort?.label} • {effort?.time}
                    </span>
                    {rec.impact === 'high' && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                        High Impact
                      </span>
                    )}
                  </div>

                  <h4 className={`font-semibold mb-1 ${isCompleted ? 'line-through' : ''}`}>
                    {rec.title}
                  </h4>
                  <p className="text-sm text-white/60 mb-3">{rec.description}</p>

                  {/* Expandable Action */}
                  <button
                    onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    {isExpanded ? 'Hide details' : 'Show action steps'}
                    <svg 
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">📋 Action Steps:</h5>
                      <p className="text-sm text-white/70">{rec.action}</p>
                      
                      {rec.type === 'source' && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <h5 className="font-medium text-sm mb-2">🔗 Quick Links:</h5>
                          <div className="flex flex-wrap gap-2">
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent(rec.title.replace('Get listed on ', ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30"
                            >
                              Search Platform →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredRecs.length === 0 && (
        <div className="text-center py-8 text-white/50">
          No recommendations match your filters
        </div>
      )}

      {/* Pro Tips */}
      <div className="card p-6 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/30">
        <h3 className="font-bold mb-3">💡 Pro Tips for AI Visibility</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70">
          <div className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>AI models heavily weight authoritative sources like G2, Capterra, and major publications</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>Structured data (Schema.org) helps AI understand and cite your content accurately</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>Consistent brand mentions across multiple platforms reinforces AI's confidence</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>Recent content (last 6 months) is weighted more heavily by most AI models</span>
          </div>
        </div>
      </div>
    </div>
  )
}
