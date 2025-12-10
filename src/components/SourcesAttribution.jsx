import React, { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'

const Icons = {
  link: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  globe: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  star: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  file: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  lightbulb: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const SOURCE_TYPES = {
  review: { color: '#f59e0b', label: 'Reviews' },
  official: { color: '#3b82f6', label: 'Official' },
  news: { color: '#8b5cf6', label: 'News' },
  social: { color: '#ec4899', label: 'Social' },
  blog: { color: '#10b981', label: 'Blogs' },
  other: { color: '#6b7280', label: 'Other' }
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function SourcesAttribution({ results = [], brand }) {
  const [activeTab, setActiveTab] = useState('overview')

  const sourceData = useMemo(() => {
    if (results.length === 0) return null

    const sources = {}
    const byType = {}
    
    results.forEach(r => {
      if (r.citations && r.citations.length > 0) {
        r.citations.forEach(cite => {
          const domain = cite.url ? new URL(cite.url).hostname.replace('www.', '') : 'unknown'
          const type = cite.type || 'other'
          
          if (!sources[domain]) {
            sources[domain] = { domain, count: 0, type, urls: new Set() }
          }
          sources[domain].count++
          if (cite.url) sources[domain].urls.add(cite.url)
          
          byType[type] = (byType[type] || 0) + 1
        })
      }
    })

    const topSources = Object.values(sources)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const typeDistribution = Object.entries(byType)
      .map(([type, count]) => ({
        name: SOURCE_TYPES[type]?.label || type,
        value: count,
        type,
        color: SOURCE_TYPES[type]?.color || '#6b7280'
      }))
      .sort((a, b) => b.value - a.value)

    const totalCitations = Object.values(byType).reduce((a, b) => a + b, 0)

    return { topSources, typeDistribution, totalCitations, byType }
  }, [results])

  if (results.length === 0 || !sourceData) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.link}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Source Data</h3>
        <p className="text-[14px] text-white/40">Run tracking to see which sources AI cites for your brand</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white">Source Attribution</h2>
        <p className="text-[14px] text-white/40 mt-1">See which sources AI uses to learn about your brand</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'opportunities', 'by-type'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'opportunities' ? 'Opportunities' : 'By Type'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Sources */}
          <Card>
            <h3 className="text-[14px] font-medium text-white/60 mb-5">Top Cited Sources</h3>
            <div className="space-y-3">
              {sourceData.topSources.map((source, i) => (
                <div key={source.domain} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <span className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold bg-white/[0.05] text-white/40">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white truncate">{source.domain}</div>
                    <div className="text-[11px] text-white/30">{source.count} citations</div>
                  </div>
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ background: SOURCE_TYPES[source.type]?.color || '#6b7280' }}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <h3 className="text-[14px] font-medium text-white/60 mb-5">Source Type Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.typeDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {sourceData.typeDistribution.map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[12px] text-white/50">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <Card>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              {Icons.lightbulb}
            </div>
            <div>
              <h3 className="text-[14px] font-medium text-white mb-1">Source Opportunities</h3>
              <p className="text-[13px] text-white/50">Ways to improve your source presence</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {!sourceData.byType.review && (
              <div className="p-4 rounded-lg bg-amber-500/[0.05] border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400">{Icons.star}</span>
                  <span className="text-[13px] font-medium text-white">Get Listed on Review Sites</span>
                </div>
                <p className="text-[12px] text-white/50">AI heavily weights review platforms. Get listed on G2, Capterra, or industry-specific sites.</p>
              </div>
            )}
            {!sourceData.byType.news && (
              <div className="p-4 rounded-lg bg-sky-500/[0.05] border border-sky-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sky-400">{Icons.file}</span>
                  <span className="text-[13px] font-medium text-white">Earn Press Coverage</span>
                </div>
                <p className="text-[12px] text-white/50">News mentions add credibility. Consider PR outreach or contributing expert commentary.</p>
              </div>
            )}
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/50">{Icons.globe}</span>
                <span className="text-[13px] font-medium text-white">Optimize Official Content</span>
              </div>
              <p className="text-[12px] text-white/50">Ensure your website has comprehensive, well-structured content that AI can easily parse.</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'by-type' && (
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 mb-5">Citations by Source Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData.typeDistribution} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {sourceData.typeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
