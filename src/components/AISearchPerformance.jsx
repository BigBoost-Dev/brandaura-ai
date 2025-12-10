import React, { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line } from 'recharts'
import { AI_PLATFORMS } from '../lib/constants'

const Icons = {
  search: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bot: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M7 15h.01M17 15h.01"/></svg>,
  check: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function AISearchPerformance({ results = [], brand }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEngine, setSelectedEngine] = useState(null)

  const metrics = useMemo(() => {
    if (results.length === 0) return null

    // By platform/engine
    const byEngine = {}
    results.forEach(r => {
      const engine = r.platform || 'unknown'
      if (!byEngine[engine]) {
        byEngine[engine] = { total: 0, mentioned: 0, leader: 0, queries: [] }
      }
      byEngine[engine].total++
      byEngine[engine].queries.push(r)
      if (r.mention_type && r.mention_type !== 'notMentioned') {
        byEngine[engine].mentioned++
        if (r.mention_type === 'leader') byEngine[engine].leader++
      }
    })

    const engineStats = Object.entries(byEngine)
      .map(([engine, data]) => ({
        engine,
        name: AI_PLATFORMS[engine]?.name || engine,
        color: AI_PLATFORMS[engine]?.color || '#f59e0b',
        visibility: Math.round((data.mentioned / data.total) * 100),
        leaderRate: Math.round((data.leader / data.total) * 100),
        total: data.total,
        queries: data.queries
      }))
      .sort((a, b) => b.visibility - a.visibility)

    // Overall stats
    const total = results.length
    const mentioned = results.filter(r => r.mention_type && r.mention_type !== 'notMentioned').length
    const leaders = results.filter(r => r.mention_type === 'leader').length

    return {
      engineStats,
      overall: {
        visibility: Math.round((mentioned / total) * 100),
        leaderRate: Math.round((leaders / total) * 100),
        total,
        mentioned,
        leaders
      }
    }
  }, [results])

  if (results.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.search}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No AI Search Data</h3>
        <p className="text-[14px] text-white/40">Run tracking to see performance across AI search engines</p>
      </Card>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'engines', label: 'By Engine' },
    { id: 'queries', label: 'Queries' }
  ]

  return (
    <div className="space-y-6 ">
      <div>
        <h2 className="text-xl font-semibold text-white">AI Search Performance</h2>
        <p className="text-[14px] text-white/40 mt-1">How your brand performs across different AI search engines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="text-[13px] text-white/40 mb-2">Overall Visibility</div>
              <div className="text-3xl font-bold font-mono text-amber-400">{metrics.overall.visibility}%</div>
            </Card>
            <Card>
              <div className="text-[13px] text-white/40 mb-2">Leader Rate</div>
              <div className="text-3xl font-bold font-mono text-emerald-400">{metrics.overall.leaderRate}%</div>
            </Card>
            <Card>
              <div className="text-[13px] text-white/40 mb-2">AI Engines Tested</div>
              <div className="text-3xl font-bold font-mono text-white">{metrics.engineStats.length}</div>
            </Card>
            <Card>
              <div className="text-[13px] text-white/40 mb-2">Total Queries</div>
              <div className="text-3xl font-bold font-mono text-white">{metrics.overall.total}</div>
            </Card>
          </div>

          {/* Engine Comparison Chart */}
          <Card>
            <h3 className="text-[14px] font-medium text-white/60 mb-5">Visibility by AI Engine</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, metrics.engineStats.length * 50)}>
              <BarChart data={metrics.engineStats} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={100} />
                <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="visibility" radius={[0, 4, 4, 0]}>
                  {metrics.engineStats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {activeTab === 'engines' && (
        <div className="space-y-4">
          {metrics.engineStats.map(engine => (
            <Card 
              key={engine.engine}
              className={selectedEngine === engine.engine ? 'border-amber-500/20' : ''}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedEngine(selectedEngine === engine.engine ? null : engine.engine)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: `${engine.color}20` }}
                  >
                    {Icons.bot}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-white">{engine.name}</div>
                    <div className="text-[12px] text-white/30">{engine.total} queries tested</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[11px] text-white/30">Visibility</div>
                    <div className="text-[18px] font-bold font-mono" style={{ color: engine.color }}>{engine.visibility}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/30">Leader</div>
                    <div className="text-[18px] font-bold font-mono text-white/60">{engine.leaderRate}%</div>
                  </div>
                </div>
              </div>
              
              {selectedEngine === engine.engine && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="text-[12px] text-white/40 mb-3">Recent Queries</div>
                  <div className="space-y-2">
                    {engine.queries.slice(0, 8).map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                        <span className="text-[12px] text-white/60 truncate flex-1">{q.query}</span>
                        <span className={`ml-2 flex items-center gap-1 text-[11px] ${
                          q.mention_type === 'leader' ? 'text-emerald-400' :
                          q.mention_type === 'mentioned' ? 'text-amber-400' :
                          'text-white/30'
                        }`}>
                          {q.mention_type === 'leader' && Icons.check}
                          {q.mention_type === 'notMentioned' && Icons.x}
                          {q.mention_type || 'Not found'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'queries' && (
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 mb-5">All Queries</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {results.slice(0, 50).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-white truncate">{r.query}</div>
                  <div className="text-[11px] text-white/30">{AI_PLATFORMS[r.platform]?.name || r.platform}</div>
                </div>
                <span className={`ml-3 px-2 py-1 rounded text-[11px] font-medium ${
                  r.mention_type === 'leader' ? 'bg-emerald-500/10 text-emerald-400' :
                  r.mention_type === 'mentioned' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-white/[0.05] text-white/40'
                }`}>
                  {r.mention_type || 'Not found'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
