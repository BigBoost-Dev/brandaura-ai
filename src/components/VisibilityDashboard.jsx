import React, { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts'
import { FUNNEL_STAGES, AI_PLATFORMS } from '../lib/constants'

const Icons = {
  chart: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trophy: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2m12 6h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 9V5a2 2 0 012-2h8a2 2 0 012 2v4m-12 0a6 6 0 006 6m6-6a6 6 0 01-6 6m0 0v4m-3 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  link: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

function MetricCard({ label, value, color = 'amber', icon, subtitle }) {
  const colors = { amber: 'text-amber-400', green: 'text-emerald-400', blue: 'text-sky-400', white: 'text-white' }
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] text-white/40">{label}</span>
        {icon && <span className="text-white/30">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold font-mono ${colors[color]}`}>{value}</div>
      {subtitle && <div className="text-[12px] text-white/30 mt-1">{subtitle}</div>}
    </Card>
  )
}

export default function VisibilityDashboard({ results = [], brand, competitors = [], timeRange = '30d' }) {
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  const metrics = useMemo(() => {
    if (results.length === 0) return null
    const filtered = selectedPlatform === 'all' ? results : results.filter(r => r.platform === selectedPlatform)
    const total = filtered.length
    const mentioned = filtered.filter(r => r.mention_type && r.mention_type !== 'notMentioned').length
    const leaders = filtered.filter(r => r.mention_type === 'leader').length
    const visibilityScore = total > 0 ? Math.round((mentioned / total) * 100) : 0
    const leaderRate = total > 0 ? Math.round((leaders / total) * 100) : 0
    
    // By platform
    const byPlatform = {}
    filtered.forEach(r => {
      if (!byPlatform[r.platform]) byPlatform[r.platform] = { total: 0, mentioned: 0, leader: 0 }
      byPlatform[r.platform].total++
      if (r.mention_type && r.mention_type !== 'notMentioned') {
        byPlatform[r.platform].mentioned++
        if (r.mention_type === 'leader') byPlatform[r.platform].leader++
      }
    })

    // Timeline
    const timeline = {}
    filtered.forEach(r => {
      const date = new Date(r.created_at).toISOString().split('T')[0]
      if (!timeline[date]) timeline[date] = { total: 0, mentioned: 0 }
      timeline[date].total++
      if (r.mention_type && r.mention_type !== 'notMentioned') timeline[date].mentioned++
    })
    const timelineData = Object.entries(timeline)
      .map(([date, data]) => ({ date, score: Math.round((data.mentioned / data.total) * 100) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { visibilityScore, leaderRate, total, mentioned, leaders, byPlatform, timelineData }
  }, [results, selectedPlatform])

  if (results.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.chart}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Visibility Data</h3>
        <p className="text-[14px] text-white/40">Run tests to see your visibility metrics</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Visibility Dashboard</h2>
          <p className="text-[14px] text-white/40 mt-1">Track how often AI mentions your brand</p>
        </div>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All Platforms</option>
          {Object.keys(AI_PLATFORMS).map(p => (
            <option key={p} value={p}>{AI_PLATFORMS[p]?.name || p}</option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Visibility Score" value={`${metrics.visibilityScore}%`} color="amber" icon={Icons.chart} />
        <MetricCard label="Leader Rate" value={`${metrics.leaderRate}%`} color="green" icon={Icons.trophy} />
        <MetricCard label="Total Mentions" value={metrics.mentioned} color="blue" icon={Icons.link} subtitle={`of ${metrics.total} tests`} />
        <MetricCard label="Top Picks" value={metrics.leaders} color="green" />
      </div>

      {/* Chart */}
      {metrics.timelineData.length > 1 && (
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 mb-5">Visibility Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={metrics.timelineData}>
              <defs>
                <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#f59e0b" fill="url(#visGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* By Platform */}
      <Card>
        <h3 className="text-[14px] font-medium text-white/60 mb-5">By Platform</h3>
        <div className="space-y-3">
          {Object.entries(metrics.byPlatform).map(([platform, data]) => {
            const score = Math.round((data.mentioned / data.total) * 100)
            const platformInfo = AI_PLATFORMS[platform] || { name: platform, color: '#f59e0b' }
            return (
              <div key={platform} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-white">{platformInfo.name}</span>
                  <span className="text-[14px] font-semibold font-mono" style={{ color: platformInfo.color }}>{score}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: platformInfo.color }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-white/30">
                  <span>{data.mentioned} mentions</span>
                  <span>{data.leader} top picks</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
