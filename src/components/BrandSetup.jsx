import React, { useState } from 'react'
import { AI_PLATFORMS, INDUSTRY_BENCHMARKS } from '../lib/constants'
import { useBrandsStore } from '../hooks/useStore'

const Icons = {
  target: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  users: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  bot: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M7 15h.01M17 15h.01"/></svg>,
  check: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

export default function BrandSetup({ userId, onComplete, onCancel }) {
  const { addBrand } = useBrandsStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [category, setCategory] = useState('')
  const [industry, setIndustry] = useState('SaaS')
  const [useCase, setUseCase] = useState('')
  const [competitors, setCompetitors] = useState([{ name: '' }, { name: '' }, { name: '' }])
  const [selectedPlatforms, setSelectedPlatforms] = useState(['gpt-4o', 'claude-sonnet', 'gemini-flash', 'perplexity'])

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      await addBrand({
        user_id: userId,
        name,
        domain,
        category,
        industry,
        use_case: useCase || 'business',
        competitors: competitors.filter(c => c.name.trim()),
        selected_platforms: selectedPlatforms
      })
      onComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePlatform = (pid) => {
    setSelectedPlatforms(prev =>
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-5">
      <div className="w-full max-w-lg p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div 
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Brand Info */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                {Icons.target}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Add Your Brand</h2>
              <p className="text-[14px] text-white/40">Tell us about the brand you want to track</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] text-white/60 mb-2">Brand Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g., Notion"
                />
              </div>
              <div>
                <label className="block text-[13px] text-white/60 mb-2">Website Domain</label>
                <input 
                  type="text" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g., notion.so"
                />
              </div>
              <div>
                <label className="block text-[13px] text-white/60 mb-2">Industry</label>
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] focus:outline-none focus:border-amber-500/50"
                >
                  {Object.keys(INDUSTRY_BENCHMARKS).map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-white/60 mb-2">Category</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g., Project Management"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              {onCancel && (
                <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[14px] font-medium hover:bg-white/[0.08] transition">
                  Cancel
                </button>
              )}
              <button 
                onClick={() => setStep(2)} 
                disabled={!name.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[14px] font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* Step 2: Competitors */}
        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 text-sky-400">
                {Icons.users}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Add Competitors</h2>
              <p className="text-[14px] text-white/40">Who are you competing with for AI visibility?</p>
            </div>

            <div className="space-y-3">
              {competitors.map((comp, i) => (
                <input 
                  key={i}
                  type="text" 
                  value={comp.name} 
                  onChange={(e) => {
                    const updated = [...competitors]
                    updated[i].name = e.target.value
                    setCompetitors(updated)
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                  placeholder={`Competitor ${i + 1}`}
                />
              ))}
              <button 
                onClick={() => setCompetitors([...competitors, { name: '' }])}
                className="w-full py-2 text-[13px] text-white/40 hover:text-white/60 transition"
              >
                + Add another
              </button>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[14px] font-medium hover:bg-white/[0.08] transition">
                Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[14px] font-semibold hover:brightness-110 transition">
                Continue
              </button>
            </div>
          </>
        )}

        {/* Step 3: Platforms */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                {Icons.bot}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Select AI Platforms</h2>
              <p className="text-[14px] text-white/40">Which AI platforms should we monitor?</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AI_PLATFORMS).map(([key, platform]) => (
                <button
                  key={key}
                  onClick={() => togglePlatform(key)}
                  className={`p-3 rounded-xl text-left transition-colors ${
                    selectedPlatforms.includes(key)
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-white">{platform.name}</span>
                    {selectedPlatforms.includes(key) && (
                      <span className="text-amber-400">{Icons.check}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[14px] font-medium hover:bg-white/[0.08] transition">
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={loading || selectedPlatforms.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[14px] font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Complete Setup'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
