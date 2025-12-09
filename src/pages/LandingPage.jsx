import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AI_PLATFORMS } from '../lib/constants'
import { useAuthStore } from '../hooks/useStore'

function LogoIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.2"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#logoGradient)" strokeWidth="2.5" opacity="0.35"/>
      <g filter="url(#logoGlow)">
        <text x="50" y="67" textAnchor="middle" fontSize="54" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" fill="url(#logoGradient)">B</text>
      </g>
    </svg>
  )
}

export { LogoIcon }

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const { user, loading } = useAuthStore()

  const features = [
    { icon: '🔍', title: 'Source Attribution', desc: 'Discover WHERE AI learns about your brand - review sites, publications, forums. Know exactly what content to create.' },
    { icon: '📊', title: 'Content Scoring', desc: 'Score any content 0-100 for AI discoverability. Get specific recommendations to improve before publishing.' },
    { icon: '💡', title: 'Optimization Recommendations', desc: 'Actionable insights based on your results. Know exactly what to fix to get mentioned more.' },
    { icon: '💰', title: 'ROI Analytics', desc: 'Estimate monthly reach, clicks, and dollar value from AI visibility. Connect mentions to business outcomes.' },
    { icon: '⚔️', title: 'Competitor Intelligence', desc: 'Track competitor share of voice. See who AI recommends instead of you and why.' },
    { icon: '🎯', title: 'Topic Tracking', desc: 'AI-powered 8-step wizard generates relevant topics and prompts for your industry automatically.' }
  ]

  const problems = [
    { question: "What's the best CRM for small business?", bad: "You're not mentioned. Competitors get all the traffic.", good: "You're recommended as the top choice." },
    { question: "Compare Salesforce vs HubSpot vs [Your Brand]", bad: "AI doesn't know enough about you to compare.", good: "AI highlights your unique advantages." },
    { question: "Is [Your Brand] worth it?", bad: "AI gives vague or outdated information.", good: "AI confidently recommends you with specifics." }
  ]

  const stats = [
    { value: '40%', label: 'of searches will use AI by 2026' },
    { value: '67%', label: 'of users trust AI recommendations' },
    { value: '3x', label: 'higher conversion from AI referrals' },
    { value: '50%', label: 'of AI citations differ from Google' }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-5 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <LogoIcon size={40} />
          <span className="text-xl font-extrabold tracking-tight">BrandAura<span className="text-primary-400 ml-1">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <a href="#problem" className="text-white/70 hover:text-white text-sm font-medium transition">The Problem</a>
          <a href="#features" className="text-white/70 hover:text-white text-sm font-medium transition">Features</a>
          <a href="#how-it-works" className="text-white/70 hover:text-white text-sm font-medium transition">How It Works</a>
          {loading ? <div className="w-20 h-10 bg-white/10 rounded-xl animate-pulse" /> : user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
              <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="" className="w-9 h-9 rounded-xl border-2 border-primary-500/50" />
            </div>
          ) : (
            <>
              <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
            </>
          )}
        </div>
        <div className="md:hidden">
          {user ? <Link to="/dashboard" className="btn btn-primary text-sm px-4 py-2">Dashboard</Link> : <Link to="/signup" className="btn btn-primary text-sm px-4 py-2">Get Started</Link>}
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 relative text-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-sm text-white/70">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          The only AI visibility platform with source attribution
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] max-w-5xl mb-6 tracking-tight">
          Know Why AI<br /><span className="gradient-text">Recommends Your Competitors</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
          Track what ChatGPT, Claude, Gemini & Perplexity say about your brand. Discover the sources they cite. Get actionable recommendations to become the brand AI recommends.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to={user ? "/dashboard" : "/signup"} className="btn btn-primary text-lg px-10 py-5 shadow-lg shadow-primary-500/30">{user ? 'Open Dashboard →' : 'Start Free →'}</Link>
          <a href="#how-it-works" className="btn btn-secondary text-lg px-10 py-5">See How It Works</a>
        </div>
        <div className="flex gap-4">
          {Object.values(AI_PLATFORMS).slice(0, 6).map((p, i) => (
            <div key={i} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border animate-float" style={{ backgroundColor: `${p.color}15`, borderColor: `${p.color}30`, color: p.color, animationDelay: `${i * 0.2}s` }}>{p.icon}</div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary-400 mb-2 font-mono">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">The New SEO Battlefield</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">People don't just Google anymore. They ask AI. If AI doesn't recommend you, you're invisible to a growing audience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p, i) => (
              <div key={i} className="rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <div className="text-sm text-white/40 mb-2">User asks AI:</div>
                  <div className="text-lg font-semibold">"{p.question}"</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 text-xl">✗</span>
                    <div><div className="text-sm text-red-400/80 font-medium mb-1">Without BrandAura:</div><div className="text-sm text-white/50">{p.bad}</div></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 text-xl">✓</span>
                    <div><div className="text-sm text-emerald-400/80 font-medium mb-1">With BrandAura:</div><div className="text-sm text-white/50">{p.good}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">More Than Just Tracking</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Understand WHY AI recommends (or ignores) you. Get actionable insights to improve.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className={`p-9 rounded-3xl cursor-pointer transition-all duration-300 border ${activeFeature === i ? 'bg-gradient-to-br from-primary-500/15 to-purple-500/10 border-primary-500/30' : 'bg-black/50 border-white/5 hover:border-white/10'}`} onMouseEnter={() => setActiveFeature(i)}>
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">How It Works</h2>
            <p className="text-white/50 text-lg">Three steps to AI visibility dominance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Setup Your Brand', desc: 'Enter your website. Our AI wizard automatically generates relevant topics, prompts, and identifies competitors.', icon: '🚀' },
              { step: '02', title: 'Run Tracking', desc: 'We query multiple AI engines with your configured prompts. See exactly what they say about you.', icon: '🔄' },
              { step: '03', title: 'Get Insights', desc: 'View source attribution, content scores, and recommendations. Know exactly what to improve.', icon: '📈' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/10 border border-primary-500/30 flex items-center justify-center text-4xl mx-auto mb-6">{item.icon}</div>
                <div className="text-primary-400 font-mono text-sm mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🤖', title: '6 AI Engines', desc: 'ChatGPT, Claude, Gemini, Perplexity, and more' },
            { icon: '📈', title: 'Trend Analysis', desc: 'Track visibility changes over time' },
            { icon: '🏢', title: 'Multi-Brand', desc: 'Manage multiple brands from one dashboard' },
            { icon: '📑', title: 'Full Responses', desc: 'See exactly what AI says about you' }
          ].map((cap, i) => (
            <div key={i} className="p-6 rounded-2xl bg-black/50 border border-white/5 text-center">
              <div className="text-4xl mb-4">{cap.icon}</div>
              <h3 className="font-bold mb-2">{cap.title}</h3>
              <p className="text-sm text-white/50">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto p-16 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-purple-500/10 border border-primary-500/30 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">Ready to See What AI Says About You?</h2>
          <p className="text-white/60 text-lg mb-10">Stop guessing. Start tracking. Discover exactly how to become the brand AI recommends.</p>
          <Link to={user ? "/dashboard" : "/signup"} className="btn btn-primary text-lg px-12 py-5 shadow-lg shadow-primary-500/40">{user ? 'Open Dashboard →' : 'Start Free →'}</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoIcon size={36} />
            <span className="font-bold">BrandAura<span className="text-primary-400 ml-1">AI</span></span>
          </div>
          <div className="text-white/40 text-sm">© 2025 BrandAura AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
