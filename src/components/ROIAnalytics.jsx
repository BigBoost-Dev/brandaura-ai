import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const Icons = {
  dollar: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trendUp: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  lightbulb: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z"/></svg>,
  info: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

function MetricCard({ label, value, icon, color = 'amber', subtitle, note }) {
  const colors = { amber: 'text-amber-400', green: 'text-emerald-400', blue: 'text-sky-400' }
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-white/40">{label}</span>
          {note && (
            <span className="group relative">
              <span className="text-white/20 cursor-help">{Icons.info}</span>
              <span className="absolute bottom-full left-0 mb-2 w-48 p-2 rounded-lg bg-[#1a1a1f] border border-white/[0.1] text-[11px] text-white/60 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                {note}
              </span>
            </span>
          )}
        </div>
        {icon && <span className="text-white/30">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold font-mono ${colors[color]}`}>{value}</div>
      {subtitle && <div className="text-[12px] text-white/30 mt-1">{subtitle}</div>}
    </Card>
  )
}

// Custom tooltip with proper styling
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg bg-[#1a1a1f] border border-white/[0.1] shadow-xl">
      <div className="text-[11px] text-white/40 mb-1">{label}</div>
      <div className="text-[14px] font-semibold text-emerald-400">
        ${payload[0].value?.toLocaleString()}
      </div>
    </div>
  )
}

export default function ROIAnalytics({ results = [], brand }) {
  const metrics = useMemo(() => {
    if (results.length === 0) return null
    
    const total = results.length
    const mentioned = results.filter(r => r.mention_type && r.mention_type !== 'notMentioned').length
    const leaders = results.filter(r => r.mention_type === 'leader').length
    const visibilityRate = Math.round((mentioned / total) * 100)
    
    // Conservative estimates based on industry research
    // Each AI mention estimated to drive 5-15 visits (using 10 as baseline)
    const visitsPerMention = 10
    const estimatedTraffic = mentioned * visitsPerMention
    
    // Average CPC equivalent value: $2-4 per visit (using $2.50)
    const valuePerVisit = 2.50
    const estimatedValue = Math.round(estimatedTraffic * valuePerVisit)
    
    // Conservative conversion rate: 2-4% (using 2.5%)
    const conversionRate = 2.5
    const estimatedLeads = Math.round(estimatedTraffic * (conversionRate / 100))
    
    // Growth opportunity (if visibility improved to 70%)
    const potentialVisibility = 70
    const potentialMentions = Math.round((potentialVisibility / 100) * total)
    const potentialTraffic = potentialMentions * visitsPerMention
    const growthPotential = Math.max(0, potentialTraffic - estimatedTraffic)

    // Timeline data
    const timeline = {}
    results.forEach(r => {
      const date = new Date(r.created_at).toISOString().split('T')[0]
      if (!timeline[date]) timeline[date] = { total: 0, mentioned: 0 }
      timeline[date].total++
      if (r.mention_type && r.mention_type !== 'notMentioned') timeline[date].mentioned++
    })
    const timelineData = Object.entries(timeline)
      .map(([date, data]) => ({ 
        date, 
        value: Math.round(data.mentioned * visitsPerMention * valuePerVisit)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { 
      visibilityRate, 
      estimatedTraffic, 
      estimatedValue, 
      estimatedLeads, 
      growthPotential,
      timelineData,
      mentioned,
      total
    }
  }, [results])

  if (results.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.dollar}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No ROI Data</h3>
        <p className="text-[14px] text-white/40">Run tracking to estimate your AI-driven traffic value</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white">ROI Estimates</h2>
        <p className="text-[14px] text-white/40 mt-1">Conservative projections based on your AI visibility</p>
      </div>

      {/* Methodology Note - Prominent */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <span className="text-amber-400/60 mt-0.5">{Icons.info}</span>
          <div>
            <h4 className="text-[13px] font-medium text-amber-400 mb-1">How we calculate these estimates</h4>
            <p className="text-[12px] text-white/50 leading-relaxed">
              Based on {metrics.mentioned} mentions across {metrics.total} AI queries. 
              We estimate <span className="text-white/70">10 visits per mention</span> (industry avg: 5-15), 
              valued at <span className="text-white/70">$2.50/visit</span> (comparable to PPC cost), 
              with <span className="text-white/70">2.5% conversion rate</span>. 
              These are directional estimates for planning purposes, not guarantees.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Est. Monthly Traffic" 
          value={metrics.estimatedTraffic.toLocaleString()} 
          icon={Icons.trendUp}
          color="amber"
          subtitle="from AI referrals"
          note="10 visits per AI mention"
        />
        <MetricCard 
          label="Est. Traffic Value" 
          value={`$${metrics.estimatedValue.toLocaleString()}`} 
          icon={Icons.dollar}
          color="green"
          subtitle="per month"
          note="$2.50 CPC equivalent"
        />
        <MetricCard 
          label="Est. Leads" 
          value={metrics.estimatedLeads.toLocaleString()} 
          icon={Icons.users}
          color="blue"
          subtitle="potential contacts"
          note="2.5% conversion rate"
        />
        <MetricCard 
          label="Growth Potential" 
          value={`+${metrics.growthPotential.toLocaleString()}`} 
          icon={Icons.trendUp}
          color="amber"
          subtitle="additional visits/mo"
          note="If visibility reached 70%"
        />
      </div>

      {/* Value Over Time */}
      {metrics.timelineData.length > 1 && (
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 mb-5">Estimated Traffic Value Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={metrics.timelineData}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.06)" 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                tickFormatter={v => v.slice(5)} 
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.06)" 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                tickFormatter={v => `$${v}`}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#valueGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Growth Opportunity */}
      <Card className="border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
            {Icons.lightbulb}
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-medium text-white mb-2">Growth Opportunity</h3>
            <p className="text-[13px] text-white/50 mb-4">
              Your current visibility is <span className="text-amber-400 font-medium">{metrics.visibilityRate}%</span>. 
              Improving to 70% could generate an additional{' '}
              <span className="text-amber-400 font-medium">{metrics.growthPotential.toLocaleString()} monthly visits</span>{' '}
              worth approximately{' '}
              <span className="text-emerald-400 font-medium">${(metrics.growthPotential * 2.50).toLocaleString()}/month</span>.
            </p>
            <div className="p-4 rounded-lg bg-white/[0.02]">
              <div className="flex justify-between mb-2">
                <span className="text-[12px] text-white/40">Current ({metrics.visibilityRate}%)</span>
                <span className="text-[12px] text-white/40">Target (70%)</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${Math.min(100, (metrics.visibilityRate / 70) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="text-[11px] text-white/30 text-center px-8">
        These estimates are based on industry benchmarks and your AI visibility data. 
        Actual traffic and value will vary based on your specific audience, content quality, and conversion optimization. 
        Use these figures for directional planning, not as guaranteed outcomes.
      </div>
    </div>
  )
}
