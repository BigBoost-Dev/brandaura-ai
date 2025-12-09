import React, { useState, useMemo } from 'react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid
} from 'recharts'
import { MENTION_TYPES, AI_PLATFORMS } from '../lib/constants'

// Color palette for competitors
const COMPETITOR_COLORS = ['#f97316', '#ec4899', '#14b8a6', '#8b5cf6', '#f59e0b']

export default function CompetitorDashboard({ 
  results, 
  brand, 
  competitors = [],
  timeRange = '30d'
}) {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // overview, head-to-head, trends

  // Calculate comprehensive competitor metrics
  const competitorMetrics = useMemo(() => {
    if (!results || results.length === 0) return null

    const totalTests = results.length

    // Calculate your brand metrics
    const yourMentions = results.filter(r => r.brand_mention !== 'notMentioned')
    const yourScores = results.map(r => MENTION_TYPES[r.brand_mention]?.score || 0)
    const yourScore = Math.round(yourScores.reduce((a, b) => a + b, 0) / yourScores.length)
    const yourLeaderCount = results.filter(r => r.brand_mention === 'leader').length

    // Calculate competitor metrics
    const competitorData = competitors.map((comp, index) => {
      const compName = comp.name || comp
      
      // Extract competitor mentions from each result
      const mentions = results.filter(r => {
        const compMentions = r.competitor_mentions || {}
        return compMentions[compName] && compMentions[compName] !== 'notMentioned'
      })

      // Calculate score based on mention types
      const scores = results.map(r => {
        const compMentions = r.competitor_mentions || {}
        return MENTION_TYPES[compMentions[compName]]?.score || 0
      }).filter(s => s > 0)

      const score = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0

      // Count leader mentions
      const leaderCount = results.filter(r => {
        const compMentions = r.competitor_mentions || {}
        return compMentions[compName] === 'leader'
      }).length

      // Per-platform breakdown
      const byPlatform = {}
      Object.keys(AI_PLATFORMS).forEach(pid => {
        const platformResults = results.filter(r => r.platform_id === pid)
        const platformMentions = platformResults.filter(r => {
          const compMentions = r.competitor_mentions || {}
          return compMentions[compName] && compMentions[compName] !== 'notMentioned'
        })
        byPlatform[pid] = {
          mentions: platformMentions.length,
          total: platformResults.length
        }
      })

      // Timeline data
      const dailyData = {}
      results.forEach(r => {
        const day = (r.created_at || r.timestamp)?.slice(0, 10)
        const compMentions = r.competitor_mentions || {}
        if (day) {
          if (!dailyData[day]) dailyData[day] = { mentions: 0, total: 0, score: 0, scoreCount: 0 }
          dailyData[day].total++
          if (compMentions[compName] && compMentions[compName] !== 'notMentioned') {
            dailyData[day].mentions++
            dailyData[day].score += MENTION_TYPES[compMentions[compName]]?.score || 0
            dailyData[day].scoreCount++
          }
        }
      })

      const timeline = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          score: data.scoreCount > 0 ? Math.round(data.score / data.scoreCount) : 0,
          mentionRate: Math.round(data.mentions / data.total * 100)
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        name: compName,
        score,
        mentionCount: mentions.length,
        mentionRate: ((mentions.length / totalTests) * 100).toFixed(1),
        leaderCount,
        byPlatform,
        timeline,
        color: COMPETITOR_COLORS[index % COMPETITOR_COLORS.length]
      }
    })

    // Calculate total mentions for SOV
    const totalMentions = yourMentions.length + 
      competitorData.reduce((sum, c) => sum + c.mentionCount, 0)

    // Share of Voice data
    const sovData = [
      {
        name: brand?.name || 'Your Brand',
        mentions: yourMentions.length,
        share: totalMentions > 0 ? Math.round(yourMentions.length / totalMentions * 100) : 0,
        color: '#818cf8',
        isYou: true
      },
      ...competitorData.map(c => ({
        name: c.name,
        mentions: c.mentionCount,
        share: totalMentions > 0 ? Math.round(c.mentionCount / totalMentions * 100) : 0,
        color: c.color,
        isYou: false
      }))
    ]

    // Build timeline with all brands
    const allDates = new Set()
    results.forEach(r => {
      const day = (r.created_at || r.timestamp)?.slice(0, 10)
      if (day) allDates.add(day)
    })

    // Your brand timeline
    const yourTimeline = {}
    results.forEach(r => {
      const day = (r.created_at || r.timestamp)?.slice(0, 10)
      if (day) {
        if (!yourTimeline[day]) yourTimeline[day] = { scores: [], total: 0 }
        yourTimeline[day].scores.push(MENTION_TYPES[r.brand_mention]?.score || 0)
        yourTimeline[day].total++
      }
    })

    const combinedTimeline = Array.from(allDates).sort().map(date => {
      const entry = { date }
      
      // Your brand
      if (yourTimeline[date]) {
        entry[brand?.name || 'You'] = Math.round(
          yourTimeline[date].scores.reduce((a, b) => a + b, 0) / yourTimeline[date].scores.length
        )
      } else {
        entry[brand?.name || 'You'] = 0
      }

      // Competitors
      competitorData.forEach(c => {
        const dayData = c.timeline.find(t => t.date === date)
        entry[c.name] = dayData?.score || 0
      })

      return entry
    }).slice(-30)

    // Market position ranking
    const allBrands = [
      { name: brand?.name || 'Your Brand', score: yourScore, isYou: true, color: '#818cf8' },
      ...competitorData.map(c => ({ name: c.name, score: c.score, isYou: false, color: c.color }))
    ].sort((a, b) => b.score - a.score)

    const yourRank = allBrands.findIndex(b => b.isYou) + 1

    return {
      yourBrand: {
        name: brand?.name || 'Your Brand',
        score: yourScore,
        mentionCount: yourMentions.length,
        mentionRate: ((yourMentions.length / totalTests) * 100).toFixed(1),
        leaderCount: yourLeaderCount
      },
      competitors: competitorData,
      sovData,
      combinedTimeline,
      allBrands,
      yourRank,
      totalBrands: allBrands.length
    }
  }, [results, brand, competitors])

  if (!competitorMetrics) {
    return (
      <div className="text-center py-20 text-white/40">
        <div className="text-6xl mb-4">⚔️</div>
        <p>No competitor data available. Add competitors and run tests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Competitive Intelligence</h2>
          <p className="text-white/50 text-sm mt-1">
            Track and compare your AI visibility against {competitors.length} competitor{competitors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {['overview', 'head-to-head', 'trends'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                viewMode === mode
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Market Position Banner */}
      <div className={`card p-6 ${
        competitorMetrics.yourRank === 1 
          ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/20' 
          : competitorMetrics.yourRank <= 3 
          ? 'bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20'
          : 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">
              {competitorMetrics.yourRank === 1 ? '🏆' : competitorMetrics.yourRank === 2 ? '🥈' : competitorMetrics.yourRank === 3 ? '🥉' : '📊'}
            </div>
            <div>
              <div className="text-sm text-white/60">Your Market Position</div>
              <div className="text-3xl font-bold">
                #{competitorMetrics.yourRank} <span className="text-lg text-white/50">of {competitorMetrics.totalBrands}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Your Visibility Score</div>
            <div className="text-3xl font-bold text-primary-400">{competitorMetrics.yourBrand.score}%</div>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Share of Voice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Share of Voice</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={competitorMetrics.sovData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="share"
                  >
                    {competitorMetrics.sovData.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.color}
                        stroke={entry.isYou ? '#fff' : 'transparent'}
                        strokeWidth={entry.isYou ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1a1a2e', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value, name, props) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {competitorMetrics.sovData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-sm ${item.isYou ? 'font-medium text-white' : 'text-white/70'}`}>
                        {item.name}
                      </span>
                      {item.isYou && (
                        <span className="text-xs text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded">You</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold">{item.share}%</span>
                      <span className="text-white/40 text-sm ml-2">({item.mentions})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking Table */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Market Ranking</h3>
              <div className="space-y-3">
                {competitorMetrics.allBrands.map((brand, index) => (
                  <div 
                    key={brand.name}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      brand.isYou ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={brand.isYou ? 'font-semibold' : ''}>{brand.name}</span>
                        {brand.isYou && (
                          <span className="text-xs text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded">You</span>
                        )}
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${brand.score}%`, backgroundColor: brand.color }}
                      />
                    </div>
                    <div className="w-16 text-right font-mono font-bold" style={{ color: brand.color }}>
                      {brand.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competitor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorMetrics.competitors.map(comp => {
              const diff = competitorMetrics.yourBrand.score - comp.score
              return (
                <div 
                  key={comp.name}
                  className="card p-5 hover:border-white/20 transition cursor-pointer"
                  onClick={() => {
                    setSelectedCompetitor(comp.name)
                    setViewMode('head-to-head')
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: comp.color }}
                    >
                      {comp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{comp.name}</div>
                      <div className="text-sm text-white/50">{comp.mentionCount} mentions</div>
                    </div>
                    <div className={`text-lg font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/50'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold font-mono" style={{ color: comp.color }}>{comp.score}%</div>
                      <div className="text-xs text-white/40">Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono">{comp.mentionRate}%</div>
                      <div className="text-xs text-white/40">Mention Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-yellow-400">{comp.leaderCount}</div>
                      <div className="text-xs text-white/40">Top Picks</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {viewMode === 'head-to-head' && (
        <HeadToHeadView 
          yourBrand={competitorMetrics.yourBrand}
          competitors={competitorMetrics.competitors}
          selectedCompetitor={selectedCompetitor}
          onSelectCompetitor={setSelectedCompetitor}
          results={results}
        />
      )}

      {viewMode === 'trends' && (
        <TrendsView 
          timeline={competitorMetrics.combinedTimeline}
          yourBrand={competitorMetrics.yourBrand}
          competitors={competitorMetrics.competitors}
        />
      )}
    </div>
  )
}

// Head-to-Head Comparison View
function HeadToHeadView({ yourBrand, competitors, selectedCompetitor, onSelectCompetitor, results }) {
  const competitor = competitors.find(c => c.name === selectedCompetitor) || competitors[0]
  
  if (!competitor) {
    return (
      <div className="text-center py-10 text-white/40">
        No competitors to compare
      </div>
    )
  }

  const comparisonData = [
    { metric: 'Visibility Score', you: yourBrand.score, them: competitor.score, unit: '%' },
    { metric: 'Mention Rate', you: parseFloat(yourBrand.mentionRate), them: parseFloat(competitor.mentionRate), unit: '%' },
    { metric: 'Total Mentions', you: yourBrand.mentionCount, them: competitor.mentionCount, unit: '' },
    { metric: 'Top Picks', you: yourBrand.leaderCount, them: competitor.leaderCount, unit: '' }
  ]

  return (
    <div className="space-y-6">
      {/* Competitor Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {competitors.map(comp => (
          <button
            key={comp.name}
            onClick={() => onSelectCompetitor(comp.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              comp.name === competitor.name
                ? 'text-white border-2'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border-2 border-transparent'
            }`}
            style={{ 
              borderColor: comp.name === competitor.name ? comp.color : 'transparent',
              backgroundColor: comp.name === competitor.name ? `${comp.color}20` : undefined
            }}
          >
            {comp.name}
          </button>
        ))}
      </div>

      {/* Comparison Header */}
      <div className="card p-6">
        <div className="grid grid-cols-3 gap-8 items-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold text-primary-400">
                {yourBrand.name?.charAt(0) || 'Y'}
              </span>
            </div>
            <div className="font-semibold">{yourBrand.name}</div>
            <div className="text-xs text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded inline-block mt-1">You</div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl mb-2">⚔️</div>
            <div className="text-white/50 text-sm">vs</div>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${competitor.color}30` }}
            >
              <span className="text-3xl font-bold" style={{ color: competitor.color }}>
                {competitor.name.charAt(0)}
              </span>
            </div>
            <div className="font-semibold">{competitor.name}</div>
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="space-y-4">
        {comparisonData.map(item => {
          const diff = item.you - item.them
          const maxValue = Math.max(item.you, item.them, 1)
          
          return (
            <div key={item.metric} className="card p-5">
              <div className="text-center text-white/60 text-sm mb-4">{item.metric}</div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-right">
                  <div className="text-3xl font-bold font-mono text-primary-400">
                    {item.you}{item.unit}
                  </div>
                </div>
                
                <div className="relative h-8">
                  {/* You (left) */}
                  <div 
                    className="absolute right-1/2 h-full rounded-l-full bg-primary-500/60"
                    style={{ width: `${(item.you / maxValue) * 50}%` }}
                  />
                  {/* Them (right) */}
                  <div 
                    className="absolute left-1/2 h-full rounded-r-full"
                    style={{ 
                      width: `${(item.them / maxValue) * 50}%`,
                      backgroundColor: `${competitor.color}99`
                    }}
                  />
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
                </div>
                
                <div className="text-left">
                  <div className="text-3xl font-bold font-mono" style={{ color: competitor.color }}>
                    {item.them}{item.unit}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <span className={`text-sm font-medium ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/50'}`}>
                  {diff > 0 ? `You lead by ${diff}${item.unit}` : diff < 0 ? `Behind by ${Math.abs(diff)}${item.unit}` : 'Tied'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Platform Breakdown */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Performance by Platform</h3>
        <div className="space-y-4">
          {Object.entries(competitor.byPlatform).map(([pid, data]) => {
            const platform = AI_PLATFORMS[pid]
            if (!platform) return null
            
            return (
              <div key={pid} className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                >
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{platform.name}</div>
                  <div className="text-xs text-white/40">
                    {data.mentions} / {data.total} mentions
                  </div>
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: data.total > 0 ? `${(data.mentions / data.total) * 100}%` : '0%',
                      backgroundColor: competitor.color 
                    }}
                  />
                </div>
                <div className="w-16 text-right font-mono text-sm">
                  {data.total > 0 ? ((data.mentions / data.total) * 100).toFixed(0) : 0}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Trends View
function TrendsView({ timeline, yourBrand, competitors }) {
  const allKeys = [yourBrand.name, ...competitors.map(c => c.name)]
  const colors = ['#818cf8', ...competitors.map(c => c.color)]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Visibility Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
                borderRadius: '8px' 
              }}
              formatter={(value) => [`${value}%`, 'Score']}
            />
            <Legend />
            {allKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index]}
                strokeWidth={key === yourBrand.name ? 3 : 2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ ...yourBrand, color: '#818cf8', isYou: true }, ...competitors.map(c => ({ ...c, isYou: false }))].map(brand => {
          // Calculate trend from timeline
          const brandData = timeline.map(t => t[brand.name]).filter(v => v > 0)
          const recent = brandData.slice(-7)
          const older = brandData.slice(-14, -7)
          const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
          const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0
          const trend = Math.round(recentAvg - olderAvg)

          return (
            <div 
              key={brand.name}
              className={`card p-4 ${brand.isYou ? 'border-primary-500/30' : ''}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: brand.color }}
                />
                <span className="font-medium text-sm truncate">{brand.name}</span>
                {brand.isYou && (
                  <span className="text-xs text-primary-400 bg-primary-500/20 px-1.5 py-0.5 rounded">You</span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono" style={{ color: brand.color }}>
                  {brand.score}%
                </span>
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-white/50'}`}>
                  {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
                </span>
              </div>
              <div className="text-xs text-white/40 mt-1">7-day trend</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
