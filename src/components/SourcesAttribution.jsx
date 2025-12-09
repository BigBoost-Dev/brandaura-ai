import React, { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts'
import { extractSources, SOURCE_PATTERNS } from '../lib/aiAnalysis'

const SOURCE_COLORS = {
  review: '#10b981',
  media: '#6366f1',
  social: '#f59e0b',
  knowledge: '#8b5cf6',
  blog: '#ec4899',
  official: '#3b82f6',
  unknown: '#6b7280'
}

const AUTHORITY_COLORS = {
  high: '#10b981',
  medium: '#f59e0b',
  low: '#ef4444',
  inferred: '#6b7280',
  unknown: '#6b7280'
}

export default function SourcesAttribution({ results = [], brand }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedType, setSelectedType] = useState(null)
  
  // Process sources from all results
  const sourcesAnalysis = useMemo(() => {
    const allSources = []
    const sourcesByResult = {}
    const sourcesByMentionType = {
      mentioned: [],
      notMentioned: []
    }
    
    results.forEach(result => {
      const sources = extractSources(result.full_response || '', result.cited_urls || [])
      sourcesByResult[result.id] = sources
      
      sources.forEach(source => {
        allSources.push({
          ...source,
          resultId: result.id,
          brandMentioned: result.brand_mention !== 'notMentioned',
          brandMention: result.brand_mention
        })
      })
      
      if (result.brand_mention !== 'notMentioned') {
        sourcesByMentionType.mentioned.push(...sources)
      } else {
        sourcesByMentionType.notMentioned.push(...sources)
      }
    })
    
    // Aggregate sources
    const sourceCounts = {}
    allSources.forEach(source => {
      if (!sourceCounts[source.name]) {
        sourceCounts[source.name] = {
          name: source.name,
          type: source.type,
          authority: source.authority,
          totalMentions: 0,
          whenBrandMentioned: 0,
          whenBrandNotMentioned: 0,
          urls: new Set()
        }
      }
      sourceCounts[source.name].totalMentions++
      if (source.brandMentioned) {
        sourceCounts[source.name].whenBrandMentioned++
      } else {
        sourceCounts[source.name].whenBrandNotMentioned++
      }
      if (source.url) {
        sourceCounts[source.name].urls.add(source.url)
      }
    })
    
    // Convert to array and sort
    const sourcesList = Object.values(sourceCounts)
      .map(s => ({ ...s, urls: [...s.urls] }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
    
    // Group by type
    const byType = {}
    sourcesList.forEach(source => {
      if (!byType[source.type]) {
        byType[source.type] = []
      }
      byType[source.type].push(source)
    })
    
    // Calculate opportunity sources (cited when brand NOT mentioned)
    const opportunities = sourcesList
      .filter(s => s.whenBrandNotMentioned > s.whenBrandMentioned)
      .sort((a, b) => b.whenBrandNotMentioned - a.whenBrandNotMentioned)
    
    return {
      all: sourcesList,
      byType,
      opportunities,
      total: allSources.length,
      unique: sourcesList.length
    }
  }, [results])
  
  // Chart data
  const typeChartData = useMemo(() => {
    return Object.entries(sourcesAnalysis.byType).map(([type, sources]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: sources.reduce((sum, s) => sum + s.totalMentions, 0),
      type
    }))
  }, [sourcesAnalysis])
  
  const topSourcesData = useMemo(() => {
    return sourcesAnalysis.all.slice(0, 10).map(s => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
      fullName: s.name,
      total: s.totalMentions,
      withBrand: s.whenBrandMentioned,
      withoutBrand: s.whenBrandNotMentioned,
      type: s.type
    }))
  }, [sourcesAnalysis])

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-2">No Source Data Yet</h3>
        <p className="text-white/60">Run tracking to discover where AI gets its information</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Source Attribution</h2>
          <p className="text-white/60">Discover where AI learns about brands in your industry</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-400">{sourcesAnalysis.unique}</div>
            <div className="text-xs text-white/50">Unique Sources</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{sourcesAnalysis.opportunities.length}</div>
            <div className="text-xs text-white/50">Opportunities</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {['overview', 'opportunities', 'by-type'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'opportunities' ? '🎯 Opportunities' : '📁 By Type'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Types Pie Chart */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Sources by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.type] || SOURCE_COLORS.unknown} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(value) => [`${value} citations`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {Object.entries(SOURCE_COLORS).filter(([k]) => k !== 'unknown').map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="text-white/60 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sources Bar Chart */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Top 10 Sources</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSourcesData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" stroke="#666" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#666" 
                    tick={{ fontSize: 11 }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(value, name) => [value, name === 'withBrand' ? 'With your brand' : 'Without your brand']}
                    labelFormatter={(label) => topSourcesData.find(d => d.name === label)?.fullName || label}
                  />
                  <Bar dataKey="withBrand" stackId="a" fill="#10b981" name="With Brand" />
                  <Bar dataKey="withoutBrand" stackId="a" fill="#ef4444" name="Without Brand" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* All Sources List */}
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">All Identified Sources ({sourcesAnalysis.all.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/50 text-sm border-b border-white/10">
                    <th className="pb-3 pr-4">Source</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Authority</th>
                    <th className="pb-3 pr-4 text-center">Total Citations</th>
                    <th className="pb-3 pr-4 text-center">With {brand?.name || 'Brand'}</th>
                    <th className="pb-3 pr-4 text-center">Without {brand?.name || 'Brand'}</th>
                    <th className="pb-3">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {sourcesAnalysis.all.slice(0, 20).map((source, idx) => {
                    const gap = source.whenBrandNotMentioned - source.whenBrandMentioned
                    return (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{source.name}</div>
                          {source.urls[0] && (
                            <a 
                              href={source.urls[0]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-400 hover:underline"
                            >
                              View →
                            </a>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: `${SOURCE_COLORS[source.type]}20`,
                              color: SOURCE_COLORS[source.type]
                            }}
                          >
                            {source.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: `${AUTHORITY_COLORS[source.authority]}20`,
                              color: AUTHORITY_COLORS[source.authority]
                            }}
                          >
                            {source.authority}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center font-mono">{source.totalMentions}</td>
                        <td className="py-3 pr-4 text-center font-mono text-green-400">{source.whenBrandMentioned}</td>
                        <td className="py-3 pr-4 text-center font-mono text-red-400">{source.whenBrandNotMentioned}</td>
                        <td className="py-3">
                          {gap > 0 ? (
                            <span className="text-red-400 font-medium">-{gap}</span>
                          ) : gap < 0 ? (
                            <span className="text-green-400 font-medium">+{Math.abs(gap)}</span>
                          ) : (
                            <span className="text-white/40">0</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="card p-6 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Source Opportunities</h3>
                <p className="text-white/60">
                  These sources cite your competitors more than you. Getting listed here could significantly improve your AI visibility.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {sourcesAnalysis.opportunities.slice(0, 10).map((source, idx) => (
              <div key={idx} className="card p-5 hover:border-primary-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${SOURCE_COLORS[source.type]}20` }}>
                      {source.type === 'review' ? '⭐' : 
                       source.type === 'media' ? '📰' :
                       source.type === 'social' ? '💬' :
                       source.type === 'blog' ? '✍️' : '📚'}
                    </div>
                    <div>
                      <h4 className="font-semibold">{source.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <span className="capitalize">{source.type}</span>
                        <span>•</span>
                        <span className="capitalize">{source.authority} authority</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-400">{source.whenBrandNotMentioned}</div>
                      <div className="text-xs text-white/50">Competitor citations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{source.whenBrandMentioned}</div>
                      <div className="text-xs text-white/50">Your citations</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-red-500/20 rounded-lg">
                      <div className="text-xl font-bold text-red-400">
                        -{source.whenBrandNotMentioned - source.whenBrandMentioned}
                      </div>
                      <div className="text-xs text-white/50">Gap</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-white/70">
                    <strong>Recommendation:</strong>{' '}
                    {source.type === 'review' 
                      ? `Create or claim your ${source.name} profile. Encourage customers to leave reviews.`
                      : source.type === 'media'
                      ? `Pitch stories to ${source.name}'s editorial team or seek features in their articles.`
                      : source.type === 'social'
                      ? `Build an active presence on ${source.name}. Engage in relevant discussions.`
                      : `Create valuable content or establish your presence on ${source.name}.`
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Type Tab */}
      {activeTab === 'by-type' && (
        <div className="space-y-6">
          {Object.entries(sourcesAnalysis.byType).map(([type, sources]) => (
            <div key={type} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${SOURCE_COLORS[type]}20` }}
                >
                  {type === 'review' ? '⭐' : 
                   type === 'media' ? '📰' :
                   type === 'social' ? '💬' :
                   type === 'blog' ? '✍️' :
                   type === 'knowledge' ? '📚' :
                   type === 'official' ? '🏢' : '🔗'}
                </div>
                <div>
                  <h3 className="font-semibold capitalize">{type} Sources</h3>
                  <p className="text-sm text-white/50">{sources.length} sources identified</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                {sources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{source.name}</span>
                      <span 
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ 
                          backgroundColor: `${AUTHORITY_COLORS[source.authority]}20`,
                          color: AUTHORITY_COLORS[source.authority]
                        }}
                      >
                        {source.authority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">{source.whenBrandMentioned} with you</span>
                      <span className="text-red-400">{source.whenBrandNotMentioned} without</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
