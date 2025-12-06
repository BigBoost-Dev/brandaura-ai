import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AI_PLATFORMS, PRICING_PLANS } from '../lib/constants'

// Logo Icon Component
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
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
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

  const features = [
    { icon: '🤖', title: '6 AI Platforms', desc: 'Track visibility across ChatGPT, Claude, Gemini, Perplexity, Llama, and more' },
    { icon: '📊', title: 'Real-time Analytics', desc: 'Monitor visibility scores, share of voice, and competitive positioning' },
    { icon: '🔔', title: 'Smart Alerts', desc: 'Get notified instantly when your visibility drops below threshold' },
    { icon: '⏰', title: 'Scheduled Tests', desc: 'Automate daily, weekly, or monthly visibility checks' },
    { icon: '📈', title: 'Industry Benchmarks', desc: 'Compare your performance against industry averages' },
    { icon: '🏢', title: 'Multi-Brand', desc: 'Track multiple brands and products from one dashboard' }
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'Head of Marketing, TechCorp', text: 'Finally, a tool that shows us exactly how AI sees our brand. Invaluable for our SEO strategy.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    { name: 'Marcus Johnson', role: 'CEO, StartupXYZ', text: 'We increased our AI visibility by 340% in 3 months using the insights from this tool.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus' },
    { name: 'Emily Rodriguez', role: 'Growth Lead, ScaleUp', text: 'The competitive analysis alone is worth 10x the price. Game changer for our positioning.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' }
  ]

  const stats = [
    { value: '527%', label: 'AI traffic growth in 2025' },
    { value: '67%', label: 'Organizations using LLMs' },
    { value: '50%', label: 'AI citations differ from Google' },
    { value: '10x', label: 'ROI for early adopters' }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-5 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <LogoIcon size={40} />
          <span className="text-xl font-extrabold tracking-tight">
            BrandAura<span className="text-primary-400 ml-1">AI</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-white/70 hover:text-white text-sm font-medium transition">Features</a>
          <a href="#pricing" className="text-white/70 hover:text-white text-sm font-medium transition">Pricing</a>
          <a href="#testimonials" className="text-white/70 hover:text-white text-sm font-medium transition">Testimonials</a>
          <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 relative text-center">
        {/* Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-sm text-white/70">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now tracking 6 major AI platforms
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] max-w-4xl mb-6 tracking-tight">
          Track Your Brand's
          <br />
          <span className="gradient-text">AI Visibility</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/60 max-w-xl mb-12 leading-relaxed">
          Monitor how ChatGPT, Claude, Gemini, and Perplexity see your brand. 
          Get alerts when visibility drops. Beat competitors in AI search.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/signup" className="btn btn-primary text-lg px-10 py-5 shadow-lg shadow-primary-500/30">
            Start Free Trial →
          </Link>
          <button className="btn btn-secondary text-lg px-10 py-5">
            Watch Demo
          </button>
        </div>

        {/* Platform Icons */}
        <div className="flex gap-4">
          {Object.values(AI_PLATFORMS).slice(0, 6).map((p, i) => (
            <div 
              key={i}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border animate-float"
              style={{ 
                backgroundColor: `${p.color}15`, 
                borderColor: `${p.color}30`,
                color: p.color,
                animationDelay: `${i * 0.2}s`
              }}
            >
              {p.icon}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
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

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              Everything You Need to Dominate AI Search
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              The most comprehensive AI visibility tracking platform for brands serious about their AI presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className={`p-9 rounded-3xl cursor-pointer transition-all duration-300 ${
                  activeFeature === i 
                    ? 'bg-gradient-to-br from-primary-500/15 to-purple-500/10 border-primary-500/30' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                } border`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-white/50 text-lg">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(PRICING_PLANS).map(([key, plan]) => (
              <div 
                key={key}
                className={`p-8 rounded-3xl relative ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/10 border-2 border-primary-500/50' 
                    : 'bg-white/[0.02] border border-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full gradient-primary text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-lg font-semibold mb-2 text-white/70">{plan.name}</div>
                <div className="text-5xl font-black mb-6 font-mono">
                  {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  {typeof plan.price === 'number' && <span className="text-base text-white/40">/mo</span>}
                </div>
                <div className="mb-6 text-sm text-white/50 space-y-1">
                  <div>{plan.tests} tests/month</div>
                  <div>{plan.brands} brand{plan.brands !== 1 && 's'}</div>
                  <div>{plan.platforms} platforms</div>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-white/60 flex items-start gap-3">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/signup"
                  className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Loved by Marketing Teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <p className="text-white/70 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto p-16 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-purple-500/10 border border-primary-500/30 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
            Ready to Dominate AI Search?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Join 500+ brands already tracking their AI visibility. Start free, no credit card required.
          </p>
          <Link to="/signup" className="btn btn-primary text-lg px-12 py-5 shadow-lg shadow-primary-500/40">
            Start Your Free Trial →
          </Link>
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
