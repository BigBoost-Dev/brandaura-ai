import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../hooks/useStore'
import { motion } from 'framer-motion'
import { Marquee } from '../components/magicui/marquee'
import { NumberTicker } from '../components/magicui/number-ticker'
import { BorderBeam } from '../components/magicui/border-beam'
import { TextReveal } from '../components/magicui/text-reveal'
import { cn } from '../lib/utils'

// ============================================================================
// DESIGN PHILOSOPHY: Editorial Luxury
// - Serif headlines (Playfair Display) for editorial gravitas
// - Asymmetric, left-aligned layout breaking from centered SaaS patterns
// - One orchestrated entrance animation with precise staggering
// - Dashed glassmorphism cards with top glow (Resend signature)
// - Gold/amber accent on key phrases only (not everywhere)
// - Generous whitespace, letting elements breathe
// ============================================================================

// Logo Component
function Logo({ size = 32 }) {
  return (
    <div 
      className="rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25"
      style={{ width: size, height: size }}
    >
      <span className="text-black font-semibold" style={{ fontSize: size * 0.5 }}>B</span>
    </div>
  )
}

export { Logo as LogoIcon }

// Hook for scroll detection
function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])
  
  return scrolled
}

// 3D Hero Visualization - Floating AI cards
function HeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[550px]">
      {/* Ambient glow behind cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/15 blur-[120px] rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-[150px] h-[150px] bg-orange-500/10 blur-[80px] rounded-full" />
      
      {/* Main floating card - AI Response - Moved up to center */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute top-[38%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[280px] lg:w-[300px]"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] backdrop-blur-xl p-5 shadow-2xl shadow-black/50">
            {/* Top glow */}
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-black text-xs font-bold">AI</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white/90">Brand Analysis</div>
                <div className="text-xs text-white/40">ChatGPT Response</div>
              </div>
            </div>
            
            {/* Content preview */}
            <div className="space-y-2 mb-4">
              <div className="h-2 bg-white/[0.06] rounded-full w-full" />
              <div className="h-2 bg-white/[0.06] rounded-full w-4/5" />
              <div className="h-2 bg-white/[0.06] rounded-full w-3/5" />
            </div>
            
            {/* Mention highlight */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs text-amber-400/90">Your brand mentioned</span>
              <span className="text-xs text-white/60 ml-auto">+3 sources</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating card - Top right - ChatGPT */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute top-4 right-0 lg:top-6 lg:right-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-lg shadow-xl shadow-black/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[10px] text-[#10a37f]">G</span>
              </div>
              <div>
                <div className="text-[11px] text-white/70">ChatGPT</div>
                <div className="text-[10px] text-emerald-400">● Tracking</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating card - Bottom left - Claude */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-[38%] left-0"
      >
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-lg shadow-xl shadow-black/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center">
                <span className="text-[10px] text-amber-400">C</span>
              </div>
              <div>
                <div className="text-[11px] text-white/70">Claude</div>
                <div className="text-[10px] text-amber-400">● Tracking</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Score indicator - Top left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute top-[5%] left-[8%]"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] backdrop-blur-lg flex flex-col items-center justify-center shadow-xl shadow-black/30">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">87</span>
            <span className="text-[9px] text-white/40">Score</span>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Gemini card - Top center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="absolute top-[2%] left-[35%]"
      >
        <motion.div
          animate={{ y: [0, -7, 0], rotate: [0, -1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.06] backdrop-blur-lg shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
                <span className="text-[9px] text-violet-400">G</span>
              </div>
              <div className="text-[10px] text-white/50">Gemini</div>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Sources card - Right middle */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="absolute top-[28%] right-0"
      >
        <motion.div
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-lg shadow-xl shadow-black/30">
            <div className="text-[10px] text-white/40 mb-2">Sources Found</div>
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded bg-white/[0.06] flex items-center justify-center text-[8px] text-white/50">W</div>
              <div className="w-6 h-6 rounded bg-white/[0.06] flex items-center justify-center text-[8px] text-white/50">F</div>
              <div className="w-6 h-6 rounded bg-white/[0.06] flex items-center justify-center text-[8px] text-white/50">T</div>
              <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-[8px] text-amber-400">+5</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Trend indicator - Bottom right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-[15%] right-[5%]"
      >
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 1, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-lg shadow-xl shadow-black/30">
            <div className="flex items-center gap-3">
              <div className="text-emerald-400 text-lg">↑</div>
              <div>
                <div className="text-[11px] text-white/70">Visibility</div>
                <div className="text-[10px] text-emerald-400">+23% this week</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Perplexity indicator - Left middle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="absolute top-[22%] left-0"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.06] backdrop-blur-lg shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
                <span className="text-[9px] text-cyan-400">P</span>
              </div>
              <div className="text-[10px] text-cyan-400">● Live</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Alert badge - Bottom center-left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="absolute bottom-8 left-[35%]"
      >
        <motion.div
          animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] text-amber-400">New mention</span>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Competitor tracking - Lower center to fill gap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.95 }}
        className="absolute bottom-[22%] left-[15%]"
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        >
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-lg shadow-xl shadow-black/30">
            <div className="text-[9px] text-white/30 mb-1">Competitor</div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-red-400/80">-12%</span>
              <div className="w-12 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-red-400/50 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Ranking badge - Upper area to fill gap */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute top-[18%] right-[35%]"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        >
          <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.06] backdrop-blur-lg shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/50">#</span>
              <span className="text-[14px] font-semibold text-amber-400">2</span>
              <span className="text-[9px] text-white/30">rank</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* NEW: Query count - Middle right area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.05 }}
        className="absolute top-[55%] right-[8%]"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        >
          <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.06] backdrop-blur-lg shadow-lg shadow-black/20">
            <div className="text-[9px] text-white/30 mb-1">Queries</div>
            <div className="text-[13px] font-medium text-white/70">1,247</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating orbs for depth */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[30%] right-[30%] w-4 h-4 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-500/20 blur-[2px]"
      />
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[25%] right-[50%] w-3 h-3 rounded-full bg-gradient-to-br from-white/30 to-white/10 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[45%] left-[20%] w-2 h-2 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-400/10 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -18, 0], x: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[45%] left-[30%] w-3 h-3 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/10 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-[12%] right-[20%] w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute top-[35%] left-[45%] w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400/25 to-orange-400/15 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, -16, 0], x: [0, -5, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute bottom-[50%] right-[45%] w-2 h-2 rounded-full bg-gradient-to-br from-white/20 to-white/5 blur-[1px]"
      />
    </div>
  )
}

// Glassmorphism Card - Resend style with dashed border + top glow
function GlassCard({ children, className, glow = true }) {
  return (
    <div className={cn("relative", className)}>
      {/* Dashed border */}
      <div className="absolute inset-0 rounded-2xl border border-dashed border-white/[0.1]" />
      {/* Top glow line */}
      {glow && (
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      )}
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent" />
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  )
}

// Noise texture overlay
function NoiseOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

// AI Platform Pills - 8 total, 2 rows of 4
const platforms = [
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Claude', color: '#d4a574' },
  { name: 'Gemini', color: '#8b5cf6' },
  { name: 'Perplexity', color: '#22d3ee' },
  { name: 'Copilot', color: '#0078d4' },
  { name: 'Meta AI', color: '#0668E1' },
  { name: 'Grok', color: '#f4f4f5' },
  { name: 'Poe', color: '#a855f7' },
]

// Stats - structured for counter animation
const stats = [
  { value: 40, suffix: '%', line1: 'of searches will use', line2: 'AI by 2026' },
  { value: 67, suffix: '%', line1: 'trust AI recommendations', line2: 'over ads' },
  { value: 3, suffix: '×', line1: 'higher conversion from', line2: 'AI referrals' },
  { value: 50, suffix: '%', line1: 'of AI citations differ', line2: 'from Google' },
]

// Features - expanded to 6 with minimal icons
const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: 'Source Attribution',
    description: 'Discover WHERE AI learns about your brand – review sites, publications, forums. Know exactly what content to create.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Content Scoring',
    description: 'Score any content 0-100 for AI discoverability. Get specific recommendations to improve before publishing.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'Optimization Recommendations',
    description: 'Actionable insights based on your results. Know exactly what to fix to get mentioned more.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'ROI Analytics',
    description: 'Estimate monthly reach, clicks, and dollar value from AI visibility. Connect mentions to business outcomes.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    title: 'Competitor Intelligence',
    description: 'Track competitor share of voice. See who AI recommends instead of you and why.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    title: 'Topic Tracking',
    description: 'AI-powered 8-step wizard generates relevant topics and prompts for your industry automatically.',
  },
]

// Trusted by
const trustedBy = ['TechCrunch', 'Forbes', 'Wired', 'VentureBeat', 'The Verge', 'Ars Technica', 'CNET', 'Engadget']

// Animation variants for orchestrated entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export default function LandingPage() {
  const { user, loading } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const scrolled = useScrolled(10)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">
      <NoiseOverlay />
      
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[600px] bg-amber-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[400px] bg-orange-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation - transparent initially, glass on scroll */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Background - only visible on scroll */}
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-300",
            scrolled 
              ? "bg-[#09090b]/80 backdrop-blur-xl" 
              : "bg-transparent"
          )} 
        />
        {/* Bottom border - only visible on scroll */}
        <div 
          className={cn(
            "absolute inset-x-0 bottom-0 h-px transition-opacity duration-300",
            scrolled 
              ? "opacity-100 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" 
              : "opacity-0"
          )} 
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo />
            <div>
              <span className="font-medium text-[15px] tracking-tight text-white/90 group-hover:text-white transition-colors block leading-none">
                BigRank AI
              </span>
              <span className="text-[9px] text-white/30">by BigBoost</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#why" className="text-[14px] text-white/40 hover:text-white/90 transition-colors">Why</a>
            <a href="#features" className="text-[14px] text-white/40 hover:text-white/90 transition-colors">Features</a>
            <a href="#how-it-works" className="text-[14px] text-white/40 hover:text-white/90 transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-24 h-10 bg-white/5 rounded-lg animate-pulse" />
            ) : user ? (
              <Link 
                to="/dashboard" 
                className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-[14px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 transition-all duration-300"
              >
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-lg" />
                <span className="relative">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-[14px] text-white/50 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-[14px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 transition-all duration-300"
                >
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-lg" />
                  <span className="relative">Get Started Free</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Two column with 3D visual */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left column - Text */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/50">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  AI Visibility Intelligence
                </span>
              </motion.div>

              {/* Headline - Editorial serif */}
              <motion.h1 
                variants={itemVariants}
                className="text-[clamp(2.5rem,5vw,4rem)] font-serif leading-[1.08] tracking-[-0.02em] mb-8"
              >
                Know why AI
                <br />
                recommends{' '}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                  your competitors
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                variants={itemVariants}
                className="text-lg text-white/40 max-w-lg mb-10 leading-relaxed"
              >
                Track what ChatGPT, Claude, Gemini and Perplexity say about your brand. 
                Discover the sources they cite. Get actionable recommendations.
              </motion.p>

              {/* CTA */}
              <motion.div variants={itemVariants} className="mb-10">
                <Link 
                  to={user ? "/dashboard" : "/signup"} 
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-[15px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 transition-all duration-300"
                >
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl" />
                  <span className="relative">{user ? 'Open Dashboard' : 'Get started'}</span>
                </Link>
              </motion.div>

              {/* Platform pills - 2 rows of 4 */}
              <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 max-w-lg">
                {platforms.map((platform, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] text-[12px] text-white/40 hover:text-white/60 hover:border-white/[0.1] transition-all cursor-default"
                  >
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="truncate">{platform.name}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right column - 3D Visual */}
            <div className="hidden lg:block">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-6xl">
            <div className="relative rounded-2xl bg-white/[0.02] p-10 lg:p-14 overflow-hidden">
              {/* Dashed border */}
              <div className="absolute inset-0 rounded-2xl border border-dashed border-white/[0.1]" />
              {/* Top glow */}
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              {/* Border beam */}
              <BorderBeam size={250} duration={12} colorFrom="#f59e0b" colorTo="#ea580c" />
              
              <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="text-left"
                  >
                    <div className="text-4xl lg:text-5xl font-serif tracking-tight mb-3">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        <NumberTicker value={stat.value} delay={0.2 + i * 0.1} />
                      </span>
                      <span className="text-amber-400">{stat.suffix}</span>
                    </div>
                    <div className="text-[13px] lg:text-[14px] text-white/40 leading-snug">
                      <span className="block">{stat.line1}</span>
                      <span className="block">{stat.line2}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By - Marquee */}
      <section className="py-12 border-y border-white/[0.03]">
        <div className="text-center mb-8">
          <p className="text-[13px] text-white/20 uppercase tracking-widest">Trusted by teams at</p>
        </div>
        <Marquee pauseOnHover className="[--duration:50s]">
          {trustedBy.map((company, i) => (
            <span 
              key={i}
              className="mx-10 text-white/15 text-lg font-medium hover:text-white/30 transition-colors cursor-default"
            >
              {company}
            </span>
          ))}
        </Marquee>
      </section>

      {/* The Problem - Editorial Style */}
      <section id="why" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left - Editorial text with reveal */}
            <TextReveal delay={0.1}>
              <div>
                <h2 className="text-3xl lg:text-4xl font-serif tracking-tight mb-8">
                  The New SEO{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Battlefield
                  </span>
                </h2>
                
                <div className="space-y-6 text-[16px] lg:text-[17px] leading-[1.75]">
                  <p className="text-white/50">
                    Search is changing. Your customers are skipping Google and going straight to 
                    ChatGPT, Claude, and Perplexity. They're asking for recommendations, comparisons, 
                    and honest opinions about brands like yours.
                  </p>
                  
                  <p className="text-white/50">
                    Here's the thing: you have no clue what these AI tools are telling them. 
                    Are they recommending you? Ignoring you completely? Suggesting your competitors instead? 
                    Traditional analytics won't tell you. Google Search Console is useless here.
                  </p>
                  
                  <p className="text-white/70">
                    That's why we built BigRank. We ask the AI platforms what they think of you, 
                    track their responses over time, and give you a clear playbook to improve.
                  </p>
                </div>
              </div>
            </TextReveal>

            {/* Right - Example queries */}
            <div className="space-y-4">
              {[
                'What\'s the best CRM for small business?',
                'Compare Salesforce vs HubSpot',
                'Is [your product] any good?',
              ].map((query, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-white/60 italic">"{query}"</span>
                </motion.div>
              ))}
              <p className="text-[13px] text-white/30 pt-2 pl-1">
                Questions your customers are asking AI right now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header - centered */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif tracking-tight mb-5">
              More Than Just{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Tracking
              </span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed">
              Understand WHY AI recommends (or ignores) you. Get actionable insights to improve.
            </p>
          </div>

          {/* Feature grid - 3x2 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="group h-full p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-orange-500/5 transition-all duration-500">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 bg-white/[0.04] text-white/50 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white/90">{feature.title}</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif tracking-tight mb-5">
              How It{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed">
              Three steps to AI visibility dominance
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              { 
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                ),
                step: '01', 
                title: 'Setup Your Brand', 
                desc: 'Enter your website. Our AI wizard automatically generates relevant topics, prompts, and identifies competitors.' 
              },
              { 
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                ),
                step: '02', 
                title: 'Run Tracking', 
                desc: 'We query multiple AI engines with your configured prompts. See exactly what they say about you.' 
              },
              { 
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                step: '03', 
                title: 'Get Insights', 
                desc: 'View source attribution, content scores, and recommendations. Know exactly what to improve.' 
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                {/* Icon container */}
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
                  {item.icon}
                </div>
                <div className="text-[12px] text-amber-400/60 font-mono mb-2">Step {item.step}</div>
                <h3 className="text-xl font-medium mb-3 text-white/90">{item.title}</h3>
                <p className="text-[15px] text-white/40 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl bg-white/[0.02] p-12 lg:p-16 text-center overflow-hidden">
              {/* Dashed border */}
              <div className="absolute inset-0 rounded-2xl border border-dashed border-white/[0.1]" />
              {/* Top glow */}
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              {/* Border beam */}
              <BorderBeam size={250} duration={12} colorFrom="#f59e0b" colorTo="#ea580c" />
              
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-serif tracking-tight mb-5">
                  Ready to see what AI says about you?
                </h2>
                <p className="text-white/40 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                  Stop guessing. Start tracking. Become the brand AI recommends.
                </p>
                <Link 
                  to={user ? "/dashboard" : "/signup"} 
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-[15px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 transition-all duration-300"
                >
                  <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl" />
                  <span className="relative">{user ? 'Open Dashboard' : 'Get started'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            <div>
              <span className="text-[14px] font-medium text-white/60 block leading-none">BigRank AI</span>
              <span className="text-[9px] text-white/30">by BigBoost</span>
            </div>
          </div>
          <div className="text-[13px] text-white/25">
            © 2025 BigRank AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
