import React, { useMemo, useState } from 'react'
import { extractSources } from '../lib/analysis'

const CATEGORY_INFO = {
  review_site: { icon: '⭐', color: '#fbbf24', label: 'Review Sites' },
  publication: { icon: '📰', color: '#60a5fa', label: 'Publications' },
  forum: { icon: '💬', color: '#f472b6', label: 'Forums' },
  social: { icon: '🔗', color: '#a78bfa', label: 'Social Media' },
  analyst: { icon: '📊', color: '#34d399', label: 'Industry Analysts' },
  video: { icon: '🎬', color: '#fb7185', label: 'Video Platforms' },
  encyclopedia: { icon: '📚', color: '#94a3b8', label: 'Reference' },
  research: { icon: '🔬', color: '#22d3ee', label: 'Research' },
  unknown: { icon: '🔍', color: '#6b7280', label: 'Other' },
  other: { icon: '🌐', color: '#6b7280', label: 'Other' }
}

export default function SourceAttribution({ results = [], brandName = '' }) {
  const [expandedSource, setExpandedSource] = useState(null)
  const [filter, setFilter] = useState('all')
  
  // Extract all sources from results
  const sourceAnalysis = useMemo(() => {
    const allSources = []
    const sourceAppearances = {} // Track which sources appear with brand mentions
    
    results.forEach(result => {
      if (result.full_response) {
        const sources = extractSources(result.full_response)
        const hasBrandMention = result.brand_mention !== 'notMentioned'
        
        sources.forEach(source => {
          const key = source.url || source.name
          if (!sourceAppearances[key]) {
            sourceAppearances[key] = {
              ...source,
              count: 0,
              withBrandMention: 0,
              withoutBrandMention: 0,
              contexts: []
            }
          }
          sourceAppearances[key].count++
          if (hasBrandMention) {
            sourceAppearances[key].withBrandMention++
          } else {
            sourceAppearances[key].withoutBrandMention++
          }
          sourceAppearances[key].contexts.push({
            query: result.query,
            mention: result.brand_mention,
            engine: result.platform_name
          })
        })
      }
    })
    
    // Convert to array and sort by influence
    const sourceList = Object.values(sourceAppearances)
      .map(s => ({
        ...s,
        influence: s.count + (s.withBrandMention * 2), // Weight sources that correlate with mentions
        correlationRate: s.count > 0 ? (s.withBrandMention / s.count) * 100 : 0
      }))
      .sort((a, b) => b.influence - a.influence)
    
    // Category breakdown
    const byCategory = {}
    sourceList.forEach(s => {
      const cat = s.category || 'other'
      if (!byCategory[cat]) byCategory[cat] = { count: 0, sources: [] }
      byCategory[cat].count++
      byCategory[cat].sources.push(s)
    })
    
    // Find gaps - categories with low presence
    const gaps = Object.entries(CATEGORY_INFO)
      .filter(([cat]) => !byCategory[cat] || byCategory[cat].count < 2)
      .filter(([cat]) => ['review_site', 'publication', 'analyst'].includes(cat))
      .map(([cat, info]) => ({ category: cat, ...info }))
    
    return {
      sources: sourceList,
      byCategory,
      gaps,
      totalSources: sourceList.length,
      uniqueDomains: new Set(sourceList.map(s => s.domain).filter(Boolean)).size
    }
  }, [results])
  
  const filteredSources = filter === 'all' 
    ? sourceAnalysis.sources 
    : sourceAnalysis.sources.filter(s => s.category === filter)
  
  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
        <p className="text-white/60">Run tracking to see where AI gets its information about your brand.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-primary-400">{sourceAnalysis.totalSources}</div>
          <div className="text-sm text-white/60">Sources Identified</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-emerald-400">{sourceAnalysis.uniqueDomains}</div>
          <div className="text-sm text-white/60">Unique Domains</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-amber-400">{Object.keys(sourceAnalysis.byCategory).length}</div>
          <div className="text-sm text-white/60">Source Categories</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-rose-400">{sourceAnalysis.gaps.length}</div>
          <div className="text-sm text-white/60">Coverage Gaps</div>
        </div>
      </div>
      
      {/* Source Gaps Alert */}
      {sourceAnalysis.gaps.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-amber-400 mb-1">Coverage Gaps Detected</h4>
              <p className="text-sm text-white/70 mb-3">
                AI responses rarely cite these high-value source types for your brand:
              </p>
              <div className="flex flex-wrap gap-2">
                {sourceAnalysis.gaps.map(gap => (
                  <span key={gap.category} className="px-3 py-1 bg-amber-500/20 rounded-full text-sm">
                    {gap.icon} {gap.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Breakdown */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Sources by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-lg text-left transition ${
              filter === 'all' ? 'bg-primary-500/20 border-primary-500/50' : 'bg-white/5 border-white/10'
            } border`}
          >
            <div className="text-lg font-bold">{sourceAnalysis.totalSources}</div>
            <div className="text-xs text-white/60">All Sources</div>
          </button>
          {Object.entries(sourceAnalysis.byCategory).map(([category, data]) => {
            const info = CATEGORY_INFO[category] || CATEGORY_INFO.other
            return (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`p-3 rounded-lg text-left transition ${
                  filter === category ? 'bg-primary-500/20 border-primary-500/50' : 'bg-white/5 border-white/10'
                } border`}
              >
                <div className="flex items-center gap-2">
                  <span>{info.icon}</span>
                  <span className="text-lg font-bold">{data.count}</span>
                </div>
                <div className="text-xs text-white/60">{info.label}</div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Source List */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Influential Sources</h3>
          <p className="text-sm text-white/60">Sources that AI cites when discussing your brand and competitors</p>
        </div>
        
        <div className="divide-y divide-white/5">
          {filteredSources.slice(0, 20).map((source, idx) => {
            const info = CATEGORY_INFO[source.category] || CATEGORY_INFO.other
            const isExpanded = expandedSource === idx
            
            return (
              <div key={idx} className="p-4 hover:bg-white/5 transition">
                <button 
                  onClick={() => setExpandedSource(isExpanded ? null : idx)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span 
                        className="text-lg mt-0.5 flex-shrink-0" 
                        style={{ filter: `drop-shadow(0 0 4px ${info.color})` }}
                      >
                        {info.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {source.url ? (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300"
                              onClick={e => e.stopPropagation()}
                            >
                              {source.domain || source.url}
                            </a>
                          ) : (
                            source.name
                          )}
                        </div>
                        <div className="text-sm text-white/50">{info.label}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Correlation indicator */}
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          source.correlationRate > 50 ? 'text-emerald-400' :
                          source.correlationRate > 25 ? 'text-amber-400' : 'text-white/60'
                        }`}>
                          {source.correlationRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/40">correlation</div>
                      </div>
                      
                      {/* Appearance count */}
                      <div className="text-right">
                        <div className="text-sm font-medium">{source.count}×</div>
                        <div className="text-xs text-white/40">cited</div>
                      </div>
                      
                      <svg 
                        className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                
                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 ml-9 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-emerald-500/10 rounded-lg p-3">
                        <div className="text-emerald-400 font-medium">{source.withBrandMention}</div>
                        <div className="text-white/60">With brand mention</div>
                      </div>
                      <div className="bg-rose-500/10 rounded-lg p-3">
                        <div className="text-rose-400 font-medium">{source.withoutBrandMention}</div>
                        <div className="text-white/60">Without brand mention</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-white/60 mb-2">Appeared in queries:</div>
                      <div className="space-y-1">
                        {source.contexts.slice(0, 5).map((ctx, i) => (
                          <div key={i} className="text-sm bg-white/5 rounded px-3 py-2 flex items-center justify-between">
                            <span className="text-white/80 truncate flex-1">{ctx.query}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                              ctx.mention === 'leader' ? 'bg-emerald-500/20 text-emerald-400' :
                              ctx.mention === 'recommended' ? 'bg-blue-500/20 text-blue-400' :
                              ctx.mention === 'mentioned' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-white/10 text-white/50'
                            }`}>
                              {ctx.mention}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {source.url && (
                      <a 
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
                      >
                        Visit Source
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {filteredSources.length === 0 && (
          <div className="p-8 text-center text-white/60">
            No sources found in this category.
          </div>
        )}
      </div>
      
      {/* Insights */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl p-6 border border-primary-500/20">
        <h3 className="text-lg font-semibold mb-3">💡 Key Insights</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>
              {sourceAnalysis.byCategory.review_site?.count > 0 
                ? `Review sites like ${sourceAnalysis.byCategory.review_site?.sources[0]?.name || 'G2'} are influencing AI responses about your brand.`
                : 'No review sites detected. Getting listed on G2, Capterra, or TrustRadius could improve AI visibility.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>
              {sourceAnalysis.sources.filter(s => s.correlationRate > 50).length > 0
                ? `${sourceAnalysis.sources.filter(s => s.correlationRate > 50).length} sources strongly correlate with positive brand mentions.`
                : 'Build presence on high-authority sources to improve mention correlation.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400">•</span>
            <span>
              Top source category: {
                Object.entries(sourceAnalysis.byCategory)
                  .sort((a, b) => b[1].count - a[1].count)[0]?.[0] 
                  ? CATEGORY_INFO[Object.entries(sourceAnalysis.byCategory).sort((a, b) => b[1].count - a[1].count)[0][0]]?.label
                  : 'None detected'
              }
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
