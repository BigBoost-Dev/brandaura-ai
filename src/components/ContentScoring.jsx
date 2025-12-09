import React, { useState, useMemo } from 'react'
import { scoreContent } from '../lib/analysis'

const SCORE_COLORS = {
  A: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  B: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  C: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  D: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
  F: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400' }
}

const CATEGORY_LABELS = {
  clarity: { icon: '📝', label: 'Clarity', description: 'Readability and sentence structure' },
  structure: { icon: '🏗️', label: 'Structure', description: 'Headers, lists, and organization' },
  authority: { icon: '🏆', label: 'Authority', description: 'Statistics, quotes, and citations' },
  relevance: { icon: '🎯', label: 'Relevance', description: 'Brand mentions and keywords' },
  freshness: { icon: '🕐', label: 'Freshness', description: 'Current dates and year references' },
  citations: { icon: '🔗', label: 'Citations', description: 'Source links and references' }
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
  
  const handleFetchUrl = async () => {
    if (!url.trim()) return
    setIsAnalyzing(true)
    try {
      // In production, this would call a backend service to fetch the page content
      // For now, we'll show a message
      alert('URL fetching requires a backend service. Please paste your content directly.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Scoring</h2>
          <p className="text-white/60">Analyze your content for AI discoverability</p>
        </div>
      </div>
      
      {/* Input Methods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Input */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="font-semibold mb-4">Paste Content</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your page content, article, or marketing copy here..."
            className="w-full h-48 bg-white/5 border border-white/10 rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-primary-500/50"
          />
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm">Upload File</span>
              <input type="file" accept=".txt,.md,.html" onChange={handleFileUpload} className="hidden" />
            </label>
            {content && (
              <button 
                onClick={() => setContent('')}
                className="text-sm text-white/60 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Settings */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="font-semibold mb-4">Analysis Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Brand Name</label>
              <input
                type="text"
                value={brandName}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm opacity-60"
                placeholder="Your brand name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Target Keywords (comma-separated)</label>
              <textarea
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary-500/50"
                placeholder="seo tool, content optimization, ai visibility..."
              />
            </div>
            
            <div className="text-sm text-white/50">
              <p>✓ Analyzes clarity and readability</p>
              <p>✓ Checks content structure</p>
              <p>✓ Evaluates authority signals</p>
              <p>✓ Measures keyword relevance</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results */}
      {score && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-8">
              {/* Grade Circle */}
              <div className={`w-32 h-32 rounded-full ${SCORE_COLORS[score.grade].bg} ${SCORE_COLORS[score.grade].border} border-4 flex items-center justify-center flex-shrink-0`}>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${SCORE_COLORS[score.grade].text}`}>{score.grade}</div>
                  <div className="text-sm text-white/60">{score.total}/100</div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {score.total >= 80 ? '🎉 Excellent! Your content is well-optimized for AI.' :
                   score.total >= 60 ? '👍 Good. Some improvements possible.' :
                   score.total >= 40 ? '⚠️ Needs Work. Several areas to improve.' :
                   '🚨 Poor. Significant optimization needed.'}
                </h3>
                <p className="text-white/60 mb-4">
                  {score.wordCount} words • {score.sentenceCount} sentences • 
                  {score.recommendations.length} recommendations
                </p>
                
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold">{Math.round(score.wordCount / score.sentenceCount)}</div>
                    <div className="text-xs text-white/60">Words/Sentence</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold">{score.scores.relevance}/20</div>
                    <div className="text-xs text-white/60">Relevance Score</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold">{score.scores.authority}/20</div>
                    <div className="text-xs text-white/60">Authority Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(score.scores).map(([category, categoryScore]) => {
                const info = CATEGORY_LABELS[category]
                const maxScore = category === 'freshness' || category === 'citations' ? 10 : 20
                const percentage = (categoryScore / maxScore) * 100
                
                return (
                  <div key={category} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.icon}</span>
                        <span className="font-medium">{info.label}</span>
                      </div>
                      <span className={`font-bold ${
                        percentage >= 70 ? 'text-emerald-400' :
                        percentage >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {categoryScore}/{maxScore}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          percentage >= 70 ? 'bg-emerald-500' :
                          percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/50 mt-2">{info.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Recommendations */}
          {score.recommendations.length > 0 && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">🎯 Recommendations</h3>
              <div className="space-y-3">
                {score.recommendations.map((rec, idx) => {
                  const priorityColors = {
                    high: 'border-l-rose-500 bg-rose-500/5',
                    medium: 'border-l-amber-500 bg-amber-500/5',
                    low: 'border-l-blue-500 bg-blue-500/5'
                  }
                  
                  return (
                    <div key={idx} className={`border-l-4 ${priorityColors[rec.priority]} rounded-r-lg p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{CATEGORY_LABELS[rec.category]?.icon}</span>
                        <span className="font-medium">{CATEGORY_LABELS[rec.category]?.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          rec.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{rec.suggestion}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Best Practices */}
          <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl p-6 border border-primary-500/20">
            <h3 className="text-lg font-semibold mb-4">💡 AI Content Best Practices</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Use clear, direct language</p>
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Include factual data and statistics</p>
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Structure with headers and lists</p>
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Add expert quotes and citations</p>
              </div>
              <div className="space-y-2">
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Keep content up to date</p>
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Mention your brand naturally</p>
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Include comparison context</p>
                <p className="text-white/80"><span className="text-emerald-400">✓</span> Answer common questions directly</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!score && (
        <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
          <p className="text-white/60 max-w-md mx-auto">
            Paste your content above to get an AI discoverability score and actionable recommendations.
          </p>
        </div>
      )}
    </div>
  )
}
