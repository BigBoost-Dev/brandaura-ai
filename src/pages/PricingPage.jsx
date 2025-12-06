import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRICING_PLANS } from '../lib/constants'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const getPrice = (plan) => {
    if (typeof plan.price !== 'number') return plan.price
    if (billingCycle === 'yearly') {
      return Math.floor(plan.price * 0.8) // 20% discount
    }
    return plan.price
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-5 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-xl">◈</div>
          <span className="text-xl font-extrabold tracking-tight">AI Visibility</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto mb-10">
          Start free, upgrade as you grow. No hidden fees, cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1.5 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition ${
              billingCycle === 'monthly'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Yearly
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative p-8 rounded-3xl ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/10 border-2 border-primary-500/50'
                  : 'bg-white/[0.02] border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full gradient-primary text-xs font-bold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white/70 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black font-mono">
                    {typeof getPrice(plan) === 'number' ? `$${getPrice(plan)}` : getPrice(plan)}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-white/40">/{billingCycle === 'yearly' ? 'mo' : 'mo'}</span>
                  )}
                </div>
                {billingCycle === 'yearly' && typeof plan.price === 'number' && (
                  <p className="text-white/40 text-sm mt-2">
                    Billed ${getPrice(plan) * 12}/year
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Tests:</span>
                  <span className="font-semibold">{plan.tests}/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Brands:</span>
                  <span className="font-semibold">{plan.brands}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Platforms:</span>
                  <span className="font-semibold">{plan.platforms}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {key === 'enterprise' ? 'Contact Sales' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'What counts as a "test"?',
                a: 'A test is one query to one AI platform. For example, asking ChatGPT "What are the best CRM tools?" counts as 1 test. The same query to Claude and Gemini would be 3 tests total.'
              },
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, you\'ll receive credit toward future billing.'
              },
              {
                q: 'What AI platforms do you track?',
                a: 'We track ChatGPT (GPT-4o), Claude (Anthropic), Gemini (Google), Perplexity, and Llama 3.1. We\'re always adding more platforms based on user demand.'
              },
              {
                q: 'How accurate is the visibility scoring?',
                a: 'Our NLP analysis achieves ~85-90% accuracy in detecting brand mentions and classifying sentiment. We use multiple patterns and context analysis to determine if your brand is mentioned as a leader, recommended, or just mentioned.'
              },
              {
                q: 'Do you store the AI responses?',
                a: 'Yes, we store response snippets (not full responses) to show you context around brand mentions. Full responses are available for 30 days on paid plans. You can export your data at any time.'
              },
              {
                q: 'Is there an API?',
                a: 'API access is available on Pro and Enterprise plans. You can programmatically run tests, fetch results, and integrate visibility data into your own dashboards.'
              }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="text-lg font-semibold mb-3">{faq.q}</h3>
                <p className="text-white/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center p-16 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-purple-500/10 border border-primary-500/30">
          <h2 className="text-4xl font-extrabold mb-5">Ready to get started?</h2>
          <p className="text-white/60 text-lg mb-10">
            Start with our free plan. No credit card required.
          </p>
          <Link to="/signup" className="btn btn-primary text-lg px-12 py-5">
            Start Free Trial →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">◈</div>
            <span className="font-bold">AI Visibility Tracker</span>
          </div>
          <div className="text-white/40 text-sm">© 2025 AI Visibility. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
