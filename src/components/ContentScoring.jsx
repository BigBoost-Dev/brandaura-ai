import React, { useState, useMemo } from 'react'
import { scoreContent } from '../lib/analysis'

const Icons = {
  file: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  layout: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  trophy: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2m12 6h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 9V5a2 2 0 012-2h8a2 2 0 012 2v4m-12 0a6 6 0 006 6m6-6a6 6 0 01-6 6m0 0v4m-3 0h6"/></svg>,
  target: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  clock: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  link: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  lightbulb: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z"/></svg>,
  chart: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
}

const SCORE_COLORS = {
  A: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  B: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  C: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  D: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
  F: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400' }
}

const CATEGORY_LABELS = {
  clarity: { icon: Icons.file, label: 'Clarity', description: 'Readability and sentence structure' },
  structure: { icon: Icons.layout, label: 'Structure', description: 'Headers, lists, and organization' },
  authority: { icon: Icons.trophy, label: 'Authority', description: 'Statistics, quotes, and citations' },
  relevance: { icon: Icons.target, label: 'Relevance', description: 'Brand mentions and keywords' },
  freshness: { icon: Icons.clock, label: 'Freshness', description: 'Current dates and year references' },
  citations: { icon: Icons.link, label: 'Citations', description: 'Source links and references' }
}

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 ${className}`}>{children}</div>
}

export default function ContentScoring({ brandName = '', keywords = [] }) {
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [customKeywords, setCustomKeywords] = useState(keywords.join(', '))
  
  const score = useMemo(() => {
    if (!content.trim()) return null
    const kws = customKeywords.split(',').map(k => k.trim()).filter(k => k)
    return scoreContent(content, brandName, kws)
  }, [content, brandName, customKeywords])
  
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsAnalyzing(true)
    try {
      const text = await file.text()
      setContent(text)
    } catch (err) {
      console.error('Failed to read file:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-white">Content Scoring</h2>
        <p className="text-[14px] text-white/40 mt-1">Analyze how AI-optimized your content is</p>
      </div>

      {/* Input Section */}
      <Card>
        <div className="mb-4">
          <label className="block text-[13px] text-white/60 mb-2">Brand Keywords (comma-separated)</label>
          <input
            type="text"
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
            placeholder="Enter keywords to check for..."
            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-[13px] text-white/60 mb-2">Content to Analyze</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={8}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-[13px] cursor-pointer hover:bg-white/[0.08] transition">
            Upload File
            <input type="file" accept=".txt,.md,.html" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="text-[12px] text-white/30">{content.length.toLocaleString()} characters</span>
        </div>
      </Card>

      {/* Results */}
      {score && (
        <>
          {/* Overall Score */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-medium text-white/60 mb-2">Overall AI Optimization Score</h3>
                <div className={`text-4xl font-bold ${SCORE_COLORS[score.grade].text}`}>{score.grade}</div>
                <div className="text-[13px] text-white/40 mt-1">{score.total}/100 points</div>
              </div>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${SCORE_COLORS[score.grade].bg} border ${SCORE_COLORS[score.grade].border}`}>
                <span className={`text-3xl font-bold ${SCORE_COLORS[score.grade].text}`}>{score.total}</span>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-white/50">
              {score.total >= 80 ? 'Excellent! Your content is well-optimized for AI.' :
               score.total >= 60 ? 'Good. Some areas could be improved.' :
               score.total >= 40 ? 'Needs work. Several areas to improve.' :
               'Low score. Significant optimization needed.'}
            </p>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <h3 className="text-[14px] font-medium text-white/60 mb-5">Score Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(score.categories).map(([key, value]) => {
                const cat = CATEGORY_LABELS[key] || { label: key, description: '' }
                const percentage = Math.round((value / 20) * 100)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">{cat.icon}</span>
                        <span className="text-[13px] text-white">{cat.label}</span>
                        <span className="text-[11px] text-white/30">{cat.description}</span>
                      </div>
                      <span className="text-[13px] font-semibold font-mono text-amber-400">{value}/20</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-amber-500 transition-all" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recommendations */}
          {score.recommendations && score.recommendations.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-400">{Icons.target}</span>
                <h3 className="text-[14px] font-medium text-white">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {score.recommendations.map((rec, i) => (
                  <li key={i} className="text-[13px] text-white/50 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Tips */}
          <Card className="border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                {Icons.lightbulb}
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-white mb-2">AI Content Best Practices</h3>
                <ul className="space-y-1 text-[13px] text-white/50">
                  <li>• Use clear, descriptive headings and subheadings</li>
                  <li>• Include relevant statistics and data points</li>
                  <li>• Add authoritative citations and sources</li>
                  <li>• Keep sentences concise and scannable</li>
                  <li>• Update content regularly with current dates</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!score && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">
            {Icons.chart}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Paste Content to Analyze</h3>
          <p className="text-[14px] text-white/40">Enter text or upload a file to see AI optimization scores</p>
        </Card>
      )}
    </div>
  )
}
