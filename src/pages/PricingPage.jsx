import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PRICING_PLANS } from '../lib/constants'

// Logo component
function Logo({ size = 32 }) {
  return (
    <div 
      className="rounded-[10px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25"
      style={{ width: size, height: size }}
    >
      <span style={{ fontFamily: 'Sora, sans-serif', fontSize: size * 0.58 }} className="text-black font-extrabold">B</span>
    </div>
  )
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const getPrice = (plan) => {
    if (typeof plan.price !== 'number') return plan.price
    if (billingCycle === 'yearly') {
      return Math.floor(plan.price * 0.8)
    }
    return plan.price
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3.5">
            <Logo size={38} />
            <div className="flex flex-col gap-1">
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-[17px] font-bold tracking-tight text-white block leading-none">BigRank AI</span>
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-[9px] text-white/30 font-medium">by BigBoost</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[14px] text-white/50 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link 
              to="/signup" 
              className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-[14px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 transition-all duration-300"
            >
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl" />
              <span className="relative">Get started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-serif tracking-tight mb-5">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          <p className="text-lg text-white/40 max-w-lg mx-auto mb-10">
            Start free, upgrade as you grow. No hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Yearly
              <span className="text-[11px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(PRICING_PLANS).map(([key, plan], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl ${
                plan.popular
                  ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-2 border-amber-500/30'
                  : 'bg-white/[0.02] border border-white/[0.06]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[11px] font-semibold text-black">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[15px] font-medium text-white/50 mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    {typeof getPrice(plan) === 'number' ? `$${getPrice(plan)}` : getPrice(plan)}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-white/30 text-[14px]">/mo</span>
                  )}
                </div>
                {billingCycle === 'yearly' && typeof plan.price === 'number' && (
                  <p className="text-white/30 text-[13px] mt-1">
                    Billed ${getPrice(plan) * 12}/year
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-white/[0.06]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/40">Tests</span>
                  <span className="text-white/70 font-medium">{plan.tests}/mo</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/40">Brands</span>
                  <span className="text-white/70 font-medium">{plan.brands}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/40">Platforms</span>
                  <span className="text-white/70 font-medium">{plan.platforms}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-white/50">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`block w-full text-center py-3 rounded-xl text-[14px] font-medium transition-all ${
                  plan.popular
                    ? 'relative overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-black'
                    : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                }`}
              >
                {plan.popular && <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl" />}
                <span className="relative">{key === 'enterprise' ? 'Contact Sales' : 'Get Started'}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'What counts as a "test"?',
                a: 'A test is one query to one AI platform. For example, asking ChatGPT "What are the best CRM tools?" counts as 1 test. The same query to Claude and Gemini would be 3 tests total.'
              },
              {
                q: 'Can I change plans anytime?',
                a: 'Yes. Upgrade or downgrade whenever you want. When upgrading, you pay the prorated difference. When downgrading, you get credit toward future billing.'
              },
              {
                q: 'What AI platforms do you track?',
                a: 'We track ChatGPT, Claude, Gemini, Perplexity, and Llama. We add more platforms based on user demand.'
              },
              {
                q: 'Do you store the AI responses?',
                a: 'We store response snippets to show you context around brand mentions. Full responses are available for 30 days on paid plans. You can export your data at any time.'
              },
              {
                q: 'Is there an API?',
                a: 'API access is available on Pro and Enterprise plans. Run tests programmatically and integrate visibility data into your own dashboards.'
              }
            ].map((faq, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <h3 className="text-[15px] font-medium text-white/80 mb-2">{faq.q}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.1] p-12 text-center overflow-hidden">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            <h2 className="text-2xl lg:text-3xl font-serif tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-white/40 text-[16px] mb-8">
              Start with our free plan. No credit card required.
            </p>
            <Link 
              to="/signup" 
              className="relative inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-[15px] text-black overflow-hidden bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 transition-all duration-300"
            >
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl" />
              <span className="relative">Start free trial</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.03]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div className="flex flex-col gap-0.5">
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-semibold text-[14px] text-white/70 block leading-none">BigRank AI</span>
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-[9px] text-white/30 font-medium">by BigBoost</span>
            </div>
          </div>
          <div className="text-white/30 text-[13px]">© 2025 BigRank AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
