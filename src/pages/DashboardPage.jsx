import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuthStore, useBrandsStore, useResultsStore, useUIStore } from '../hooks/useStore'
import { AI_PLATFORMS, MENTION_TYPES, FUNNEL_STAGES, INDUSTRY_BENCHMARKS } from '../lib/constants'
import { queryAI, analyzeResponse, generateQueries, calculateMetrics } from '../lib/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import PlatformCard from '../components/PlatformCard'
import BrandSetup from '../components/BrandSetup'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, signOut } = useAuthStore()
  const { brands, activeBrandId, loadBrands, getActiveBrand, setActiveBrand, deleteBrand } = useBrandsStore()
  const { loadResults, addResults, getResults } = useResultsStore()
  const { activeTab, setActiveTab, isTestRunning, setTestRunning, testProgress, setTestProgress, addLog } = useUIStore()
  
  const [showSetup, setShowSetup] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [showPlatformSelector, setShowPlatformSelector] = useState(false)
  const abortControllerRef = useRef(null)

  const activeBrand = getActiveBrand()
  const brandResults = activeBrand ? getResults(activeBrand.id) : []

  // Initialize selected platforms from brand
  useEffect(() => {
    if (activeBrand?.selected_platforms) {
      setSelectedPlatforms(activeBrand.selected_platforms)
    }
  }, [activeBrand?.id])

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) loadBrands(user.id).catch(console.error)
  }, [user, loadBrands])

  useEffect(() => {
    if (activeBrand) loadResults(activeBrand.id).catch(console.error)
  }, [activeBrand?.id, loadResults])

  useEffect(() => {
    if (brandResults.length > 0 && activeBrand) {
      const m = calculateMetrics(brandResults, activeBrand.selected_platforms || [], activeBrand.competitors || [])
      setMetrics(m)
    } else setMetrics(null)
  }, [brandResults, activeBrand])

  useEffect(() => {
    if (!authLoading && brands.length === 0) setShowSetup(true)
  }, [brands, authLoading])

  const stopTests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      addLog({ message: '⏹ Tests stopped by user', type: 'warning' })
    }
  }, [addLog])

  const runTests = useCallback(async () => {
    if (isTestRunning || !activeBrand || !user) return
    
    // Create new AbortController for this run
    abortControllerRef.current = new AbortController()
    
    setTestRunning(true)
    addLog({ message: `🚀 Starting tests for ${activeBrand.name}`, type: 'info' })

    // Use selected platforms (can be changed per run)
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : (activeBrand.selected_platforms || ['gpt-4o', 'claude-sonnet'])
    const queries = generateQueries(activeBrand, platforms)
    setTestProgress({ current: 0, total: queries.length, platform: '', query: '' })

    const newResults = []
    const batchId = Date.now().toString()

    for (let i = 0; i < queries.length; i++) {
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        addLog({ message: '⏹ Tests cancelled', type: 'warning' })
        break
      }

      const { query, type, platformId } = queries[i]
      const platform = AI_PLATFORMS[platformId]
      setTestProgress({ current: i + 1, total: queries.length, platform: platform.name, query })

      try {
        const { success, response, cost, error } = await queryAI(platform.model, query)
        if (success && response) {
          const analysis = analyzeResponse(response, activeBrand.name, activeBrand.competitors || [])
          newResults.push({
            brand_id: activeBrand.id, user_id: user.id, batch_id: batchId,
            platform_id: platformId, platform_name: platform.name, model: platform.model,
            query, query_type: type, brand_mention: analysis.brandMention,
            brand_position: analysis.brandPosition, sentiment: analysis.sentiment,
            confidence: analysis.confidence, mention_count: analysis.mentionCount,
            competitor_mentions: analysis.competitorMentions, snippet: analysis.snippet,
            cost: cost || 0
          })
          addLog({ message: `${MENTION_TYPES[analysis.brandMention]?.emoji} ${platform.name}: ${MENTION_TYPES[analysis.brandMention]?.label}`, type: 'info' })
        } else addLog({ message: `❌ ${platform.name}: ${error}`, type: 'error' })
      } catch (err) { 
        if (err.name === 'AbortError') break
        addLog({ message: `❌ ${err.message}`, type: 'error' }) 
      }
      await new Promise(r => setTimeout(r, 1100))
    }

    if (newResults.length > 0) {
      await addResults(activeBrand.id, newResults)
      addLog({ message: `✅ Done! ${newResults.length} results saved`, type: 'success' })
    }
    
    abortControllerRef.current = null
    setTestRunning(false)
  }, [isTestRunning, activeBrand, user, selectedPlatforms, addLog, setTestProgress, setTestRunning, addResults])

  if (authLoading) return <div className="min-h-screen bg-dark-400 flex items-center justify-center"><div className="spinner w-8 h-8" /></div>
  if (showSetup) return <BrandSetup userId={user?.id} onComplete={() => setShowSetup(false)} onCancel={brands.length > 0 ? () => setShowSetup(false) : null} />

  return (
    <div className="min-h-screen bg-dark-400 text-white">
      <Header user={user} profile={profile} brands={brands} activeBrandId={activeBrandId}
        onBrandChange={setActiveBrand} onAddBrand={() => setShowSetup(true)} onSignOut={signOut}
        isRunning={isTestRunning} progress={testProgress} onRunTests={runTests} onStopTests={stopTests}
        showPlatformSelector={showPlatformSelector} setShowPlatformSelector={setShowPlatformSelector}
        selectedPlatforms={selectedPlatforms} setSelectedPlatforms={setSelectedPlatforms} />

      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} resultsCount={brandResults.length} />
        <main className="flex-1 p-6 ml-60">
          {activeTab === 'dashboard' && <DashboardView metrics={metrics} activeBrand={activeBrand} onRunTests={runTests} isRunning={isTestRunning} />}
          {activeTab === 'platforms' && <PlatformsView platforms={activeBrand?.selected_platforms || []} metrics={metrics} />}
          {activeTab === 'results' && <ResultsView results={brandResults} />}
          {activeTab === 'settings' && <SettingsView brand={activeBrand} onDeleteBrand={deleteBrand} />}
        </main>
      </div>
    </div>
  )
}

// Dashboard View - REMOVED API COST DISPLAY
function DashboardView({ metrics, activeBrand, onRunTests, isRunning }) {
  if (!metrics) {
    return (
      <div className="card p-20 text-center bg-gradient-to-br from-primary-500/10 to-purple-500/5 border-primary-500/20">
        <div className="text-7xl mb-6">🚀</div>
        <h3 className="text-3xl font-extrabold mb-3">Ready to Track {activeBrand?.name}</h3>
        <p className="text-white/50 mb-8 max-w-md mx-auto">Click "Run Tests" to query AI platforms and analyze how they respond to questions about your brand.</p>
        <button onClick={onRunTests} disabled={isRunning} className="btn btn-primary text-lg px-10 py-4">
          {isRunning ? 'Running...' : 'Run First Test Batch →'}
        </button>
      </div>
    )
  }

  const benchmark = INDUSTRY_BENCHMARKS[activeBrand?.industry || 'SaaS'] || INDUSTRY_BENCHMARKS.SaaS

  return (
    <div className="space-y-6">
      {/* Metrics Row - REMOVED API COST */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Visibility Score" value={`${metrics.visibilityScore}%`} trend={metrics.trend} color="#818cf8" icon="📊" />
        <MetricCard title="Total Tests" value={metrics.totalTests} color="#22d3ee" icon="🧪" />
        <MetricCard title="Top Picks" value={metrics.leaderCount} subtitle={`${((metrics.leaderCount / metrics.totalTests) * 100).toFixed(0)}%`} color="#4ade80" icon="🏆" />
        <MetricCard title="Not Found" value={metrics.notMentionedCount} color="#f87171" icon="👻" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="col-span-2 card p-6">
          <h3 className="text-lg font-bold mb-5">Visibility Over Time</h3>
          {metrics.timeline.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={metrics.timeline}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#818cf8" fill="url(#scoreGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/30">Run more tests to see trends</div>
          )}
        </div>

        {/* Funnel */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-5">Visibility Breakdown</h3>
          {FUNNEL_STAGES.map(stage => (
            <div key={stage.key} className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-white/60 text-sm">{stage.label}</span>
                <span className="font-bold text-sm font-mono" style={{ color: stage.color }}>{metrics.byType[stage.key] || 0}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${metrics.byType[stage.key] || 0}%`, background: `linear-gradient(90deg, ${stage.color}60, ${stage.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Share of Voice */}
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-5">Share of Voice vs Competitors</h3>
          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-500/15 to-primary-500/5 border-2 border-primary-500/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary-400" />
                <span className="font-bold">{activeBrand?.name}</span>
                <span className="text-xs text-white/30 bg-white/10 px-2 py-0.5 rounded">You</span>
              </div>
              <span className="text-3xl font-extrabold font-mono text-primary-400">{metrics.visibilityScore}%</span>
            </div>
            {Object.entries(metrics.competitorScores).map(([name, score]) => {
              const diff = metrics.visibilityScore - score
              return (
                <div key={name} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                  <span className="text-white/70">{name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                    <span className={`text-2xl font-extrabold font-mono ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>{score}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Benchmark */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">📊</div>
            <div>
              <h3 className="text-lg font-bold">Industry Benchmark</h3>
              <p className="text-white/50 text-sm">{activeBrand?.industry || 'SaaS'} Industry</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-2xl mb-6 flex items-center gap-4 ${
            metrics.visibilityScore >= benchmark.topPerformer ? 'bg-green-500/10 border border-green-500/20' :
            metrics.visibilityScore >= benchmark.avgVisibility ? 'bg-cyan-500/10 border border-cyan-500/20' :
            'bg-red-500/10 border border-red-500/20'
          }`}>
            <span className="text-3xl">{metrics.visibilityScore >= benchmark.topPerformer ? '🏆' : metrics.visibilityScore >= benchmark.avgVisibility ? '📈' : '📉'}</span>
            <div>
              <div className="font-bold" style={{ color: metrics.visibilityScore >= benchmark.topPerformer ? '#4ade80' : metrics.visibilityScore >= benchmark.avgVisibility ? '#22d3ee' : '#f87171' }}>
                {metrics.visibilityScore >= benchmark.topPerformer ? 'Top Performer' : metrics.visibilityScore >= benchmark.avgVisibility ? 'Above Average' : 'Below Average'}
              </div>
              <div className="text-white/50 text-sm">Your score: {metrics.visibilityScore}% vs avg: {benchmark.avgVisibility}%</div>
            </div>
          </div>

          {[{ label: 'Your Score', value: metrics.visibilityScore, color: '#818cf8' },
            { label: 'Industry Avg', value: benchmark.avgVisibility, color: 'rgba(255,255,255,0.3)' },
            { label: 'Top Performer', value: benchmark.topPerformer, color: '#4ade80' }
          ].map(item => (
            <div key={item.label} className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-white/60 text-sm">{item.label}</span>
                <span className="font-bold font-mono" style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Platforms View
function PlatformsView({ platforms, metrics }) {
  return (
    <div className="grid grid-cols-3 gap-5">
      {platforms.map(pid => {
        const platform = AI_PLATFORMS[pid]
        const stats = metrics?.byPlatform?.[pid]
        return <PlatformCard key={pid} platform={platform} stats={stats} />
      })}
    </div>
  )
}

// Results View
function ResultsView({ results }) {
  if (results.length === 0) {
    return <div className="text-center py-20 text-white/40">No results yet. Run tests to see data.</div>
  }

  return (
    <div className="space-y-3">
      {[...results].reverse().slice(0, 100).map(result => {
        const platform = AI_PLATFORMS[result.platform_id]
        const mention = MENTION_TYPES[result.brand_mention]
        return (
          <div key={result.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="badge" style={{ backgroundColor: `${platform?.color}20`, color: platform?.color, borderColor: `${platform?.color}40` }}>
                {platform?.icon} {platform?.name}
              </span>
              <span className="badge" style={{ backgroundColor: mention?.bgColor, color: mention?.color }}>
                {mention?.emoji} {mention?.label}
              </span>
              <span className="badge bg-white/5 text-white/50">{result.query_type}</span>
              {result.brand_position && <span className="text-green-400 font-bold">#{result.brand_position}</span>}
            </div>
            <p className="text-white/80">"{result.query}"</p>
            {result.snippet && <p className="text-white/40 text-sm mt-2 line-clamp-2">{result.snippet}</p>}
          </div>
        )
      })}
    </div>
  )
}

// Settings View - WITH WORKING DELETE
function SettingsView({ brand, onDeleteBrand }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (deleteInput !== brand?.name) return
    
    setIsDeleting(true)
    try {
      await onDeleteBrand(brand.id)
      setShowDeleteConfirm(false)
      // Navigate to dashboard, brand store will auto-select another brand
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete brand. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Brand Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Brand Name</label>
            <input type="text" defaultValue={brand?.name} className="input" />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Category</label>
            <input type="text" defaultValue={brand?.category} className="input" />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Industry</label>
            <select defaultValue={brand?.industry} className="input">
              {Object.keys(INDUSTRY_BENCHMARKS).map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="card p-6 border-red-500/20">
        <h3 className="text-lg font-bold mb-2 text-red-400">Danger Zone</h3>
        <p className="text-white/50 text-sm mb-4">
          Permanently delete this brand and all associated test results. This action cannot be undone.
        </p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="btn bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            Delete Brand
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-4">
            <p className="text-white/70 text-sm">
              Type <strong className="text-red-400">{brand?.name}</strong> to confirm deletion:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type brand name to confirm"
              className="input border-red-500/30 focus:border-red-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteInput !== brand?.name || isDeleting}
                className="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}