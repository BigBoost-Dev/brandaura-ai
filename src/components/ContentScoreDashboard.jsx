import React, { useMemo, useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { calculateContentScore } from '../lib/aiAnalysis'

const GRADE_COLORS = {
  A: '#10b981',
  B: '#22d3ee',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444'
}

const SCORE_COLORS = {
  visibility: '#f59e0b',
  authority: '#8b5cf6',
  sentiment: '#10b981',
  coverage: '#22d3ee',
  competitive: '#ec4899'
}

// Icons
const Icons = {
  chart: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  alert: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function ContentScoreDashboard({ results = [], brand, competitors = [] }) {
  const [selectedMetric, setSelectedMetric] = useState(null)

  const score = useMemo(() => {
    if (results.length === 0) return null
    return calculateContentScore(results, brand)
  }, [results, brand])

  const scoreTrend = useMemo(() => {
    if (results.length === 0) return []
    const weeklyResults = {}
    results.forEach(r => {
      const date = new Date(r.created_at)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      if (!weeklyResults[weekKey]) weeklyResults[weekKey] = []
      weeklyResults[weekKey].push(r)
    })
    return Object.entries(weeklyResults)
      .map(([week, weekResults]) => {
        const weekScore = calculateContentScore(weekResults, brand)
        return { week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ...weekScore.breakdown, overall: weekScore.overall }
      })
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8)
  }, [results, brand])

  const radialData = useMemo(() => {
    if (!score) return []
    return [{ name: 'Score', value: score.overall, fill: GRADE_COLORS[score.grade] }]
  }, [score])

  if (results.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.chart}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Score Data Yet</h3>
        <p className="text-[14px] text-white/40">Run tracking to calculate your AI discoverability score</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white">AI Discoverability Score</h2>
        <p className="text-[14px] text-white/40 mt-1">How well AI can find and recommend your brand</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score */}
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 text-center mb-4">Overall Score</h3>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold font-mono" style={{ color: GRADE_COLORS[score?.grade] }}>{score?.overall}</div>
              <div className="text-lg font-semibold mt-1" style={{ color: GRADE_COLORS[score?.grade] }}>Grade: {score?.grade}</div>
            </div>
          </div>
          <p className="text-center mt-4 text-[13px] text-white/40">
            {score?.overall >= 80 ? 'Excellent! Highly discoverable by AI.' :
             score?.overall >= 60 ? 'Good performance. Room for improvement.' :
             score?.overall >= 40 ? 'Average. Optimization opportunities available.' :
             'Needs work. Follow recommendations to improve.'}
          </p>
        </Card>

        {/* Score Breakdown */}
        <Card className="lg:col-span-2">
          <h3 className="text-[14px] font-medium text-white/60 mb-5">Score Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(score?.breakdown || {}).map(([key, value]) => {
              const descriptions = {
                visibility: 'How often AI mentions your brand',
                authority: 'Quality of mentions (leader, recommended)',
                sentiment: 'Positive vs negative perception',
                coverage: 'Topics where you\'re mentioned',
                competitive: 'Your performance vs competitors'
              }
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[13px] text-white capitalize">{key}</span>
                      <span className="text-[11px] text-white/30 ml-2">{descriptions[key]}</span>
                    </div>
                    <span className="text-[13px] font-semibold font-mono" style={{ color: SCORE_COLORS[key] }}>{value}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: SCORE_COLORS[key] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Trend */}
      {scoreTrend.length > 1 && (
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 mb-5">Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={scoreTrend}>
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="overall" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-emerald-400">{Icons.check}</span>
            <h3 className="text-[14px] font-medium text-white">What's Working</h3>
          </div>
          <ul className="space-y-2">
            {score?.strengths?.slice(0, 5).map((s, i) => (
              <li key={i} className="text-[13px] text-white/60 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-400">{Icons.alert}</span>
            <h3 className="text-[14px] font-medium text-white">Needs Improvement</h3>
          </div>
          <ul className="space-y-2">
            {score?.improvements?.slice(0, 5).map((s, i) => (
              <li key={i} className="text-[13px] text-white/60 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
