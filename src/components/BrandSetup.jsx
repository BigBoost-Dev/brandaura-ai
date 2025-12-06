import React, { useState } from 'react'
import { AI_PLATFORMS, INDUSTRY_BENCHMARKS } from '../lib/constants'
import { useBrandsStore } from '../hooks/useStore'

export default function BrandSetup({ userId, onComplete, onCancel }) {
  const { addBrand } = useBrandsStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
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
    <div className="min-h-screen bg-dark-400 flex items-center justify-center p-5">
      <div className="w-full max-w-lg p-12 rounded-[2rem] bg-gradient-to-br from-dark-50 to-dark-100 border border-white/[0.08]">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div 
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? 'gradient-primary' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {/* Step 1: Brand Info */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-extrabold mb-2">Add Your Brand</h2>
              <p className="text-white/50">Tell us about the brand you want to track</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Brand Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g., Notion"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Website</label>
                <input 
                  type="text" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)}
                  className="input"
                  placeholder="e.g., notion.so"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Product Category *</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                  placeholder="e.g., project management"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Industry</label>
                <select 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)}
                  className="input"
                >
                  {Object.keys(INDUSTRY_BENCHMARKS).map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Target Use Case</label>
                <input 
                  type="text" 
                  value={useCase} 
                  onChange={(e) => setUseCase(e.target.value)}
                  className="input"
                  placeholder="e.g., startups, enterprise"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              {onCancel && (
                <button onClick={onCancel} className="btn btn-secondary flex-1">
                  Cancel
                </button>
              )}
              <button 
                onClick={() => setStep(2)}
                disabled={!name.trim() || !category.trim()}
                className="btn btn-primary flex-[2]"
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Competitors */}
        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⚔️</div>
              <h2 className="text-2xl font-extrabold mb-2">Competitors</h2>
              <p className="text-white/50">Who are you competing against?</p>
            </div>

            <div className="space-y-3 mb-6">
              {competitors.map((comp, i) => (
                <div key={i} className="flex gap-3">
                  <input 
                    type="text"
                    value={comp.name}
                    onChange={(e) => {
                      const updated = [...competitors]
                      updated[i].name = e.target.value
                      setCompetitors(updated)
                    }}
                    className="input flex-1"
                    placeholder={`Competitor ${i + 1}`}
                  />
                  {competitors.length > 1 && (
                    <button 
                      onClick={() => setCompetitors(competitors.filter((_, idx) => idx !== i))}
                      className="px-4 rounded-xl border border-white/10 text-red-400 hover:bg-red-500/10"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => setCompetitors([...competitors, { name: '' }])}
              className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 text-sm hover:border-white/30 mb-8"
            >
              + Add Another
            </button>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary flex-[2]">
                Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Platforms */}
        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="text-2xl font-extrabold mb-2">AI Platforms</h2>
              <p className="text-white/50">Select platforms to track</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {Object.entries(AI_PLATFORMS).map(([id, platform]) => (
                <button
                  key={id}
                  onClick={() => togglePlatform(id)}
                  className={`p-4 rounded-xl text-left border-2 transition ${
                    selectedPlatforms.includes(id)
                      ? 'border-opacity-100'
                      : 'border-white/10 border-opacity-100'
                  }`}
                  style={{
                    borderColor: selectedPlatforms.includes(id) ? platform.color : undefined,
                    backgroundColor: selectedPlatforms.includes(id) ? `${platform.color}15` : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: platform.color }} className="text-xl">{platform.icon}</span>
                    <span className="font-semibold text-sm">{platform.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">
                ← Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={selectedPlatforms.length === 0 || loading}
                className="btn flex-[2] bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? <div className="spinner mx-auto" /> : 'Create Brand →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
