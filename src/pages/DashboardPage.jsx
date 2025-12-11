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
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import VisibilityDashboard from '../components/VisibilityDashboard'
import CompetitorDashboard from '../components/CompetitorDashboard'
import TopicPerformance from '../components/TopicPerformance'
import AISearchPerformance from '../components/AISearchPerformance'
import SourcesAttribution from '../components/SourcesAttribution'
import RecommendationsDashboard from '../components/RecommendationsDashboard'
import ContentScoreDashboard from '../components/ContentScoreDashboard'
import ROIAnalytics from '../components/ROIAnalytics'
import TrackingSettings from '../components/TrackingSettings'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, signOut } = useAuthStore()
  const { brands, activeBrandId, loadBrands, getActiveBrand, setActiveBrand, deleteBrand } = useBrandsStore()
  const { loadResults, getResults } = useResultsStore()
  const { activeTab, setActiveTab } = useUIStore()
  const { isRunning: isTracking, progress: trackingProgress, logs: trackingLogs, runTracking, stopTracking } = useTracking()
  
  const [showTopicWizard, setShowTopicWizard] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, brandId: null, brandName: '' })

  const activeBrand = getActiveBrand()
  const brandResults = activeBrand ? getResults(activeBrand.id) : []
  
  const hasTrackingConfig = activeBrand?.settings?.prompts?.length > 0
  
  const openWizard = (brandToEdit = null) => {
    setEditingBrand(brandToEdit)
    setShowTopicWizard(true)
  }
  
  const closeWizard = () => {
    setShowTopicWizard(false)
    setEditingBrand(null)
  }
  
  const openDeleteModal = (brandId, brandName) => {
    setDeleteModal({ isOpen: true, brandId, brandName })
  }
  
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, brandId: null, brandName: '' })
  }
  
  const handleDeleteBrand = async () => {
    const { brandId } = deleteModal
    if (!brandId) return
    
    console.log('[Dashboard] Deleting brand:', brandId)
    
    try {
      await deleteBrand(brandId)
      console.log('[Dashboard] Delete successful')
      
      // Switch to another brand if we deleted the active one
      if (activeBrandId === brandId) {
        const remaining = brands.filter(b => b.id !== brandId)
        if (remaining.length > 0) {
          setActiveBrand(remaining[0].id)
        }
      }
      
      // Reload brands and close modal
      if (user?.id) await loadBrands(user.id)
      closeDeleteModal()
    } catch (e) {
      console.error('[Dashboard] Delete failed:', e)
      throw e // Let the modal handle the error display
    }
  }

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
      // Safely parse arrays that might be JSON strings
      let platforms = activeBrand.selected_platforms || []
      if (typeof platforms === 'string') {
        try { platforms = JSON.parse(platforms) } catch { platforms = [] }
      }
      if (!Array.isArray(platforms)) platforms = []
      
      let competitors = activeBrand.competitors || []
      if (typeof competitors === 'string') {
        try { competitors = JSON.parse(competitors) } catch { competitors = [] }
      }
      if (!Array.isArray(competitors)) competitors = []
      
      const m = calculateMetrics(brandResults, platforms, competitors)
      setMetrics(m)
    } else setMetrics(null)
  }, [brandResults, activeBrand])

  useEffect(() => {
    if (!authLoading && brands.length === 0) setShowTopicWizard(true)
  }, [brands, authLoading])

  const handleRunTracking = async () => {
    console.log('[handleRunTracking] Button clicked!', { activeBrand: activeBrand?.name, userId: user?.id })
    if (activeBrand && user) {
      console.log('[handleRunTracking] Calling runTracking...')
      await runTracking(activeBrand, user.id)
      loadResults(activeBrand.id)
    } else {
      console.log('[handleRunTracking] BLOCKED - activeBrand:', !!activeBrand, 'user:', !!user)
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {showTopicWizard && (
        <TopicTrackingWizard
          userId={user?.id}
          editBrand={editingBrand}
          onComplete={() => {
            closeWizard()
            loadBrands(user.id)
          }}
          onCancel={brands.length > 0 ? closeWizard : null}
        />
      )}

      <Header 
        user={user} 
        brands={brands} 
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand} 
        onAddBrand={() => openWizard(null)} 
        onDeleteBrand={(brandId, brandName) => {
          if (brands.length <= 1) return
          openDeleteModal(brandId, brandName)
        }}
        onOpenTopicWizard={() => openWizard(activeBrand)}
        onSignOut={signOut}
        isTracking={isTracking}
        trackingProgress={trackingProgress}
        onRunTracking={handleRunTracking}
        onStopTracking={stopTracking}
        hasTrackingConfig={hasTrackingConfig}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        brandName={deleteModal.brandName}
        onConfirm={handleDeleteBrand}
        onCancel={closeDeleteModal}
      />

      <div className="min-h-[calc(100vh-56px)]">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          resultsCount={brandResults.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="ml-[52px] p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView 
              metrics={metrics} 
              activeBrand={activeBrand} 
              onRunTests={handleRunTracking} 
              isRunning={isTracking} 
              onOpenTopicWizard={() => openWizard(activeBrand)} 
            />
          )}
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
              competitors={(() => {
                let comps = activeBrand?.competitors || []
                if (typeof comps === 'string') {
                  try { comps = JSON.parse(comps) } catch { comps = [] }
                }
                return Array.isArray(comps) ? comps : []
              })()}
              timeRange="30d"
            />
          )}
          {activeTab === 'results' && <ResultsView results={brandResults} />}
          {activeTab === 'reports' && <ReportsView brand={activeBrand} results={brandResults} />}
          {activeTab === 'alerts' && <AlertsView brand={activeBrand} />}
          {activeTab === 'tracking-settings' && (
            <TrackingSettings 
              brand={activeBrand}
              userId={user?.id}
              onSave={() => loadBrands(user.id)}
            />
          )}
          </div>
        </main>
      </div>
    </div>
  )
}

// Minimal Icons
const Icons = {
  chart: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  beaker: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 3h6m-5 0v6.5L4 19.5A1 1 0 005 21h14a1 1 0 001-1.5L14 9.5V3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2m12 6h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 9V5a2 2 0 012-2h8a2 2 0 012 2v4m-12 0a6 6 0 006 6m6-6a6 6 0 01-6 6m0 0v4m-3 0h6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  eyeOff: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 2.991 5.282 6 9 6 1.55 0 3.043-.523 4.395-1.35M12 6c3.718 0 7.111 3.009 9 6-.947 1.5-2.07 2.793-3.313 3.814" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bolt: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  lightbulb: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18h6m-5 4h4M12 2a7 7 0 00-4 12.73V17a1 1 0 001 1h6a1 1 0 001-1v-2.27A7 7 0 0012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  barChart: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trendUp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trendDown: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  inbox: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

// Custom Tooltip for Charts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg bg-[#1a1a1f] border border-white/[0.1] shadow-xl">
      <div className="text-[11px] text-white/40 mb-1">{label}</div>
      <div className="text-[14px] font-semibold text-amber-400">
        {payload[0].value}%
      </div>
    </div>
  )
}

// Bento Card Component
function BentoCard({ children, className = '', size = 'default' }) {
  const sizes = {
    small: 'p-5',
    default: 'p-6',
    large: 'p-8'
  }
  return (
    <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm ${sizes[size]} ${className}`}>
      {children}
    </div>
  )
}

// Metric Stat Component
function MetricStat({ label, value, trend, color = 'amber', icon }) {
  const colors = {
    amber: 'text-amber-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-sky-400',
    white: 'text-white'
  }
  const iconColors = {
    amber: 'text-amber-400/60',
    green: 'text-emerald-400/60',
    red: 'text-red-400/60',
    blue: 'text-sky-400/60',
    white: 'text-white/40'
  }
  return (
    <BentoCard>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] text-white/40">{label}</span>
        {icon && <span className={iconColors[color]}>{icon}</span>}
      </div>
      <div className={`text-3xl font-bold ${colors[color]} font-mono`}>{value}</div>
      {trend !== undefined && (
        <div className={`text-[12px] mt-2 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
        </div>
      )}
    </BentoCard>
  )
}

function DashboardView({ metrics, activeBrand, onRunTests, isRunning, onOpenTopicWizard }) {
  if (!metrics) {
    return (
      <div className="space-y-6">
        {/* Empty State - First Run */}
        <BentoCard size="large" className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Ready to Track {activeBrand?.name}</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto leading-relaxed">
            Run your first test to see how AI platforms respond to questions about your brand.
          </p>
          <button 
            onClick={onRunTests} 
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-black font-semibold text-[15px] hover:brightness-110 transition disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>Run First Test</>
            )}
          </button>
        </BentoCard>

        {/* Configure Advanced Tracking */}
        <BentoCard className="max-w-2xl mx-auto">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-semibold text-white mb-1">Advanced Topic Tracking</h4>
              <p className="text-[13px] text-white/40">Set up custom prompts, personas, and detailed tracking.</p>
            </div>
            <button 
              onClick={onOpenTopicWizard}
              className="px-5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 text-[13px] font-medium hover:bg-white/[0.08] hover:text-white transition"
            >
              Configure
            </button>
          </div>
        </BentoCard>
      </div>
    )
  }

  const benchmark = INDUSTRY_BENCHMARKS[activeBrand?.industry || 'SaaS'] || INDUSTRY_BENCHMARKS.SaaS

  return (
    <div className="space-y-6">
      {/* Metrics Grid - Bento Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStat 
          label="Visibility Score" 
          value={`${metrics.visibilityScore}%`} 
          trend={metrics.trend} 
          color="amber"
          icon={Icons.chart}
        />
        <MetricStat 
          label="Total Tests" 
          value={metrics.totalTests} 
          color="white"
          icon={Icons.beaker}
        />
        <MetricStat 
          label="Top Picks" 
          value={metrics.leaderCount}
          color="green"
          icon={Icons.trophy}
        />
        <MetricStat 
          label="Not Found" 
          value={metrics.notMentionedCount} 
          color="red"
          icon={Icons.eyeOff}
        />
      </div>

      {/* Main Content - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart - Takes more space */}
        <BentoCard className="lg:col-span-3">
          <h3 className="text-[15px] font-semibold text-white mb-5">Visibility Over Time</h3>
          {metrics.timeline.length > 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={metrics.timeline}>
                <defs>
                  <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.06)" 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                  tickFormatter={v => v.slice(5)} 
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.06)" 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                  axisLine={false}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#f59e0b" 
                  fill="url(#amberGrad)" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-white/20 text-[14px]">
              Run more tests to see trends
            </div>
          )}
        </BentoCard>

        {/* Topic Breakdown - shows actual topics from results */}
        <BentoCard className="lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-white mb-5">Visibility by Topic</h3>
          <div className="space-y-5">
            {Object.keys(metrics.byType).length > 0 ? (
              Object.entries(metrics.byType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([topic, value], idx) => {
                  const colors = ['#f59e0b', '#22d3ee', '#a78bfa', '#10b981', '#ec4899']
                  const color = colors[idx % colors.length]
                  return (
                    <div key={topic}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[13px] text-white/50 truncate max-w-[200px]">{topic}</span>
                        <span className="text-[13px] font-semibold font-mono" style={{ color }}>
                          {value}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${value}%`, 
                            background: color 
                          }} 
                        />
                      </div>
                    </div>
                  )
                })
            ) : (
              <div className="text-center py-8">
                <p className="text-[13px] text-white/40">No topic data available</p>
                <p className="text-[11px] text-white/30 mt-1">Run tracking to see visibility by topic</p>
              </div>
            )}
          </div>
        </BentoCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share of Voice */}
        <BentoCard>
          <h3 className="text-[15px] font-semibold text-white mb-5">Share of Voice vs Competitors</h3>
          <div className="space-y-3">
            {/* Your Brand */}
            <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-[14px] font-medium text-white">{activeBrand?.name}</span>
                <span className="text-[11px] text-amber-400/60 bg-amber-400/10 px-2 py-0.5 rounded">You</span>
              </div>
              <span className="text-2xl font-bold font-mono text-amber-400">{metrics.visibilityScore}%</span>
            </div>
            
            {/* Competitors */}
            {Object.entries(metrics.competitorScores).map(([name, score]) => {
              const diff = metrics.visibilityScore - score
              return (
                <div key={name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                  <span className="text-[14px] text-white/60">{name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] font-medium ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                    <span className={`text-xl font-bold font-mono ${diff > 0 ? 'text-white/40' : 'text-red-400'}`}>
                      {score}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        {/* Industry Benchmark */}
        <BentoCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white">Industry Benchmark</h3>
              <p className="text-[13px] text-white/40">{activeBrand?.industry || 'SaaS'} Industry</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            metrics.visibilityScore >= benchmark.topPerformer 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : metrics.visibilityScore >= benchmark.avgVisibility 
                ? 'bg-sky-500/10 border border-sky-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className={`${
              metrics.visibilityScore >= benchmark.topPerformer ? 'text-emerald-400' : 
              metrics.visibilityScore >= benchmark.avgVisibility ? 'text-sky-400' : 'text-red-400'
            }`}>
              {metrics.visibilityScore >= benchmark.topPerformer ? Icons.trophy : 
               metrics.visibilityScore >= benchmark.avgVisibility ? Icons.trendUp : Icons.trendDown}
            </div>
            <div>
              <div className={`text-[14px] font-semibold ${
                metrics.visibilityScore >= benchmark.topPerformer ? 'text-emerald-400' : 
                metrics.visibilityScore >= benchmark.avgVisibility ? 'text-sky-400' : 'text-red-400'
              }`}>
                {metrics.visibilityScore >= benchmark.topPerformer ? 'Top Performer' : 
                 metrics.visibilityScore >= benchmark.avgVisibility ? 'Above Average' : 'Below Average'}
              </div>
              <div className="text-[12px] text-white/40">
                Your score: {metrics.visibilityScore}% vs avg: {benchmark.avgVisibility}%
              </div>
            </div>
          </div>

          {/* Benchmark Bars */}
          <div className="space-y-4">
            {[
              { label: 'Your Score', value: metrics.visibilityScore, color: '#f59e0b' },
              { label: 'Industry Avg', value: benchmark.avgVisibility, color: 'rgba(255,255,255,0.2)' },
              { label: 'Top Performer', value: benchmark.topPerformer, color: '#10b981' }
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] text-white/50">{item.label}</span>
                  <span className="text-[13px] font-semibold font-mono" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.value}%`, background: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}

// Results View
function ResultsView({ results }) {
  const [expandedResult, setExpandedResult] = useState(null)
  
  if (!results.length) {
    return (
      <BentoCard size="large" className="text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">
          {Icons.inbox}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Results Yet</h3>
        <p className="text-[14px] text-white/40">Run your first test to see results here.</p>
      </BentoCard>
    )
  }

  // Helper to get response text from various possible fields
  const getResponseText = (result) => {
    return result.response_text || result.full_response || result.response || result.snippet || null
  }

  // Helper to get valid sources (with URLs)
  const getValidSources = (result) => {
    if (!Array.isArray(result.sources)) return []
    return result.sources
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Test Results</h2>
        <span className="text-[13px] text-white/40">{results.length} total</span>
      </div>
      <div className="space-y-3">
        {results.slice(0, 50).map((result, i) => {
          const responseText = getResponseText(result)
          const validSources = getValidSources(result)
          
          return (
            <BentoCard key={result.id || i} size="small" className="cursor-pointer hover:border-white/[0.12] transition">
              <div 
                className="flex items-start justify-between gap-4"
                onClick={() => setExpandedResult(expandedResult === i ? null : i)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-white/80">{result.query}</p>
                  <p className="text-[12px] text-white/40 mt-1">{result.platform_name || result.platform_id} • {result.model} • {new Date(result.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[12px] font-medium flex-shrink-0 ${
                  result.mention_type === 'leader' ? 'bg-emerald-500/10 text-emerald-400' :
                  result.mention_type === 'mentioned' || result.mention_type === 'recommended' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-white/[0.05] text-white/40'
                }`}>
                  {result.mention_type === 'leader' ? 'Top Pick' : 
                   result.mention_type === 'recommended' ? 'Recommended' :
                   result.mention_type === 'mentioned' ? 'Mentioned' : 'Not Found'}
                </span>
              </div>
              
              {/* Expanded View */}
              {expandedResult === i && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="mb-3">
                    <span className="text-[11px] text-white/30 uppercase tracking-wide">AI Response</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] max-h-64 overflow-y-auto">
                    {responseText ? (
                      <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">
                        {responseText}
                      </p>
                    ) : (
                      <p className="text-[13px] text-white/40 italic">
                        Response not stored. Check database column 'response_text' or 'full_response'.
                      </p>
                    )}
                  </div>
                  {validSources.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] text-white/30 uppercase tracking-wide">Sources Referenced</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {validSources.map((src, j) => {
                          const url = typeof src === 'string' ? src : src?.url
                          const name = typeof src === 'string' ? src : (src?.name || 'Source')
                          const hasUrl = url && url.startsWith('http')
                          
                          return hasUrl ? (
                            <a 
                              key={j} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md bg-amber-500/10 text-[12px] text-amber-400 hover:bg-amber-500/20 transition"
                            >
                              🔗 {name}
                            </a>
                          ) : (
                            <span 
                              key={j}
                              className="px-2 py-1 rounded-md bg-white/[0.05] text-[12px] text-white/50"
                            >
                              {name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </BentoCard>
          )
        })}
      </div>
    </div>
  )
}

// Reports View
function ReportsView({ brand, results }) {
  return (
    <BentoCard size="large" className="text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">
        {Icons.document}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Reports Coming Soon</h3>
      <p className="text-[14px] text-white/40">Automated weekly and monthly reports will be available here.</p>
    </BentoCard>
  )
}

// Alerts View
function AlertsView({ brand }) {
  return (
    <BentoCard size="large" className="text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-white/30">
        {Icons.bell}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Alerts Coming Soon</h3>
      <p className="text-[14px] text-white/40">Get notified when your visibility changes significantly.</p>
    </BentoCard>
  )
}
