import React, { useState, useMemo } from 'react'
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid
} from 'recharts'
import { MENTION_TYPES, AI_PLATFORMS, SEARCH_INTENTS } from '../lib/constants'

// Color palette
const TOPIC_COLORS = [
  '#818cf8', '#22d3ee', '#4ade80', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
]

export default function TopicPerformance({ 
  results, 
  topics = [], 
  brand,
  competitors = []
}) {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [sortBy, setSortBy] = useState('score') // score, mentions, trend
  const [sortOrder, setSortOrder] = useState('desc')

  // Calculate topic-level metrics
  const topicMetrics = useMemo(() => {
    if (!results || results.length === 0) return []

    // If we have topics defined, use them; otherwise extract from results
    const topicList = topics.length > 0 
      ? topics 
      : extractTopicsFromResults(results)

    return topicList.map((topic, index) => {
      const topicName = typeof topic === 'string' ? topic : topic.name
      
      // Filter results for this topic (match by query containing topic keywords)
      const topicResults = results.filter(r => {
        const query = (r.query || '').toLowerCase()
        const topicLower = topicName.toLowerCase()
        // Check if query relates to this topic
        return query.includes(topicLower) || 
               topicLower.split(' ').some(word => query.includes(word))
      })

      if (topicResults.length === 0) {
        return {
          id: topic.id || `topic-${index}`,
          name: topicName,
          score: 0,
          mentionCount: 0,
          mentionRate: 0,
          leaderCount: 0,
          trend: 0,
          tests: 0,
          color: TOPIC_COLORS[index % TOPIC_COLORS.length],
          byPlatform: {},
          timeline: [],
          prompts: topic.prompts || []
        }
      }

      // Calculate metrics
      const scores = topicResults.map(r => MENTION_TYPES[r.brand_mention]?.score || 0)
      const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const mentions = topicResults.filter(r => r.brand_mention !== 'notMentioned')
      const leaderCount = topicResults.filter(r => r.brand_mention === 'leader').length

      // Per-platform breakdown
      const byPlatform = {}
      Object.keys(AI_PLATFORMS).forEach(pid => {
        const platformResults = topicResults.filter(r => r.platform_id === pid)
        if (platformResults.length > 0) {
          const pScores = platformResults.map(r => MENTION_TYPES[r.brand_mention]?.score || 0)
          byPlatform[pid] = {
            score: Math.round(pScores.reduce((a, b) => a + b, 0) / pScores.length),
            mentions: platformResults.filter(r => r.brand_mention !== 'notMentioned').length,
            total: platformResults.length
          }
        }
      })

      // Timeline data
      const dailyData = {}
      topicResults.forEach(r => {
        const day = (r.created_at || r.timestamp)?.slice(0, 10)
        if (day) {
          if (!dailyData[day]) dailyData[day] = { scores: [], total: 0 }
          dailyData[day].scores.push(MENTION_TYPES[r.brand_mention]?.score || 0)
          dailyData[day].total++
        }
      })

      const timeline = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Calculate trend
      const midpoint = Math.floor(timeline.length / 2)
      const recent = timeline.slice(midpoint).map(t => t.score)
      const older = timeline.slice(0, midpoint).map(t => t.score)
      const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0
      const trend = Math.round(recentAvg - olderAvg)

      // Competitor performance on this topic
      const competitorScores = {}
      competitors.forEach(comp => {
        const compName = comp.name || comp
        const compMentions = topicResults.filter(r => {
          const mentions = r.competitor_mentions || {}
          return mentions[compName] && mentions[compName] !== 'notMentioned'
        })
        competitorScores[compName] = {
          mentionCount: compMentions.length,
          mentionRate: ((compMentions.length / topicResults.length) * 100).toFixed(1)
        }
      })

      return {
        id: topic.id || `topic-${index}`,
        name: topicName,
        score,
        mentionCount: mentions.length,
        mentionRate: ((mentions.length / topicResults.length) * 100).toFixed(1),
        leaderCount,
        trend,
        tests: topicResults.length,
        color: TOPIC_COLORS[index % TOPIC_COLORS.length],
        byPlatform,
        timeline,
        competitorScores,
        prompts: topic.prompts || []
      }
    }).filter(t => t.tests > 0) // Only show topics with results
  }, [results, topics, competitors])

  // Sort topics
  const sortedTopics = useMemo(() => {
    return [...topicMetrics].sort((a, b) => {
      const aVal = a[sortBy] || 0
      const bVal = b[sortBy] || 0
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })
  }, [topicMetrics, sortBy, sortOrder])

  // Get selected topic details
  const selectedTopicData = selectedTopic 
    ? topicMetrics.find(t => t.id === selectedTopic)
    : null

  if (topicMetrics.length === 0) {
    return (
      <div className="text-center py-20 text-white/40">
        <div className="text-6xl mb-4">🎯</div>
        <p>No topic data available. Configure topics and run tests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Topic Performance</h2>
          <p className="text-white/50 text-sm mt-1">
            Tracking {topicMetrics.length} topic{topicMetrics.length !== 1 ? 's' : ''} across AI platforms
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-white/50 text-sm">Best Performing</div>
          <div className="text-lg font-bold mt-1 truncate">
            {sortedTopics[0]?.name || 'N/A'}
          </div>
          <div className="text-2xl font-mono font-bold mt-1" style={{ color: sortedTopics[0]?.color }}>
            {sortedTopics[0]?.score || 0}%
          </div>
        </div>
        <div className="card p-4">
          <div className="text-white/50 text-sm">Needs Attention</div>
          <div className="text-lg font-bold mt-1 truncate">
            {sortedTopics[sortedTopics.length - 1]?.name || 'N/A'}
          </div>
          <div className="text-2xl font-mono font-bold text-red-400 mt-1">
            {sortedTopics[sortedTopics.length - 1]?.score || 0}%
          </div>
        </div>
        <div className="card p-4">
          <div className="text-white/50 text-sm">Avg Topic Score</div>
          <div className="text-3xl font-mono font-bold text-primary-400 mt-2">
            {topicMetrics.length > 0 
              ? Math.round(topicMetrics.reduce((sum, t) => sum + t.score, 0) / topicMetrics.length)
              : 0}%
          </div>
        </div>
        <div className="card p-4">
          <div className="text-white/50 text-sm">Topics Trending Up</div>
          <div className="text-3xl font-mono font-bold text-green-400 mt-2">
            {topicMetrics.filter(t => t.trend > 0).length}
          </div>
        </div>
      </div>

      {/* Topic Performance Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Topic Visibility Scores</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, sortedTopics.length * 40)}>
          <BarChart data={sortedTopics} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={150}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#1a1a2e', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px' 
              }}
              formatter={(value, name, props) => {
                const topic = props.payload
                return [
                  <div key="tooltip" className="space-y-1">
                    <div>Score: {value}%</div>
                    <div>Mentions: {topic.mentionCount} ({topic.mentionRate}%)</div>
                    <div>Tests: {topic.tests}</div>
                  </div>,
                  ''
                ]
              }}
            />
            <Bar 
              dataKey="score" 
              radius={[0, 4, 4, 0]}
              onClick={(data) => setSelectedTopic(data.id)}
              cursor="pointer"
            >
              {sortedTopics.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={entry.color}
                  opacity={selectedTopic && selectedTopic !== entry.id ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Topic Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">All Topics</h3>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm"
            >
              <option value="score">Sort by Score</option>
              <option value="mentionCount">Sort by Mentions</option>
              <option value="trend">Sort by Trend</option>
              <option value="tests">Sort by Tests</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-white/50 text-sm border-b border-white/10">
                <th className="pb-3 pr-4">Topic</th>
                <th className="pb-3 px-4">Score</th>
                <th className="pb-3 px-4">Mentions</th>
                <th className="pb-3 px-4">Top Picks</th>
                <th className="pb-3 px-4">Tests</th>
                <th className="pb-3 px-4">Trend</th>
                <th className="pb-3 pl-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTopics.map(topic => (
                <tr 
                  key={topic.id} 
                  className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                    selectedTopic === topic.id ? 'bg-primary-500/10' : ''
                  }`}
                  onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="font-medium truncate max-w-[200px]">{topic.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${topic.score}%`, backgroundColor: topic.color }}
                        />
                      </div>
                      <span className="font-mono font-bold" style={{ color: topic.color }}>
                        {topic.score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono">{topic.mentionCount}</span>
                    <span className="text-white/40 text-sm ml-1">({topic.mentionRate}%)</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-yellow-400">{topic.leaderCount}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-white/60">{topic.tests}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-medium ${
                      topic.trend > 0 ? 'text-green-400' : topic.trend < 0 ? 'text-red-400' : 'text-white/50'
                    }`}>
                      {topic.trend > 0 ? '↑' : topic.trend < 0 ? '↓' : '→'} {Math.abs(topic.trend)}
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <button 
                      className="text-primary-400 hover:text-primary-300 text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTopic(topic.id)
                      }}
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topic Detail Panel */}
      {selectedTopicData && (
        <TopicDetailPanel 
          topic={selectedTopicData}
          competitors={competitors}
          onClose={() => setSelectedTopic(null)}
        />
      )}
    </div>
  )
}

// Topic Detail Panel
function TopicDetailPanel({ topic, competitors, onClose }) {
  return (
    <div className="card p-6 border-2" style={{ borderColor: `${topic.color}40` }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: topic.color }}
          />
          <h3 className="text-xl font-bold">{topic.name}</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-white/40 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <div className="text-3xl font-bold font-mono" style={{ color: topic.color }}>
            {topic.score}%
          </div>
          <div className="text-sm text-white/50">Visibility Score</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <div className="text-3xl font-bold font-mono">{topic.mentionCount}</div>
          <div className="text-sm text-white/50">Mentions ({topic.mentionRate}%)</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <div className="text-3xl font-bold font-mono text-yellow-400">{topic.leaderCount}</div>
          <div className="text-sm text-white/50">Top Picks</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <div className={`text-3xl font-bold font-mono ${
            topic.trend > 0 ? 'text-green-400' : topic.trend < 0 ? 'text-red-400' : 'text-white/50'
          }`}>
            {topic.trend > 0 ? '+' : ''}{topic.trend}%
          </div>
          <div className="text-sm text-white/50">Trend</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div>
          <h4 className="font-semibold mb-3">Performance Over Time</h4>
          {topic.timeline.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={topic.timeline}>
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
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={topic.color} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-white/30">
              Need more data for trend
            </div>
          )}
        </div>

        {/* Platform Breakdown */}
        <div>
          <h4 className="font-semibold mb-3">By Platform</h4>
          <div className="space-y-3">
            {Object.entries(topic.byPlatform).map(([pid, data]) => {
              const platform = AI_PLATFORMS[pid]
              if (!platform) return null
              
              return (
                <div key={pid} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{platform.name}</div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${data.score}%`, backgroundColor: platform.color }}
                      />
                    </div>
                  </div>
                  <div className="font-mono text-sm" style={{ color: platform.color }}>
                    {data.score}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Competitor Comparison for this topic */}
      {competitors.length > 0 && Object.keys(topic.competitorScores).length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="font-semibold mb-3">Competitor Performance on This Topic</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(topic.competitorScores).map(([name, data]) => (
              <div key={name} className="p-3 bg-white/5 rounded-xl">
                <div className="text-sm text-white/60 truncate">{name}</div>
                <div className="text-xl font-mono font-bold mt-1">
                  {data.mentionCount}
                  <span className="text-sm text-white/40 ml-1">({data.mentionRate}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to extract topics from results if not defined
function extractTopicsFromResults(results) {
  const topicKeywords = new Set()
  
  results.forEach(r => {
    const query = (r.query || '').toLowerCase()
    // Extract meaningful phrases
    const words = query.split(/\s+/).filter(w => w.length > 3)
    words.forEach(word => {
      if (!['what', 'which', 'best', 'good', 'should', 'recommend'].includes(word)) {
        topicKeywords.add(word)
      }
    })
  })

  // Group similar keywords
  return Array.from(topicKeywords).slice(0, 20).map(keyword => ({
    id: `extracted-${keyword}`,
    name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
    prompts: []
  }))
}
