import React, { useState, useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { AI_SEARCH_ENGINES } from '../lib/constants'

// Sentiment colors
const SENTIMENT_COLORS = {
  positive: '#4ade80',
  neutral: '#fbbf24',
  negative: '#f87171'
}

export default function AISearchPerformance({ brand, results = [] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [selectedEngines, setSelectedEngines] = useState(['chatgpt-auto', 'perplexity', 'gemini'])
  const [dateRange, setDateRange] = useState('30d')
  const [viewMode, setViewMode] = useState('mentions') // mentions, citations, sentiment

  // Process results into performance data
  const performanceData = useMemo(() => {
    if (!results.length) return null

    // Group by date
    const byDate = {}
    const byTopic = {}
    const byEngine = {}
    const prompts = []

    results.forEach(result => {
      const date = new Date(result.created_at).toLocaleDateString()
      const topic = result.query_type || 'General'
      const engine = result.platform || 'chatgpt-auto'

      // By date
      if (!byDate[date]) {
        byDate[date] = { date, mentions: 0, citations: 0, total: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } }
      }
      byDate[date].total++
      if (result.mention_type !== 'not_found') byDate[date].mentions++
      if (result.citations?.length > 0) byDate[date].citations++
      
      // Sentiment
      const sentiment = result.sentiment_score > 0.6 ? 'positive' : result.sentiment_score < 0.4 ? 'negative' : 'neutral'
      byDate[date].sentiment[sentiment]++

      // By topic
      if (!byTopic[topic]) {
        byTopic[topic] = { topic, mentions: 0, citations: 0, total: 0, prompts: [] }
      }
      byTopic[topic].total++
      if (result.mention_type !== 'not_found') byTopic[topic].mentions++
      if (result.citations?.length > 0) byTopic[topic].citations++
      byTopic[topic].prompts.push(result)

      // By engine
      if (!byEngine[engine]) {
        byEngine[engine] = { engine, mentions: 0, citations: 0, total: 0, avgSentiment: 0 }
      }
      byEngine[engine].total++
      if (result.mention_type !== 'not_found') byEngine[engine].mentions++
      if (result.citations?.length > 0) byEngine[engine].citations++
      byEngine[engine].avgSentiment += result.sentiment_score || 0.5

      // Prompts list
      prompts.push({
        id: result.id,
        prompt: result.query,
        topic,
        engine,
        response: result.response,
        mentioned: result.mention_type !== 'not_found',
        mentionType: result.mention_type,
        citations: result.citations || [],
        sentiment: result.sentiment_score || 0.5,
        sentimentLabel: sentiment,
        position: result.position,
        date: result.created_at
      })
    })

    // Calculate averages
    Object.values(byEngine).forEach(e => {
      e.avgSentiment = e.total > 0 ? e.avgSentiment / e.total : 0.5
    })

    return {
      timeline: Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date)),
      topics: Object.values(byTopic).sort((a, b) => b.mentions - a.mentions),
      engines: Object.values(byEngine),
      prompts: prompts.sort((a, b) => new Date(b.date) - new Date(a.date)),
      totals: {
        mentions: results.filter(r => r.mention_type !== 'not_found').length,
        citations: results.filter(r => r.citations?.length > 0).length,
        total: results.length,
        avgSentiment: results.reduce((sum, r) => sum + (r.sentiment_score || 0.5), 0) / results.length
      }
    }
  }, [results])

  // Demo data if no results
  const demoData = useMemo(() => ({
    timeline: [
      { date: 'Dec 1', mentions: 12, citations: 8, total: 20, sentiment: { positive: 10, neutral: 6, negative: 4 } },
      { date: 'Dec 2', mentions: 15, citations: 10, total: 22, sentiment: { positive: 12, neutral: 7, negative: 3 } },
      { date: 'Dec 3', mentions: 18, citations: 12, total: 25, sentiment: { positive: 14, neutral: 8, negative: 3 } },
      { date: 'Dec 4', mentions: 14, citations: 9, total: 20, sentiment: { positive: 11, neutral: 6, negative: 3 } },
      { date: 'Dec 5', mentions: 20, citations: 15, total: 28, sentiment: { positive: 16, neutral: 9, negative: 3 } },
      { date: 'Dec 6', mentions: 22, citations: 16, total: 30, sentiment: { positive: 18, neutral: 8, negative: 4 } },
      { date: 'Dec 7', mentions: 25, citations: 18, total: 32, sentiment: { positive: 20, neutral: 9, negative: 3 } },
    ],
    topics: [
      { topic: 'Digital Marketing Services', mentions: 45, citations: 32, total: 60, mentionRate: 75, citationRate: 53 },
      { topic: 'SEO Agency', mentions: 38, citations: 25, total: 55, mentionRate: 69, citationRate: 45 },
      { topic: 'Content Marketing', mentions: 32, citations: 20, total: 50, mentionRate: 64, citationRate: 40 },
      { topic: 'Social Media Management', mentions: 28, citations: 18, total: 45, mentionRate: 62, citationRate: 40 },
      { topic: 'PPC Advertising', mentions: 22, citations: 14, total: 40, mentionRate: 55, citationRate: 35 },
    ],
    engines: [
      { engine: 'chatgpt-auto', mentions: 42, citations: 28, total: 55, avgSentiment: 0.72 },
      { engine: 'perplexity', mentions: 38, citations: 35, total: 50, avgSentiment: 0.68 },
      { engine: 'gemini', mentions: 35, citations: 22, total: 48, avgSentiment: 0.65 },
      { engine: 'claude', mentions: 30, citations: 20, total: 42, avgSentiment: 0.75 },
      { engine: 'google-aio', mentions: 25, citations: 18, total: 38, avgSentiment: 0.62 },
    ],
    prompts: [
      {
        id: 1,
        prompt: 'What are the best digital marketing agencies for small businesses?',
        topic: 'Digital Marketing Services',
        engine: 'chatgpt-auto',
        response: `Based on my analysis, here are some top digital marketing agencies for small businesses:\n\n1. **${brand?.name || 'BigBoost AI'}** - Known for their AI-powered approach to SEO and content marketing, they offer tailored solutions for small businesses.\n\n2. WebFX - A full-service agency with transparent pricing.\n\n3. Ignite Visibility - Specializes in SEO and social media.\n\n${brand?.name || 'BigBoost AI'} stands out for their innovative use of AI technology to deliver measurable results at competitive prices.`,
        mentioned: true,
        mentionType: 'primary',
        citations: [
          { url: brand?.website || 'bigboost.agency', title: `${brand?.name || 'BigBoost AI'} - AI Marketing Solutions` },
          { url: 'clutch.co', title: 'Top Digital Marketing Agencies 2024' }
        ],
        sentiment: 0.82,
        sentimentLabel: 'positive',
        position: 1,
        date: new Date().toISOString()
      },
      {
        id: 2,
        prompt: 'Compare SEO tools for enterprise companies',
        topic: 'SEO Agency',
        engine: 'perplexity',
        response: `Here's a comparison of enterprise SEO tools:\n\n**Conductor** - Enterprise-grade with AI features\n**Semrush** - Comprehensive toolkit\n**Ahrefs** - Strong backlink analysis\n**${brand?.name || 'BigBoost AI'}** - Emerging platform with AI visibility tracking\n\nFor AI search optimization specifically, ${brand?.name || 'BigBoost AI'} offers unique capabilities.`,
        mentioned: true,
        mentionType: 'secondary',
        citations: [
          { url: 'g2.com', title: 'SEO Software Comparison' }
        ],
        sentiment: 0.65,
        sentimentLabel: 'positive',
        position: 4,
        date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        prompt: 'What is the best content marketing strategy for B2B?',
        topic: 'Content Marketing',
        engine: 'gemini',
        response: `For B2B content marketing, consider these strategies:\n\n1. Thought leadership content\n2. Case studies and whitepapers\n3. LinkedIn-focused distribution\n4. SEO-optimized blog content\n5. Email nurture sequences\n\nAgencies like HubSpot and Content Marketing Institute provide good frameworks.`,
        mentioned: false,
        mentionType: 'not_found',
        citations: [],
        sentiment: 0.55,
        sentimentLabel: 'neutral',
        position: null,
        date: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 4,
        prompt: 'Which agency offers the best ROI for digital advertising?',
        topic: 'PPC Advertising',
        engine: 'claude',
        response: `ROI in digital advertising varies based on your specific needs, but here are agencies known for strong performance:\n\n1. **${brand?.name || 'BigBoost AI'}** - Their AI-driven approach to campaign optimization has shown impressive ROI metrics for clients.\n\n2. Disruptive Advertising - Specializes in PPC with focus on conversion.\n\n3. KlientBoost - Known for landing page optimization.\n\nThe key is finding an agency that aligns with your industry and goals.`,
        mentioned: true,
        mentionType: 'primary',
        citations: [
          { url: brand?.website || 'bigboost.agency', title: `${brand?.name || 'BigBoost AI'} Case Studies` },
          { url: 'adweek.com', title: 'Agency Performance Report 2024' }
        ],
        sentiment: 0.78,
        sentimentLabel: 'positive',
        position: 1,
        date: new Date(Date.now() - 259200000).toISOString()
      }
    ],
    totals: {
      mentions: 165,
      citations: 109,
      total: 233,
      avgSentiment: 0.68
    }
  }), [brand])

  const data = performanceData || demoData

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'topics', label: 'Topics', icon: '📑' },
    { id: 'prompts', label: 'Prompts', icon: '💬' },
    { id: 'engines', label: 'AI Engines', icon: '🤖' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Search Performance</h2>
          <p className="text-white/50 mt-1">Track mentions, citations, and sentiment across AI engines</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input py-2 px-3 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/50 text-sm">Total Prompts</div>
          <div className="text-2xl font-bold mt-1">{data.totals.total}</div>
          <div className="text-xs text-green-400 mt-1">+12% vs last period</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/50 text-sm">Brand Mentions</div>
          <div className="text-2xl font-bold mt-1 text-primary-400">{data.totals.mentions}</div>
          <div className="text-xs text-white/40 mt-1">{Math.round(data.totals.mentions / data.totals.total * 100)}% mention rate</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/50 text-sm">Citations</div>
          <div className="text-2xl font-bold mt-1 text-blue-400">{data.totals.citations}</div>
          <div className="text-xs text-white/40 mt-1">{Math.round(data.totals.citations / data.totals.total * 100)}% citation rate</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/50 text-sm">Avg Sentiment</div>
          <div className={`text-2xl font-bold mt-1 ${
            data.totals.avgSentiment > 0.6 ? 'text-green-400' : data.totals.avgSentiment < 0.4 ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {Math.round(data.totals.avgSentiment * 100)}%
          </div>
          <div className="text-xs text-white/40 mt-1">
            {data.totals.avgSentiment > 0.6 ? 'Positive' : data.totals.avgSentiment < 0.4 ? 'Negative' : 'Neutral'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Timeline Chart */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Performance Over Time</h3>
              <div className="flex gap-2">
                {['mentions', 'citations', 'sentiment'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      viewMode === mode
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'sentiment' ? (
                  <AreaChart data={data.timeline}>
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                    <YAxis stroke="#ffffff40" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="sentiment.positive" stackId="1" stroke={SENTIMENT_COLORS.positive} fill={SENTIMENT_COLORS.positive} fillOpacity={0.6} name="Positive" />
                    <Area type="monotone" dataKey="sentiment.neutral" stackId="1" stroke={SENTIMENT_COLORS.neutral} fill={SENTIMENT_COLORS.neutral} fillOpacity={0.6} name="Neutral" />
                    <Area type="monotone" dataKey="sentiment.negative" stackId="1" stroke={SENTIMENT_COLORS.negative} fill={SENTIMENT_COLORS.negative} fillOpacity={0.6} name="Negative" />
                    <Legend />
                  </AreaChart>
                ) : (
                  <LineChart data={data.timeline}>
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                    <YAxis stroke="#ffffff40" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="mentions" stroke="#818cf8" strokeWidth={2} dot={false} name="Mentions" />
                    <Line type="monotone" dataKey="citations" stroke="#22d3ee" strokeWidth={2} dot={false} name="Citations" />
                    <Line type="monotone" dataKey="total" stroke="#ffffff40" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Total Prompts" />
                    <Legend />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engine Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Engine */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4">Performance by AI Engine</h3>
              <div className="space-y-3">
                {data.engines.map(eng => {
                  const engineInfo = AI_SEARCH_ENGINES[eng.engine] || { name: eng.engine, color: '#818cf8' }
                  const mentionRate = Math.round(eng.mentions / eng.total * 100)
                  return (
                    <div key={eng.engine} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: engineInfo.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80 truncate">{engineInfo.name}</span>
                          <span className="text-white/60">{mentionRate}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${mentionRate}%`, backgroundColor: engineInfo.color }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Topics */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4">Top Topics by Mentions</h3>
              <div className="space-y-3">
                {data.topics.slice(0, 5).map((topic, idx) => (
                  <div key={topic.topic} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80 truncate">{topic.topic}</span>
                        <span className="text-primary-400 font-medium">{topic.mentions}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${Math.round(topic.mentions / data.topics[0].mentions * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-sm font-medium text-white/60 px-4 py-3">Topic</th>
                  <th className="text-center text-sm font-medium text-white/60 px-4 py-3">Prompts</th>
                  <th className="text-center text-sm font-medium text-white/60 px-4 py-3">Mentions</th>
                  <th className="text-center text-sm font-medium text-white/60 px-4 py-3">Mention Rate</th>
                  <th className="text-center text-sm font-medium text-white/60 px-4 py-3">Citations</th>
                  <th className="text-center text-sm font-medium text-white/60 px-4 py-3">Citation Rate</th>
                  <th className="text-right text-sm font-medium text-white/60 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.topics.map(topic => (
                  <tr key={topic.topic} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{topic.topic}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-white/60">{topic.total}</td>
                    <td className="px-4 py-3 text-center text-primary-400 font-medium">{topic.mentions}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (topic.mentions / topic.total * 100) > 60 
                          ? 'bg-green-500/20 text-green-400'
                          : (topic.mentions / topic.total * 100) > 40
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {Math.round(topic.mentions / topic.total * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-blue-400 font-medium">{topic.citations}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (topic.citations / topic.total * 100) > 50 
                          ? 'bg-green-500/20 text-green-400'
                          : (topic.citations / topic.total * 100) > 30
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {Math.round(topic.citations / topic.total * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTopic(topic)
                          setActiveTab('prompts')
                        }}
                        className="text-sm text-primary-400 hover:text-primary-300"
                      >
                        View Prompts →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prompts Tab - Prompt Level Analysis */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedTopic?.topic || ''}
              onChange={(e) => setSelectedTopic(e.target.value ? data.topics.find(t => t.topic === e.target.value) : null)}
              className="input py-2 px-3 text-sm"
            >
              <option value="">All Topics</option>
              {data.topics.map(t => (
                <option key={t.topic} value={t.topic}>{t.topic}</option>
              ))}
            </select>
            <select className="input py-2 px-3 text-sm">
              <option value="">All Engines</option>
              {Object.entries(AI_SEARCH_ENGINES).map(([id, eng]) => (
                <option key={id} value={id}>{eng.name}</option>
              ))}
            </select>
            <select className="input py-2 px-3 text-sm">
              <option value="">All Mentions</option>
              <option value="mentioned">Mentioned</option>
              <option value="not_mentioned">Not Mentioned</option>
            </select>
          </div>

          {/* Prompts List */}
          <div className="space-y-4">
            {data.prompts
              .filter(p => !selectedTopic || p.topic === selectedTopic.topic)
              .map(prompt => (
              <div
                key={prompt.id}
                className={`bg-white/5 rounded-xl border overflow-hidden ${
                  selectedPrompt?.id === prompt.id ? 'border-primary-500' : 'border-white/10'
                }`}
              >
                {/* Prompt Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5"
                  onClick={() => setSelectedPrompt(selectedPrompt?.id === prompt.id ? null : prompt)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: AI_SEARCH_ENGINES[prompt.engine]?.color || '#818cf8' }}
                        />
                        <span className="text-xs text-white/40">{AI_SEARCH_ENGINES[prompt.engine]?.name || prompt.engine}</span>
                        <span className="text-xs text-white/20">•</span>
                        <span className="text-xs text-white/40">{prompt.topic}</span>
                      </div>
                      <p className="text-white font-medium">{prompt.prompt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mention Badge */}
                      {prompt.mentioned ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prompt.mentionType === 'primary'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {prompt.mentionType === 'primary' ? '🎯 Primary' : '📍 Mentioned'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          ❌ Not Found
                        </span>
                      )}
                      {/* Sentiment */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prompt.sentimentLabel === 'positive'
                          ? 'bg-green-500/20 text-green-400'
                          : prompt.sentimentLabel === 'negative'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {Math.round(prompt.sentiment * 100)}%
                      </span>
                      {/* Expand Icon */}
                      <svg
                        className={`w-5 h-5 text-white/40 transition-transform ${selectedPrompt?.id === prompt.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {selectedPrompt?.id === prompt.id && (
                  <div className="border-t border-white/10">
                    {/* AI Response */}
                    <div className="p-4 bg-white/5">
                      <div className="text-xs text-white/40 mb-2">AI Response:</div>
                      <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                        {prompt.response}
                      </div>
                    </div>

                    {/* Citations */}
                    {prompt.citations.length > 0 && (
                      <div className="p-4 border-t border-white/10">
                        <div className="text-xs text-white/40 mb-2">Citations ({prompt.citations.length}):</div>
                        <div className="space-y-2">
                          {prompt.citations.map((citation, idx) => (
                            <a
                              key={idx}
                              href={`https://${citation.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              {citation.title || citation.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="p-4 border-t border-white/10 flex items-center gap-4 text-xs text-white/40">
                      <span>Position: {prompt.position || 'N/A'}</span>
                      <span>•</span>
                      <span>{new Date(prompt.date).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Engines Tab - Multi-Engine Comparison */}
      {activeTab === 'engines' && (
        <div className="space-y-6">
          {/* Engine Selector */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(AI_SEARCH_ENGINES).map(([id, engine]) => (
              <button
                key={id}
                onClick={() => {
                  if (selectedEngines.includes(id)) {
                    setSelectedEngines(selectedEngines.filter(e => e !== id))
                  } else {
                    setSelectedEngines([...selectedEngines, id])
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedEngines.includes(id)
                    ? 'bg-white/20 text-white ring-2'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                style={{ ringColor: selectedEngines.includes(id) ? engine.color : 'transparent' }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: engine.color }}
                />
                {engine.name}
              </button>
            ))}
          </div>

          {/* Comparison Chart */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold mb-4">Engine Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.engines.filter(e => selectedEngines.includes(e.engine))}
                  layout="vertical"
                >
                  <XAxis type="number" stroke="#ffffff40" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="engine"
                    stroke="#ffffff40"
                    fontSize={12}
                    tickFormatter={(value) => AI_SEARCH_ENGINES[value]?.name || value}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    labelFormatter={(value) => AI_SEARCH_ENGINES[value]?.name || value}
                  />
                  <Bar dataKey="mentions" fill="#818cf8" name="Mentions" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="citations" fill="#22d3ee" name="Citations" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Engine Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.engines
              .filter(e => selectedEngines.includes(e.engine))
              .map(eng => {
                const engineInfo = AI_SEARCH_ENGINES[eng.engine] || { name: eng.engine, color: '#818cf8' }
                return (
                  <div
                    key={eng.engine}
                    className="bg-white/5 rounded-xl p-5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${engineInfo.color}20` }}
                      >
                        {engineInfo.icon || '🤖'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{engineInfo.name}</div>
                        <div className="text-xs text-white/40">{eng.total} prompts tracked</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Mention Rate</span>
                        <span className="text-primary-400 font-semibold">{Math.round(eng.mentions / eng.total * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${eng.mentions / eng.total * 100}%`, backgroundColor: engineInfo.color }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Citation Rate</span>
                        <span className="text-blue-400 font-semibold">{Math.round(eng.citations / eng.total * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${eng.citations / eng.total * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Avg Sentiment</span>
                        <span className={`font-semibold ${
                          eng.avgSentiment > 0.6 ? 'text-green-400' : eng.avgSentiment < 0.4 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {Math.round(eng.avgSentiment * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Side-by-Side Response Comparison */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold mb-4">Response Comparison</h3>
            <p className="text-sm text-white/50 mb-4">See how different AI engines respond to the same prompt</p>
            
            <div className="mb-4">
              <select className="input py-2 px-3 text-sm w-full">
                <option>Select a prompt to compare...</option>
                {data.prompts.slice(0, 10).map(p => (
                  <option key={p.id} value={p.id}>{p.prompt.substring(0, 80)}...</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedEngines.slice(0, 3).map(engineId => {
                const engineInfo = AI_SEARCH_ENGINES[engineId] || { name: engineId, color: '#818cf8' }
                const samplePrompt = data.prompts.find(p => p.engine === engineId) || data.prompts[0]
                return (
                  <div
                    key={engineId}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: engineInfo.color }}
                      />
                      <span className="font-medium text-sm">{engineInfo.name}</span>
                    </div>
                    <div className="text-sm text-white/70 leading-relaxed line-clamp-6">
                      {samplePrompt?.response?.substring(0, 300)}...
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                      {samplePrompt?.mentioned ? (
                        <span className="text-xs text-green-400">✓ Mentioned</span>
                      ) : (
                        <span className="text-xs text-red-400">✗ Not mentioned</span>
                      )}
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/40">{samplePrompt?.citations?.length || 0} citations</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
