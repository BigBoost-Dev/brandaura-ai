import React, { useState, useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MENTION_TYPES, AI_PLATFORMS } from '../lib/constants'

// Color palette
const COLORS = {
  primary: '#818cf8',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#22d3ee',
  purple: '#a78bfa',
  neutral: '#6b7280'
}

// Sentiment colors
const SENTIMENT_COLORS = {
  positive: '#4ade80',
  neutral: '#6b7280',
  negative: '#f87171'
}

export default function VisibilityDashboard({ 
  results, 
  brand, 
  competitors = [], 
  timeRange = '30d',
  onTimeRangeChange 
}) {
  const [activeView, setActiveView] = useState('overview')

  // Calculate all metrics from results
  const metrics = useMemo(() => {
    if (!results || results.length === 0) return null

    // Basic counts
    const totalTests = results.length
    const mentions = results.filter(r => r.brand_mention !== 'notMentioned')
    const mentionRate = (mentions.length / totalTests * 100).toFixed(1)

    // Mention type distribution
    const mentionDist = {}
    Object.keys(MENTION_TYPES).forEach(type => {
      mentionDist[type] = results.filter(r => r.brand_mention === type).length
    })

    // Visibility score
    const scores = results.map(r => MENTION_TYPES[r.brand_mention]?.score || 0)
    const visibilityScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    // Sentiment analysis (derive from mention types)
    const sentimentData = {
      positive: mentionDist.leader + mentionDist.recommended,
      neutral: mentionDist.mentioned + mentionDist.alternative + mentionDist.notMentioned,
      negative: mentionDist.negative || 0
    }

    // Citation tracking (URLs in responses)
    const citationCount = results.filter(r => 
      r.cited_urls?.length > 0 || r.snippet?.includes('http')
    ).length

    // Per-platform breakdown
    const byPlatform = {}
    Object.keys(AI_PLATFORMS).forEach(pid => {
      const platformResults = results.filter(r => r.platform_id === pid)
      if (platformResults.length > 0) {
        const pScores = platformResults.map(r => MENTION_TYPES[r.brand_mention]?.score || 0)
        byPlatform[pid] = {
          score: Math.round(pScores.reduce((a, b) => a + b, 0) / pScores.length),
          tests: platformResults.length,
          mentions: platformResults.filter(r => r.brand_mention !== 'notMentioned').length,
          leader: platformResults.filter(r => r.brand_mention === 'leader').length
        }
      }
    })

    // Timeline data (group by date)
    const dailyData = {}
    results.forEach(r => {
      const day = (r.created_at || r.timestamp)?.slice(0, 10)
      if (day) {
        if (!dailyData[day]) dailyData[day] = { scores: [], mentions: 0, total: 0 }
        dailyData[day].scores.push(MENTION_TYPES[r.brand_mention]?.score || 0)
        dailyData[day].total++
        if (r.brand_mention !== 'notMentioned') dailyData[day].mentions++
      }
    })

    const timeline = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        mentions: data.mentions,
        tests: data.total,
        mentionRate: Math.round(data.mentions / data.total * 100)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    // Competitor comparison
    const competitorScores = {}
    competitors.forEach(comp => {
      const compName = comp.name || comp
      const compMentions = results.filter(r => {
        const mentions = r.competitor_mentions || {}
        return mentions[compName] && mentions[compName] !== 'notMentioned'
      })
      
      const compScoreValues = results.map(r => {
        const mentions = r.competitor_mentions || {}
        return MENTION_TYPES[mentions[compName]]?.score || 0
      }).filter(s => s > 0)

      competitorScores[compName] = {
        score: compScoreValues.length > 0 
          ? Math.round(compScoreValues.reduce((a, b) => a + b, 0) / compScoreValues.length)
          : 0,
        mentionCount: compMentions.length,
        mentionRate: (compMentions.length / totalTests * 100).toFixed(1)
      }
    })

    // Share of Voice calculation
    const totalMentions = mentions.length + 
      Object.values(competitorScores).reduce((sum, c) => sum + c.mentionCount, 0)
    
    const shareOfVoice = totalMentions > 0 
      ? Math.round(mentions.length / totalMentions * 100)
      : 0

    // Trend calculation (vs previous period)
    const midpoint = Math.floor(timeline.length / 2)
    const recentScores = timeline.slice(midpoint).map(t => t.score)
    const olderScores = timeline.slice(0, midpoint).map(t => t.score)
    
    const recentAvg = recentScores.length > 0 
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
      : 0
    const olderAvg = olderScores.length > 0 
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length 
      : 0
    const trend = Math.round(recentAvg - olderAvg)

    return {
      visibilityScore,
      totalTests,
      mentionCount: mentions.length,
      mentionRate,
      citationCount,
      mentionDist,
      sentimentData,
      byPlatform,
      timeline,
      competitorScores,
      shareOfVoice,
      trend
    }
  }, [results, competitors])

  if (!metrics) {
    return (
      <div className="text-center py-20 text-white/40">
        <div className="text-6xl mb-4">📊</div>
        <p>No data available. Run tests to see visibility metrics.</p>
      </div>
    )
  }

  // Prepare chart data
  const mentionTypeData = Object.entries(metrics.mentionDist)
    .filter(([_, value]) => value > 0)
    .map(([type, value]) => ({
      name: MENTION_TYPES[type]?.label || type,
      value,
      color: MENTION_TYPES[type]?.color || COLORS.neutral
    }))

  const sentimentPieData = [
    { name: 'Positive', value: metrics.sentimentData.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: metrics.sentimentData.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: metrics.sentimentData.negative, color: SENTIMENT_COLORS.negative }
  ].filter(d => d.value > 0)

  const platformBarData = Object.entries(metrics.byPlatform).map(([pid, data]) => ({
    name: AI_PLATFORMS[pid]?.name || pid,
    score: data.score,
    mentions: data.mentions,
    color: AI_PLATFORMS[pid]?.color || COLORS.neutral
  }))

  const sovData = [
    { name: brand?.name || 'Your Brand', value: metrics.mentionCount, color: COLORS.primary },
    ...Object.entries(metrics.competitorScores).map(([name, data], i) => ({
      name,
      value: data.mentionCount,
      color: ['#f97316', '#ec4899', '#14b8a6', '#8b5cf6'][i % 4]
    }))
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI Visibility Intelligence</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map(range => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Visibility Score"
          value={`${metrics.visibilityScore}%`}
          trend={metrics.trend}
          icon="📊"
          color={COLORS.primary}
        />
        <MetricCard
          title="Share of Voice"
          value={`${metrics.shareOfVoice}%`}
          subtitle="vs competitors"
          icon="📢"
          color={COLORS.info}
        />
        <MetricCard
          title="Mention Rate"
          value={`${metrics.mentionRate}%`}
          subtitle={`${metrics.mentionCount}/${metrics.totalTests}`}
          icon="💬"
          color={COLORS.success}
        />
        <MetricCard
          title="Top Picks"
          value={metrics.mentionDist.leader}
          subtitle={`${((metrics.mentionDist.leader / metrics.totalTests) * 100).toFixed(0)}%`}
          icon="🏆"
          color={COLORS.warning}
        />
        <MetricCard
          title="Citations"
          value={metrics.citationCount}
          subtitle="URL references"
          icon="🔗"
          color={COLORS.purple}
        />
        <MetricCard
          title="Total Tests"
          value={metrics.totalTests}
          icon="🧪"
          color={COLORS.neutral}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visibility Trend */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold mb-4">Visibility Over Time</h3>
          {metrics.timeline.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics.timeline}>
                <defs>
                  <linearGradient id="visGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.1)" 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
                  tickFormatter={v => v.slice(5)} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.1)" 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px' 
                  }} 
                  formatter={(value, name) => [
                    name === 'score' ? `${value}%` : value,
                    name === 'score' ? 'Visibility' : name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={COLORS.primary} 
                  fill="url(#visGradient)" 
                  strokeWidth={2.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/30">
              Run more tests to see trends
            </div>
          )}
        </div>

        {/* Sentiment Analysis */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Sentiment Analysis</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {sentimentPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1a2e', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {sentimentPieData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-white/60">{item.name}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Performance by Platform</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformBarData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1a2e', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px' 
                }}
                formatter={(value) => [`${value}%`, 'Score']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {platformBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Share of Voice */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Share of Voice</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sovData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sovData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1a2e', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px' 
                }}
                formatter={(value) => [`${value} mentions`, 'Mentions']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sovData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/70 text-sm">{item.name}</span>
                </div>
                <span className="font-mono font-medium text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mention Type Distribution */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Mention Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(MENTION_TYPES).map(([type, config]) => {
            const count = metrics.mentionDist[type] || 0
            const percentage = ((count / metrics.totalTests) * 100).toFixed(1)
            return (
              <div 
                key={type}
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: `${config.color}15`, borderColor: `${config.color}30`, borderWidth: 1 }}
              >
                <div className="text-2xl mb-2">{config.emoji}</div>
                <div className="text-2xl font-bold font-mono" style={{ color: config.color }}>
                  {count}
                </div>
                <div className="text-sm text-white/50">{config.label}</div>
                <div className="text-xs text-white/30">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Competitor Comparison Table */}
      {competitors.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Competitor Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/50 text-sm border-b border-white/10">
                  <th className="pb-3 pr-4">Brand</th>
                  <th className="pb-3 px-4">Visibility Score</th>
                  <th className="pb-3 px-4">Mention Rate</th>
                  <th className="pb-3 px-4">Mentions</th>
                  <th className="pb-3 pl-4">vs You</th>
                </tr>
              </thead>
              <tbody>
                {/* Your brand */}
                <tr className="border-b border-white/5 bg-primary-500/5">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{brand?.name}</span>
                      <span className="text-xs text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded">You</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-primary-400">{metrics.visibilityScore}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono">{metrics.mentionRate}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono">{metrics.mentionCount}</span>
                  </td>
                  <td className="py-3 pl-4">—</td>
                </tr>
                
                {/* Competitors */}
                {Object.entries(metrics.competitorScores).map(([name, data]) => {
                  const diff = metrics.visibilityScore - data.score
                  return (
                    <tr key={name} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white/80">{name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono">{data.score}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono">{data.mentionRate}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono">{data.mentionCount}</span>
                      </td>
                      <td className="py-3 pl-4">
                        <span className={`font-mono font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/50'}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, subtitle, trend, icon, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white/50 text-xs truncate">{title}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono" style={{ color }}>
              {value}
            </span>
            {trend !== undefined && trend !== 0 && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-white/40 text-xs">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  )
}
