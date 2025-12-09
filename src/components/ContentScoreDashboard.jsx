import React, { useMemo, useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { calculateContentScore } from '../lib/aiAnalysis'

const GRADE_COLORS = {
  A: '#10b981',
  B: '#22d3ee',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444'
}

const SCORE_COLORS = {
  visibility: '#6366f1',
  authority: '#8b5cf6',
  sentiment: '#10b981',
  coverage: '#f59e0b',
  competitive: '#ec4899'
}

export default function ContentScoreDashboard({ results = [], brand, competitors = [] }) {
  const [selectedMetric, setSelectedMetric] = useState(null)

  // Calculate scores
  const score = useMemo(() => {
    if (results.length === 0) return null
    return calculateContentScore(results, brand)
  }, [results, brand])

  // Calculate trend (weekly scores)
  const scoreTrend = useMemo(() => {
    if (results.length === 0) return []

    // Group results by week
    const weeklyResults = {}
    results.forEach(r => {
      const date = new Date(r.created_at)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyResults[weekKey]) {
        weeklyResults[weekKey] = []
      }
      weeklyResults[weekKey].push(r)
    })

    // Calculate score for each week
    return Object.entries(weeklyResults)
      .map(([week, weekResults]) => {
        const weekScore = calculateContentScore(weekResults, brand)
        return {
          week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...weekScore.breakdown,
          overall: weekScore.overall
        }
      })
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8) // Last 8 weeks
  }, [results, brand])

  // Competitor comparison (if we have competitor data)
  const competitorScores = useMemo(() => {
    if (results.length === 0 || competitors.length === 0) return []

    // Estimate competitor scores based on their mention rates
    return competitors.slice(0, 5).map(comp => {
      const compName = comp.name || comp
      let mentions = 0, leaders = 0, total = 0

      results.forEach(r => {
        if (r.competitor_mentions && r.competitor_mentions[compName]) {
          total++
          if (r.competitor_mentions[compName] !== 'notMentioned') {
            mentions++
            if (r.competitor_mentions[compName] === 'leader') {
              leaders++
            }
          }
        }
      })

      const mentionRate = total > 0 ? mentions / total : 0
      const leaderRate = total > 0 ? leaders / total : 0
      const estimatedScore = Math.round(mentionRate * 60 + leaderRate * 40)

      return {
        name: compName,
        score: estimatedScore,
        mentionRate: Math.round(mentionRate * 100),
        leaderRate: Math.round(leaderRate * 100)
      }
    }).sort((a, b) => b.score - a.score)
  }, [results, competitors])

  // Radial chart data
  const radialData = useMemo(() => {
    if (!score) return []
    
    return [
      { name: 'Score', value: score.overall, fill: GRADE_COLORS[score.grade] }
    ]
  }, [score])

  // Breakdown pie data
  const breakdownData = useMemo(() => {
    if (!score) return []
    
    return Object.entries(score.breakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      key
    }))
  }, [score])

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold mb-2">No Score Data Yet</h3>
        <p className="text-white/60">Run tracking to calculate your AI discoverability score</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Discoverability Score</h2>
          <p className="text-white/60">How well AI can find and recommend your brand</p>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="card p-6 lg:col-span-1">
          <h3 className="font-semibold text-center mb-4">Overall Score</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="90%" 
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background={{ fill: '#1a1a1f' }}
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div 
                className="text-5xl font-bold"
                style={{ color: GRADE_COLORS[score?.grade] }}
              >
                {score?.overall}
              </div>
              <div 
                className="text-2xl font-bold mt-1"
                style={{ color: GRADE_COLORS[score?.grade] }}
              >
                Grade: {score?.grade}
              </div>
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-white/60">
            {score?.overall >= 80 ? 'Excellent! Your brand is highly discoverable by AI.' :
             score?.overall >= 60 ? 'Good performance. Room for improvement in some areas.' :
             score?.overall >= 40 ? 'Average. Several optimization opportunities available.' :
             'Needs work. Follow recommendations to improve visibility.'}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(score?.breakdown || {}).map(([key, value]) => {
              const descriptions = {
                visibility: 'How often AI mentions your brand',
                authority: 'Quality of mentions (leader, recommended, etc.)',
                sentiment: 'Positive vs negative brand perception',
                coverage: 'Topics where you\'re mentioned',
                competitive: 'Your performance vs competitors'
              }
              
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SCORE_COLORS[key] }}
                      />
                      <span className="font-medium capitalize">{key}</span>
                    </div>
                    <span className="font-bold" style={{ color: SCORE_COLORS[key] }}>
                      {value}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: SCORE_COLORS[key]
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{descriptions[key]}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Score Trend */}
      {scoreTrend.length > 1 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend}>
                <XAxis dataKey="week" stroke="#666" tick={{ fontSize: 11 }} />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1a1a1f', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  name="Overall Score"
                />
                {selectedMetric && (
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke={SCORE_COLORS[selectedMetric]} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            {Object.keys(score?.breakdown || {}).map(key => (
              <button
                key={key}
                onClick={() => setSelectedMetric(selectedMetric === key ? null : key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedMetric === key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={selectedMetric === key ? { borderColor: SCORE_COLORS[key] } : {}}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Comparison */}
      {competitorScores.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Competitor Comparison (Estimated)</h3>
          <div className="space-y-4">
            {/* Your brand */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
              <div className="w-12 text-center">
                <span className="text-lg font-bold text-primary-400">#{
                  [...competitorScores, { name: brand?.name, score: score?.overall }]
                    .sort((a, b) => b.score - a.score)
                    .findIndex(c => c.name === brand?.name) + 1
                }</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{brand?.name || 'Your Brand'}</div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${score?.overall}%` }}
                  />
                </div>
              </div>
              <div className="text-xl font-bold text-primary-400">{score?.overall}</div>
            </div>

            {/* Competitors */}
            {competitorScores.map((comp, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <div className="w-12 text-center">
                  <span className="text-lg font-bold text-white/50">#{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white/80">{comp.name}</div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-white/40 rounded-full"
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                </div>
                <div className="text-xl font-bold text-white/60">{comp.score}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-4 text-center">
            * Competitor scores are estimated based on their mention rates in tracked queries
          </p>
        </div>
      )}

      {/* Score Factors */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-400">✅</span> What's Working
          </h3>
          <ul className="space-y-2 text-sm">
            {score?.breakdown?.visibility >= 50 && (
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Good visibility - AI mentions you in {score.breakdown.visibility}% of queries</span>
              </li>
            )}
            {score?.breakdown?.authority >= 50 && (
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Strong authority - You're often recommended, not just mentioned</span>
              </li>
            )}
            {score?.breakdown?.sentiment >= 60 && (
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Positive perception - AI presents your brand favorably</span>
              </li>
            )}
            {score?.breakdown?.coverage >= 50 && (
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Good topic coverage - You're mentioned across multiple topics</span>
              </li>
            )}
            {score?.breakdown?.competitive >= 50 && (
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Competitive edge - You outperform competitors in visibility</span>
              </li>
            )}
            {Object.values(score?.breakdown || {}).every(v => v < 50) && (
              <li className="text-white/50">Run more tracking to identify strengths</li>
            )}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-amber-400">⚠️</span> Needs Improvement
          </h3>
          <ul className="space-y-2 text-sm">
            {score?.breakdown?.visibility < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Low visibility ({score.breakdown.visibility}%) - Get listed on more sources</span>
              </li>
            )}
            {score?.breakdown?.authority < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Weak authority - Aim to be "recommended" not just mentioned</span>
              </li>
            )}
            {score?.breakdown?.sentiment < 60 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Mixed sentiment - Address negative reviews and feedback</span>
              </li>
            )}
            {score?.breakdown?.coverage < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Limited coverage - Create content for more topics</span>
              </li>
            )}
            {score?.breakdown?.competitive < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Falling behind competitors - Study their content strategy</span>
              </li>
            )}
            {Object.values(score?.breakdown || {}).every(v => v >= 50) && (
              <li className="text-white/50">Great job! Keep monitoring for changes</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
