import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuthStore, useBrandsStore, useResultsStore, useUIStore } from '../hooks/useStore'
import { useTracking } from '../hooks/useTracking'
import { AI_PLATFORMS, MENTION_TYPES, FUNNEL_STAGES, INDUSTRY_BENCHMARKS } from '../lib/constants'
import { calculateMetrics } from '../lib/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import PlatformCard from '../components/PlatformCard'
import TopicTrackingWizard from '../components/TopicTrackingWizard'
import VisibilityDashboard from '../components/VisibilityDashboard'
import CompetitorDashboard from '../components/CompetitorDashboard'
import TopicPerformance from '../components/TopicPerformance'
import AISearchPerformance from '../components/AISearchPerformance'
import SourcesAttribution from '../components/SourcesAttribution'
import RecommendationsDashboard from '../components/RecommendationsDashboard'
import ContentScoreDashboard from '../components/ContentScoreDashboard'
import ROIAnalytics from '../components/ROIAnalytics'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, signOut } = useAuthStore()
  const { brands, activeBrandId, loadBrands, getActiveBrand, setActiveBrand } = useBrandsStore()
  const { loadResults, getResults } = useResultsStore()
  const { activeTab, setActiveTab } = useUIStore()
  const { isRunning: isTracking, progress: trackingProgress, logs: trackingLogs, runTracking, stopTracking } = useTracking()
  
  const [showTopicWizard, setShowTopicWizard] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeBrand = getActiveBrand()
  const brandResults = activeBrand ? getResults(activeBrand.id) : []
  
  // Check if brand has tracking configuration from wizard
  const hasTrackingConfig = activeBrand?.settings?.prompts?.length > 0

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
    if (!authLoading && brands.length === 0) setShowTopicWizard(true)
  }, [brands, authLoading])

  // Handle run tracking
  const handleRunTracking = async () => {
    if (activeBrand && user) {
      await runTracking(activeBrand, user.id)
      // Reload results after tracking
      loadResults(activeBrand.id)
    }
  }

  if (authLoading) return <div className="min-h-screen bg-dark-400 flex items-center justify-center"><div className="spinner w-8 h-8" /></div>

  return (
    <div className="min-h-screen bg-dark-400 text-white">
      {/* Topic Tracking Wizard Modal */}
      {showTopicWizard && (
        <TopicTrackingWizard
          userId={user?.id}
          onComplete={() => {
            setShowTopicWizard(false)
            loadBrands(user.id)
          }}
          onCancel={brands.length > 0 ? () => setShowTopicWizard(false) : null}
          existingBrands={brands}
        />
      )}

      <Header 
        user={user} 
        profile={profile} 
        brands={brands} 
        activeBrandId={activeBrandId}
        onBrandChange={setActiveBrand} 
        onAddBrand={() => setShowTopicWizard(true)} 
        onSignOut={signOut}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenTopicWizard={() => setShowTopicWizard(true)}
        // Tracking props
        isTracking={isTracking}
        trackingProgress={trackingProgress}
        onRunTracking={handleRunTracking}
        onStopTracking={stopTracking}
        hasTrackingConfig={hasTrackingConfig}
      />

      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          resultsCount={brandResults.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:ml-60">
          {activeTab === 'dashboard' && <DashboardView metrics={metrics} activeBrand={activeBrand} onRunTests={handleRunTracking} isRunning={isTracking} onOpenTopicWizard={() => setShowTopicWizard(true)} />}
          {activeTab === 'score' && (
            <ContentScoreDashboard 
              results={brandResults}
              brand={activeBrand}
              competitors={activeBrand?.competitors || []}
            />
          )}
          {activeTab === 'visibility' && (
            <VisibilityDashboard 
              results={brandResults} 
              brand={activeBrand}
              competitors={activeBrand?.competitors || []}
              timeRange="30d"
            />
          )}
          {activeTab === 'sources' && (
            <SourcesAttribution 
              results={brandResults}
              brand={activeBrand}
            />
          )}
          {activeTab === 'recommendations' && (
            <RecommendationsDashboard 
              results={brandResults}
              brand={activeBrand}
              competitors={activeBrand?.competitors || []}
            />
          )}
          {activeTab === 'ai-search' && (
            <AISearchPerformance 
              results={brandResults}
              brand={activeBrand}
            />
          )}
          {activeTab === 'topics' && (
            <TopicPerformance 
              results={brandResults}
              topics={activeBrand?.settings?.topics || []}
              brand={activeBrand}
              competitors={activeBrand?.competitors || []}
            />
          )}
          {activeTab === 'roi' && (
            <ROIAnalytics 
              results={brandResults}
              brand={activeBrand}
            />
          )}
          {activeTab === 'competitors' && (
            <CompetitorDashboard 
              results={brandResults}
              brand={activeBrand}
              competitors={activeBrand?.competitors || []}
              timeRange="30d"
            />
          )}
          {activeTab === 'results' && <ResultsView results={brandResults} />}
          {activeTab === 'reports' && <ReportsView brand={activeBrand} results={brandResults} />}
          {activeTab === 'alerts' && <AlertsView brand={activeBrand} />}
        </main>
      </div>
    </div>
  )
}

function DashboardView({ metrics, activeBrand, onRunTests, isRunning, onOpenTopicWizard }) {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="card p-8 md:p-16 text-center bg-gradient-to-br from-primary-500/10 to-purple-500/5 border-primary-500/20">
          <div className="text-6xl md:text-7xl mb-6">🚀</div>
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Track {activeBrand?.name}</h3>
          <p className="text-white/50 mb-8 max-w-md mx-auto">Click "Run Tests" to query AI platforms and analyze how they respond to questions about your brand.</p>
          <button onClick={onRunTests} disabled={isRunning} className="btn btn-primary text-lg px-10 py-4">
            {isRunning ? 'Running...' : 'Run First Test Batch →'}
          </button>
        </div>

        {/* Advanced Topic Tracking CTA */}
        <div className="card p-6 md:p-8 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-3xl flex-shrink-0">
              🎯
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Advanced Topic Tracking</h3>
              <p className="text-white/50 max-w-xl">Set up comprehensive topic monitoring with AI-generated prompts, custom personas, and detailed tracking across multiple AI search engines.</p>
            </div>
            <button 
              onClick={onOpenTopicWizard}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Configure Topic Tracking
            </button>
          </div>
        </div>
      </div>
    )
  }

  const benchmark = INDUSTRY_BENCHMARKS[activeBrand?.industry || 'SaaS'] || INDUSTRY_BENCHMARKS.SaaS

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Visibility Score" value={`${metrics.visibilityScore}%`} trend={metrics.trend} color="#818cf8" icon="📊" />
        <MetricCard title="Total Tests" value={metrics.totalTests} color="#22d3ee" icon="🧪" />
        <MetricCard title="Top Picks" value={metrics.leaderCount} subtitle={`${((metrics.leaderCount / metrics.totalTests) * 100).toFixed(0)}%`} color="#4ade80" icon="🏆" />
        <MetricCard title="Not Found" value={metrics.notMentionedCount} color="#f87171" icon="👻" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

function PlatformsView({ platforms, metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {platforms.map(pid => {
        const platform = AI_PLATFORMS[pid]
        const stats = metrics?.byPlatform?.[pid]
        return <PlatformCard key={pid} platform={platform} stats={stats} />
      })}
    </div>
  )
}

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

function SettingsView({ brand, onDeleteBrand }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (deleteInput !== brand?.name) return
    setIsDeleting(true)
    try {
      await onDeleteBrand(brand.id)
      setShowDeleteConfirm(false)
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
        <p className="text-white/50 text-sm mb-4">Permanently delete this brand and all test results.</p>
        
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20">
            Delete Brand
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-4">
            <p className="text-white/70 text-sm">Type <strong className="text-red-400">{brand?.name}</strong> to confirm:</p>
            <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="Type brand name" className="input border-red-500/30" />
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleteInput !== brand?.name || isDeleting} className="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Reports View - Custom dashboards and exports
function ReportsView({ brand, results }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [exporting, setExporting] = useState(false)

  const templates = [
    { 
      id: 'executive', 
      name: 'Executive Summary', 
      description: 'High-level visibility metrics and trends for leadership',
      icon: '📊',
      color: '#818cf8'
    },
    { 
      id: 'competitive', 
      name: 'Competitive Analysis', 
      description: 'Detailed competitor comparison and market share',
      icon: '⚔️',
      color: '#f97316'
    },
    { 
      id: 'platform', 
      name: 'Platform Performance', 
      description: 'Per-platform breakdown and optimization opportunities',
      icon: '🤖',
      color: '#22d3ee'
    },
    { 
      id: 'content', 
      name: 'Content Team Brief', 
      description: 'Topic performance and content recommendations',
      icon: '📝',
      color: '#4ade80'
    }
  ]

  const handleExport = async (format) => {
    setExporting(true)
    try {
      // Generate export data
      const data = results.map(r => ({
        date: r.created_at,
        platform: AI_PLATFORMS[r.platform_id]?.name || r.platform_id,
        query: r.query,
        query_type: r.query_type,
        mention_type: MENTION_TYPES[r.brand_mention]?.label || r.brand_mention,
        position: r.brand_position || '-',
        snippet: r.snippet || ''
      }))

      if (format === 'csv') {
        const headers = Object.keys(data[0] || {}).join(',')
        const rows = data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        const csv = [headers, ...rows].join('\n')
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${brand?.name || 'brandaura'}-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'json') {
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${brand?.name || 'brandaura'}-report-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
    setExporting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Reports & Exports</h2>
          <p className="text-white/50 text-sm mt-1">Generate custom reports and export your data</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exporting || results.length === 0}
            className="btn btn-secondary text-sm"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            onClick={() => handleExport('json')}
            disabled={exporting || results.length === 0}
            className="btn btn-secondary text-sm"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Report Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`card p-5 text-left hover:border-white/20 transition ${
                selectedTemplate === template.id ? 'border-primary-500/50 bg-primary-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${template.color}20` }}
                >
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-white/50 text-sm mt-1">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="text-primary-400">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats for Report Preview */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Report Preview</h3>
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold font-mono text-primary-400">{results.length}</div>
              <div className="text-sm text-white/50">Total Tests</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold font-mono text-green-400">
                {results.filter(r => r.brand_mention !== 'notMentioned').length}
              </div>
              <div className="text-sm text-white/50">Mentions</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold font-mono text-yellow-400">
                {results.filter(r => r.brand_mention === 'leader').length}
              </div>
              <div className="text-sm text-white/50">Top Picks</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold font-mono">
                {[...new Set(results.map(r => r.platform_id))].length}
              </div>
              <div className="text-sm text-white/50">Platforms</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-white/40">
            No data to report. Run tests first.
          </div>
        )}
      </div>

      {/* Scheduled Reports (Coming Soon) */}
      <div className="card p-6 opacity-60">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold">Scheduled Reports</h3>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Coming Soon</span>
        </div>
        <p className="text-white/50 text-sm">
          Automatically receive reports via email on a weekly or monthly basis.
        </p>
      </div>
    </div>
  )
}

// Alerts View - Monitoring and notifications
function AlertsView({ brand }) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'visibility_drop', name: 'Visibility Drop Alert', description: 'Alert when visibility score drops below threshold', enabled: true, threshold: 30 },
    { id: 2, type: 'competitor_surge', name: 'Competitor Surge', description: 'Alert when a competitor gains significant share', enabled: false, threshold: 20 },
    { id: 3, type: 'negative_sentiment', name: 'Negative Sentiment', description: 'Alert on negative brand mentions', enabled: true, threshold: null },
    { id: 4, type: 'topic_performance', name: 'Topic Performance', description: 'Alert when specific topics underperform', enabled: false, threshold: 25 }
  ])

  const toggleAlert = (alertId) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ))
  }

  const alertHistory = [
    { id: 1, type: 'visibility_drop', message: 'Visibility dropped to 28% on ChatGPT', time: '2 hours ago', severity: 'warning' },
    { id: 2, type: 'competitor_surge', message: 'Competitor "Acme Corp" increased share by 15%', time: '1 day ago', severity: 'info' },
    { id: 3, type: 'negative_sentiment', message: 'Negative mention detected in Perplexity response', time: '3 days ago', severity: 'error' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Alerts & Monitoring</h2>
        <p className="text-white/50 text-sm mt-1">Set up notifications for important changes in your AI visibility</p>
      </div>

      {/* Alert Rules */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Alert Rules</h3>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`card p-5 ${alert.enabled ? 'border-primary-500/30' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    alert.enabled ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-white/40'
                  }`}>
                    {alert.type === 'visibility_drop' && '📉'}
                    {alert.type === 'competitor_surge' && '⚔️'}
                    {alert.type === 'negative_sentiment' && '😟'}
                    {alert.type === 'topic_performance' && '🎯'}
                  </div>
                  <div>
                    <h4 className="font-medium">{alert.name}</h4>
                    <p className="text-white/50 text-sm">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {alert.threshold && (
                    <div className="text-sm text-white/50">
                      Threshold: <span className="font-mono text-white">{alert.threshold}%</span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`relative w-12 h-6 rounded-full transition ${
                      alert.enabled ? 'bg-primary-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      alert.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alertHistory.map(alert => (
            <div key={alert.id} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                alert.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {alert.severity === 'error' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-white/40 text-sm">{alert.time}</p>
              </div>
              <button className="text-primary-400 hover:text-primary-300 text-sm">View →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Daily Digest</div>
              <div className="text-white/50 text-sm">Receive a daily summary of alerts</div>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-white/10">
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Weekly Report</div>
              <div className="text-white/50 text-sm">Weekly visibility performance summary</div>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-primary-500">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Instant Alerts</div>
              <div className="text-white/50 text-sm">Get notified immediately for critical alerts</div>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-primary-500">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}