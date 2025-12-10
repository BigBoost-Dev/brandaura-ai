import React, { useMemo, useState } from 'react'

const Icons = {
  lightbulb: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  zap: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  target: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  arrowRight: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const PRIORITY_STYLES = {
  high: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  medium: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400' },
  low: { bg: 'bg-white/[0.05]', border: 'border-white/[0.08]', text: 'text-white/50' }
}

const CATEGORY_ICONS = {
  optimization: Icons.zap,
  content: Icons.target,
  reputation: Icons.star
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function RecommendationsDashboard({ results = [], brand, competitors = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [expandedRec, setExpandedRec] = useState(null)

  const recommendations = useMemo(() => {
    if (results.length === 0) return []
    
    const recs = []
    const total = results.length
    const mentioned = results.filter(r => r.mention_type && r.mention_type !== 'notMentioned').length
    const leaders = results.filter(r => r.mention_type === 'leader').length
    const visibilityRate = Math.round((mentioned / total) * 100)
    const leaderRate = Math.round((leaders / total) * 100)

    // Visibility recommendations
    if (visibilityRate < 50) {
      recs.push({
        id: 1,
        title: 'Improve Brand Visibility',
        description: `Your brand is mentioned in only ${visibilityRate}% of AI responses. Focus on creating more authoritative content.`,
        priority: 'high',
        category: 'optimization',
        actions: ['Create comprehensive FAQ pages', 'Publish comparison guides', 'Build authoritative backlinks']
      })
    }

    if (leaderRate < 20) {
      recs.push({
        id: 2,
        title: 'Increase Leader Recommendations',
        description: `AI recommends you as the top choice only ${leaderRate}% of the time. Strengthen your market positioning.`,
        priority: 'high',
        category: 'content',
        actions: ['Highlight unique differentiators', 'Collect and showcase testimonials', 'Create case studies']
      })
    }

    // Platform-specific recommendations
    const platformCoverage = {}
    results.forEach(r => {
      if (!platformCoverage[r.platform]) platformCoverage[r.platform] = { total: 0, mentioned: 0 }
      platformCoverage[r.platform].total++
      if (r.mention_type && r.mention_type !== 'notMentioned') platformCoverage[r.platform].mentioned++
    })

    Object.entries(platformCoverage).forEach(([platform, data]) => {
      const rate = Math.round((data.mentioned / data.total) * 100)
      if (rate < 30) {
        recs.push({
          id: `platform-${platform}`,
          title: `Improve ${platform} Visibility`,
          description: `Low visibility on ${platform} (${rate}%). This platform may need specific optimization.`,
          priority: 'medium',
          category: 'optimization',
          actions: ['Research platform-specific ranking factors', 'Optimize content for this AI model']
        })
      }
    })

    // Generic recommendations
    recs.push({
      id: 'generic-1',
      title: 'Monitor Brand Sentiment',
      description: 'Track how AI describes your brand to ensure positive positioning.',
      priority: 'low',
      category: 'reputation',
      actions: ['Set up sentiment alerts', 'Review AI responses weekly']
    })

    return recs
  }, [results])

  const filteredRecs = recommendations.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
    if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false
    return true
  })

  if (results.length === 0) {
    return (
      <Card className="text-center max-w-lg mx-auto py-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">{Icons.lightbulb}</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Insights Yet</h3>
        <p className="text-[14px] text-white/40">Run tracking tests to get personalized recommendations</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">AI Visibility Insights</h2>
          <p className="text-[14px] text-white/40 mt-1">Actionable recommendations to improve your AI presence</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {['high', 'medium', 'low'].map(priority => {
          const count = recommendations.filter(r => r.priority === priority).length
          return (
            <Card key={priority} className={count > 0 && priority === 'high' ? 'border-amber-500/20' : ''}>
              <div className="text-[13px] text-white/40 capitalize mb-2">{priority} Priority</div>
              <div className={`text-2xl font-bold font-mono ${PRIORITY_STYLES[priority].text}`}>{count}</div>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All Categories</option>
          <option value="optimization">Optimization</option>
          <option value="content">Content</option>
          <option value="reputation">Reputation</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecs.map(rec => (
          <div
            key={rec.id}
            className={`rounded-xl border ${PRIORITY_STYLES[rec.priority].bg} ${PRIORITY_STYLES[rec.priority].border} overflow-hidden`}
          >
            <button
              onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${PRIORITY_STYLES[rec.priority].bg} ${PRIORITY_STYLES[rec.priority].text}`}>
                {CATEGORY_ICONS[rec.category] || Icons.lightbulb}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[14px] font-medium text-white">{rec.title}</h4>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${PRIORITY_STYLES[rec.priority].bg} ${PRIORITY_STYLES[rec.priority].text} capitalize`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[13px] text-white/50">{rec.description}</p>
              </div>
              <span className={`transform transition-transform ${expandedRec === rec.id ? 'rotate-90' : ''} text-white/30`}>
                {Icons.arrowRight}
              </span>
            </button>
            
            {expandedRec === rec.id && (
              <div className="px-4 pb-4 border-t border-white/[0.04]">
                <div className="pt-4">
                  <h5 className="text-[13px] font-medium text-white/60 mb-3">Recommended Actions</h5>
                  <ul className="space-y-2">
                    {rec.actions.map((action, i) => (
                      <li key={i} className="text-[13px] text-white/50 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <Card className="border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
            {Icons.lightbulb}
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-white mb-2">Pro Tips for AI Visibility</h3>
            <ul className="space-y-1 text-[13px] text-white/50">
              <li>• Create comprehensive, well-structured content that directly answers common questions</li>
              <li>• Build authoritative backlinks from trusted industry sources</li>
              <li>• Maintain consistent NAP (Name, Address, Phone) across all platforms</li>
              <li>• Regularly update your content to stay relevant and accurate</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
