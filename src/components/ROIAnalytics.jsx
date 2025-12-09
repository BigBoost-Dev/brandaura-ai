import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { calculateROI } from '../lib/analysis'

export default function ROIAnalytics({ results = [], analyticsData = null }) {
  const roi = useMemo(() => calculateROI(results, analyticsData), [results, analyticsData])
  
  const mentionData = [
    { name: 'Leader', value: roi.mentions.leader, color: '#10b981' },
    { name: 'Recommended', value: roi.mentions.recommended, color: '#3b82f6' },
    { name: 'Mentioned', value: roi.mentions.mentioned, color: '#f59e0b' },
    { name: 'Not Found', value: roi.mentions.notMentioned, color: '#ef4444' }
  ]

  const formatNumber = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n.toString()
  const formatCurrency = (n) => `$${formatNumber(n)}`

  if (results.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold mb-2">No ROI Data Yet</h3>
        <p className="text-white/60">Run tracking to see estimated reach and value.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ROI Analytics</h2>
        <p className="text-white/60">Estimated business impact from AI visibility</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-5 border border-emerald-500/30">
          <div className="text-3xl font-bold text-emerald-400">{formatNumber(roi.estimatedReach)}</div>
          <div className="text-sm text-white/60">Est. Monthly Reach</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-5 border border-blue-500/30">
          <div className="text-3xl font-bold text-blue-400">{formatNumber(roi.estimatedClicks)}</div>
          <div className="text-sm text-white/60">Est. Monthly Clicks</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-5 border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400">{formatCurrency(roi.estimatedValue)}</div>
          <div className="text-sm text-white/60">Est. Monthly Value</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-5 border border-amber-500/30">
          <div className="text-3xl font-bold text-amber-400">{formatNumber(roi.conversionPotential)}</div>
          <div className="text-sm text-white/60">Potential Leads</div>
        </div>
      </div>

      {/* Mention Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Mention Quality</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mentionData} layout="vertical">
                <XAxis type="number" stroke="#ffffff30" />
                <YAxis type="category" dataKey="name" stroke="#ffffff60" width={90} />
                <Tooltip contentStyle={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {mentionData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Value by Position</h3>
          <div className="space-y-3">
            {[
              { type: 'Leader', ctr: 15, color: 'emerald' },
              { type: 'Recommended', ctr: 8, color: 'blue' },
              { type: 'Mentioned', ctr: 3, color: 'amber' }
            ].map((item) => {
              const count = roi.mentions[item.type.toLowerCase()] || 0
              const value = Math.round(count * (roi.estimatedReach / roi.mentions.total || 1) * (item.ctr / 100) * 5)
              return (
                <div key={item.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium">{item.type}</div>
                    <div className="text-xs text-white/50">{count} queries • {item.ctr}% CTR</div>
                  </div>
                  <div className={`text-xl font-bold text-${item.color}-400`}>{formatCurrency(value)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Improvement */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl p-6 border border-primary-500/20">
        <h3 className="text-lg font-semibold mb-4">💡 Growth Opportunity</h3>
        <p className="text-white/70">
          Converting {roi.mentions.notMentioned} "Not Found" results to mentions could add 
          <span className="text-emerald-400 font-bold"> +{formatCurrency(Math.round(roi.mentions.notMentioned * 100 * 0.03 * 5))}</span> monthly value.
        </p>
      </div>
    </div>
  )
}
