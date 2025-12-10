import React, { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

const Icons = {
  folder: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  target: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  trendUp: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trendDown: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function TopicPerformance({ results = [], topics = [], brand, competitors = [] }) {
  const [selectedTopic, setSelectedTopic] = useState(null)

  const topicMetrics = useMemo(() => {
    if (results.length === 0) return []

    // Group by topic/query category
    const byTopic = {}
    results.forEach(r => {
      const topic = r.topic || r.funnel_stage || 'General'
      if (!byTopic[topic]) {
        byTopic[topic] = { total: 0, mentioned: 0, leader: 0, queries: [] }
      }
      byTopic[topic].total++
      byTopic[topic].queries.push(r)
      if (r.mention_type && r.mention_type !== 'notMentioned') {
        byTopic[topic].mentioned++
        if (r.mention_type === 'leader') byTopic[topic].leader++
      }
    })

    return Object.entries(byTopic)
      .map(([topic, data]) => ({
        topic,
        visibility: Math.round((data.mentioned / data.total) * 100),
        leaderRate: Math.round((data.leader / data.total) * 100),
        total: data.total,
        queries: data.queries
      }))
      .sort((a, b) => b.visibility - a.visibility)
  }, [results])

  const chartData = topicMetrics.map(t => ({
    name: t.topic.length > 15 ? t.topic.slice(0, 15) + '...' : t.topic,
    visibility: t.visibility,
    leader: t.leaderRate
  }))

  if (results.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.target}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Topic Data</h3>
        <p className="text-[14px] text-white/40">Run tracking to see performance by topic</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white">Topic Performance</h2>
        <p className="text-[14px] text-white/40 mt-1">See how your brand performs across different topics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-[13px] text-white/40 mb-2">Total Topics</div>
          <div className="text-3xl font-bold font-mono text-white">{topicMetrics.length}</div>
        </Card>
        <Card>
          <div className="text-[13px] text-white/40 mb-2">Best Performing</div>
          <div className="text-xl font-bold text-amber-400 truncate">{topicMetrics[0]?.topic || '-'}</div>
          <div className="text-[12px] text-white/30">{topicMetrics[0]?.visibility || 0}% visibility</div>
        </Card>
        <Card>
          <div className="text-[13px] text-white/40 mb-2">Needs Attention</div>
          <div className="text-xl font-bold text-red-400 truncate">{topicMetrics[topicMetrics.length - 1]?.topic || '-'}</div>
          <div className="text-[12px] text-white/30">{topicMetrics[topicMetrics.length - 1]?.visibility || 0}% visibility</div>
        </Card>
        <Card>
          <div className="text-[13px] text-white/40 mb-2">Avg. Visibility</div>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {Math.round(topicMetrics.reduce((a, b) => a + b.visibility, 0) / topicMetrics.length || 0)}%
          </div>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <h3 className="text-[14px] font-medium text-white/60 mb-5">Visibility by Topic</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 45)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.06)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={100} />
              <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="visibility" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Topic List */}
      <Card>
        <h3 className="text-[14px] font-medium text-white/60 mb-5">All Topics</h3>
        <div className="space-y-2">
          {topicMetrics.map((topic, i) => (
            <div 
              key={topic.topic}
              className={`p-4 rounded-xl cursor-pointer transition-colors ${
                selectedTopic === topic.topic 
                  ? 'bg-amber-500/10 border border-amber-500/20' 
                  : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
              }`}
              onClick={() => setSelectedTopic(selectedTopic === topic.topic ? null : topic.topic)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold ${
                    topic.visibility >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                    topic.visibility >= 40 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[14px] text-white">{topic.topic}</div>
                    <div className="text-[12px] text-white/30">{topic.total} tests</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[11px] text-white/30">Visibility</div>
                    <div className={`text-[15px] font-bold font-mono ${
                      topic.visibility >= 70 ? 'text-emerald-400' :
                      topic.visibility >= 40 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>{topic.visibility}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/30">Leader</div>
                    <div className="text-[15px] font-bold font-mono text-white/60">{topic.leaderRate}%</div>
                  </div>
                </div>
              </div>
              
              {selectedTopic === topic.topic && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="text-[12px] text-white/40 mb-2">Recent Queries</div>
                  <div className="space-y-1">
                    {topic.queries.slice(0, 5).map((q, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px]">
                        <span className="text-white/50 truncate flex-1">{q.query}</span>
                        <span className={`ml-2 ${
                          q.mention_type === 'leader' ? 'text-emerald-400' :
                          q.mention_type === 'mentioned' ? 'text-amber-400' :
                          'text-white/30'
                        }`}>
                          {q.mention_type || 'Not found'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
