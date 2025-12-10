import React, { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

const Icons = {
  users: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trophy: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2m12 6h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 9V5a2 2 0 012-2h8a2 2 0 012 2v4m-12 0a6 6 0 006 6m6-6a6 6 0 01-6 6m0 0v4m-3 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trendUp: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trendDown: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="px-3 py-2 rounded-lg bg-[#1a1a1f] border border-white/[0.1] shadow-xl">
      <div className="text-[13px] font-medium text-white mb-1">{data.name}</div>
      <div className="text-[14px] font-semibold" style={{ color: data.isYou ? '#f59e0b' : '#fff' }}>
        {data.value}%
      </div>
    </div>
  )
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function CompetitorDashboard({ results = [], brand, competitors = [], timeRange = '30d' }) {
  const [selectedMetric, setSelectedMetric] = useState('visibility')

  // Ensure competitors is always an array
  const safeCompetitors = useMemo(() => {
    if (Array.isArray(competitors)) return competitors
    if (typeof competitors === 'string') {
      try { return JSON.parse(competitors) } catch { return [] }
    }
    return []
  }, [competitors])

  const competitorMetrics = useMemo(() => {
    if (results.length === 0 || safeCompetitors.length === 0) return null
    
    const allBrands = [brand?.name, ...safeCompetitors.map(c => c.name || c)].filter(Boolean)
    const scores = {}
    
    allBrands.forEach(name => {
      scores[name] = { total: 0, mentioned: 0, leader: 0 }
    })
    
    results.forEach(r => {
      // Your brand
      if (brand?.name) {
        scores[brand.name].total++
        if (r.mention_type && r.mention_type !== 'notMentioned') {
          scores[brand.name].mentioned++
          if (r.mention_type === 'leader') scores[brand.name].leader++
        }
      }
      // Competitors
      if (r.competitor_mentions) {
        Object.entries(r.competitor_mentions).forEach(([name, type]) => {
          if (scores[name]) {
            scores[name].total++
            if (type !== 'notMentioned') {
              scores[name].mentioned++
              if (type === 'leader') scores[name].leader++
            }
          }
        })
      }
    })

    const rankings = Object.entries(scores)
      .map(([name, data]) => ({
        name,
        visibility: data.total > 0 ? Math.round((data.mentioned / data.total) * 100) : 0,
        leaderRate: data.total > 0 ? Math.round((data.leader / data.total) * 100) : 0,
        mentions: data.mentioned,
        isYou: name === brand?.name
      }))
      .sort((a, b) => b.visibility - a.visibility)

    const yourRank = rankings.findIndex(r => r.isYou) + 1
    const yourScore = rankings.find(r => r.isYou)

    return { rankings, yourRank, yourScore, totalCompetitors: rankings.length }
  }, [results, brand, competitors])

  if (results.length === 0 || competitors.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.users}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Competitor Data</h3>
        <p className="text-[14px] text-white/40">Add competitors in settings to compare performance</p>
      </Card>
    )
  }

  const chartData = competitorMetrics.rankings.map(r => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + '...' : r.name,
    value: selectedMetric === 'visibility' ? r.visibility : r.leaderRate,
    isYou: r.isYou
  }))

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Competitor Analysis</h2>
          <p className="text-[14px] text-white/40 mt-1">Compare your AI visibility with competitors</p>
        </div>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="visibility">Visibility Score</option>
          <option value="leader">Leader Rate</option>
        </select>
      </div>

      {/* Your Rank */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            {competitorMetrics.yourRank === 1 ? Icons.trophy : 
             <span className="text-2xl font-bold">#{competitorMetrics.yourRank}</span>}
          </div>
          <div>
            <div className="text-[13px] text-white/40 mb-1">Your Ranking</div>
            <div className="text-2xl font-bold text-white">
              {competitorMetrics.yourRank === 1 ? 'Leading the Pack' : 
               `#${competitorMetrics.yourRank} of ${competitorMetrics.totalCompetitors}`}
            </div>
            <div className="text-[13px] text-white/40 mt-1">
              {competitorMetrics.yourScore?.visibility}% visibility • {competitorMetrics.yourScore?.leaderRate}% leader rate
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <h3 className="text-[14px] font-medium text-white/60 mb-5">
          {selectedMetric === 'visibility' ? 'Visibility Score' : 'Leader Rate'} Comparison
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 50)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={80} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.isYou ? '#f59e0b' : 'rgba(255,255,255,0.15)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Rankings List */}
      <Card>
        <h3 className="text-[14px] font-medium text-white/60 mb-5">Full Rankings</h3>
        <div className="space-y-2">
          {competitorMetrics.rankings.map((r, i) => (
            <div 
              key={r.name} 
              className={`p-4 rounded-xl flex items-center justify-between ${
                r.isYou ? 'bg-amber-500/[0.08] border border-amber-500/20' : 'bg-white/[0.02] border border-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold ${
                  i === 0 ? 'bg-amber-500/20 text-amber-400' :
                  i === 1 ? 'bg-white/10 text-white/60' :
                  i === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/[0.05] text-white/40'
                }`}>
                  {i + 1}
                </span>
                <div>
                  <span className={`text-[14px] ${r.isYou ? 'text-amber-400 font-medium' : 'text-white'}`}>
                    {r.name}
                  </span>
                  {r.isYou && <span className="text-[11px] text-amber-400/60 ml-2 bg-amber-400/10 px-2 py-0.5 rounded">You</span>}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[12px] text-white/30">Visibility</div>
                  <div className={`text-[15px] font-bold font-mono ${r.isYou ? 'text-amber-400' : 'text-white'}`}>{r.visibility}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-white/30">Leader</div>
                  <div className={`text-[15px] font-bold font-mono ${r.isYou ? 'text-amber-400' : 'text-white/60'}`}>{r.leaderRate}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
