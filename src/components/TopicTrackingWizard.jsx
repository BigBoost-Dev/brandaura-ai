import React, { useState, useEffect, useMemo } from 'react'
import { 
  AI_SEARCH_ENGINES, 
  LOCATIONS_LANGUAGES, 
  SEARCH_INTENTS, 
  DEFAULT_PERSONAS,
} from '../lib/constants'
import { useBrandsStore } from '../hooks/useStore'
import { queryAI } from '../lib/api'
import { 
  validateURL, 
  validateBrandName, 
  sanitizeUserInput 
} from '../lib/validation'

// Icons
const Icons = {
  x: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  plus: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  chevronDown: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  chevronLeft: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  globe: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  users: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  bot: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  target: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  folder: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  file: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  sparkles: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z"/><path d="M19 10l.5 1.5L21 12l-1.5.5L19 14l-.5-1.5L17 12l1.5-.5L19 10z"/></svg>,
  loader: <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 019.17 6" strokeLinecap="round"/></svg>,
}

const STEPS = [
  { id: 1, key: 'website', label: 'Website', icon: Icons.globe },
  { id: 2, key: 'competitors', label: 'Competitors', icon: Icons.users },
  { id: 3, key: 'engines', label: 'AI Engines', icon: Icons.bot },
  { id: 4, key: 'topics', label: 'Topics', icon: Icons.folder },
  { id: 5, key: 'prompts', label: 'Prompts', icon: Icons.file },
  { id: 6, key: 'review', label: 'Review', icon: Icons.target },
]

const INDUSTRIES = [
  'Digital Marketing', 'SaaS', 'E-commerce', 'Healthcare', 'Finance',
  'Education', 'Real Estate', 'Legal', 'Technology', 'Consulting', 'Other'
]

export default function TopicTrackingWizard({ userId, onComplete, onCancel, existingBrands = [] }) {
  const { addBrand, updateBrand, setActiveBrand } = useBrandsStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Website
  const [website, setWebsite] = useState('')
  const [brandNames, setBrandNames] = useState([])
  const [brandInput, setBrandInput] = useState('')
  const [industry, setIndustry] = useState('Digital Marketing')
  const [selectedWebsite, setSelectedWebsite] = useState(null)

  // Step 2: Competitors
  const [competitors, setCompetitors] = useState([])
  const [competitorInput, setCompetitorInput] = useState('')
  const [generatingCompetitors, setGeneratingCompetitors] = useState(false)

  // Step 3: Engines
  const [selectedEngines, setSelectedEngines] = useState(['chatgpt-auto', 'perplexity', 'gemini'])

  // Step 4: Topics
  const [topics, setTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [generatingTopics, setGeneratingTopics] = useState(false)
  const [customTopicInput, setCustomTopicInput] = useState('')

  // Step 5: Prompts
  const [selectedLocation, setSelectedLocation] = useState({ code: 'IN', name: 'India', language: 'English' })
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [generatedPrompts, setGeneratedPrompts] = useState([])
  const [generatingPrompts, setGeneratingPrompts] = useState(false)
  const [promptsPerTopic, setPromptsPerTopic] = useState(10)

  // Auto-generate on step change
  useEffect(() => {
    if (currentStep === 2 && competitors.length === 0 && !generatingCompetitors) {
      generateCompetitors()
    }
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 4 && topics.length === 0 && !generatingTopics) {
      generateTopics()
    }
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 5 && generatedPrompts.length === 0 && !generatingPrompts && selectedTopics.length > 0) {
      generatePrompts()
    }
  }, [currentStep])

  // Generate competitors
  const generateCompetitors = async () => {
    setGeneratingCompetitors(true)
    setError('')
    
    try {
      const result = await queryAI('openai/gpt-4o-mini', `Identify 5 direct competitors for: ${website} (${brandNames.join(', ')}) in ${industry}. Return JSON array: [{"name": "Company", "domain": "domain.com"}]`)
      if (result.success) {
        const jsonMatch = result.response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setCompetitors(parsed.slice(0, 5))
        }
      }
    } catch (err) {
      console.error('Error generating competitors:', err)
    }
    
    if (competitors.length === 0) {
      setCompetitors([
        { name: 'Competitor 1', domain: 'competitor1.com' },
        { name: 'Competitor 2', domain: 'competitor2.com' },
        { name: 'Competitor 3', domain: 'competitor3.com' },
      ])
    }
    setGeneratingCompetitors(false)
  }

  // Generate topics
  const generateTopics = async () => {
    setGeneratingTopics(true)
    try {
      const result = await queryAI('openai/gpt-4o-mini', `Generate 8 topic categories for tracking AI visibility of ${website} in ${industry}. Return JSON: [{"id": "topic-1", "name": "Topic Name", "description": "Brief description"}]`)
      if (result.success) {
        const jsonMatch = result.response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setTopics(parsed)
          setSelectedTopics(parsed.slice(0, 4).map(t => t.id))
        }
      }
    } catch (err) {
      console.error('Error generating topics:', err)
    }
    
    if (topics.length === 0) {
      const defaultTopics = [
        { id: 't1', name: 'Product Features', description: 'Questions about specific product capabilities' },
        { id: 't2', name: 'Pricing & Plans', description: 'Cost comparisons and plan options' },
        { id: 't3', name: 'Best Solutions', description: 'Best-of lists and recommendations' },
        { id: 't4', name: 'How-to Guides', description: 'Implementation and usage questions' },
        { id: 't5', name: 'Comparisons', description: 'Head-to-head product comparisons' },
        { id: 't6', name: 'Reviews & Ratings', description: 'User reviews and expert ratings' },
      ]
      setTopics(defaultTopics)
      setSelectedTopics(['t1', 't2', 't3'])
    }
    setGeneratingTopics(false)
  }

  // Generate prompts
  const generatePrompts = async () => {
    setGeneratingPrompts(true)
    const selectedTopicNames = topics.filter(t => selectedTopics.includes(t.id))
    const allPrompts = []

    for (const topic of selectedTopicNames) {
      try {
        const result = await queryAI('openai/gpt-4o-mini', `Generate ${promptsPerTopic} search prompts for "${topic.name}" in ${industry}. Mix branded (mentioning ${brandNames[0] || website}) and unbranded queries. Return JSON array: [{"text": "prompt text", "type": "branded|unbranded"}]`)
        if (result.success) {
          const jsonMatch = result.response.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            allPrompts.push(...parsed.map((p, i) => ({
              ...p,
              id: `${topic.id}-${i}`,
              topicId: topic.id,
              topicName: topic.name
            })))
          }
        }
      } catch (err) {
        console.error('Error generating prompts:', err)
      }
    }

    if (allPrompts.length === 0) {
      selectedTopicNames.forEach(topic => {
        for (let i = 0; i < promptsPerTopic; i++) {
          allPrompts.push({
            id: `${topic.id}-${i}`,
            topicId: topic.id,
            topicName: topic.name,
            text: `What are the best ${topic.name.toLowerCase()} options?`,
            type: i % 2 === 0 ? 'branded' : 'unbranded'
          })
        }
      })
    }

    setGeneratedPrompts(allPrompts)
    setGeneratingPrompts(false)
  }

  // Handlers
  const handleAddBrandName = () => {
    if (brandInput.trim() && !brandNames.includes(brandInput.trim())) {
      setBrandNames([...brandNames, brandInput.trim()])
      setBrandInput('')
    }
  }

  const handleAddCompetitor = () => {
    if (competitorInput.trim()) {
      setCompetitors([...competitors, { name: competitorInput.trim(), domain: competitorInput.trim().toLowerCase().replace(/\s+/g, '') + '.com' }])
      setCompetitorInput('')
    }
  }

  const handleAddTopic = () => {
    if (customTopicInput.trim()) {
      const newTopic = { id: `custom-${Date.now()}`, name: customTopicInput.trim(), description: 'Custom topic' }
      setTopics([...topics, newTopic])
      setSelectedTopics([...selectedTopics, newTopic.id])
      setCustomTopicInput('')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return website.trim().length > 0
      case 2: return competitors.length > 0
      case 3: return selectedEngines.length > 0
      case 4: return selectedTopics.length > 0
      case 5: return generatedPrompts.length > 0
      default: return true
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const sanitizedTopics = selectedTopics.map(id => {
        const topic = topics.find(t => t.id === id)
        return topic ? { ...topic, name: sanitizeUserInput(topic.name) } : null
      }).filter(Boolean)
      
      const sanitizedPrompts = generatedPrompts.map(p => ({
        ...p,
        text: sanitizeUserInput(p.text)
      }))
      
      const settingsData = {
        engines: selectedEngines,
        location: selectedLocation,
        topics: sanitizedTopics,
        prompts: sanitizedPrompts,
      }

      if (selectedWebsite) {
        await updateBrand(selectedWebsite.id, {
          competitors: competitors.map(c => c.domain),
          settings: settingsData
        })
      } else {
        const sanitizedWebsite = validateURL(website, true).sanitized || website
        const newBrand = await addBrand({
          user_id: userId,
          name: brandNames[0] || sanitizedWebsite,
          website: sanitizedWebsite,
          brand_names: brandNames,
          industry: sanitizeUserInput(industry),
          competitors: competitors.map(c => c.domain),
          settings: settingsData
        })
        // Set the new brand as active
        if (newBrand?.id) {
          setActiveBrand(newBrand.id)
        }
      }
      onComplete?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = LOCATIONS_LANGUAGES.filter(loc => 
    loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
    loc.code.toLowerCase().includes(locationSearch.toLowerCase())
  )

  const totalPrompts = selectedTopics.length * promptsPerTopic
  const totalCredits = totalPrompts * selectedEngines.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#0c0c0e] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">Configure Tracking</h2>
            <p className="text-[13px] text-white/40">Step {currentStep} of {STEPS.length}</p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition">
              {Icons.x}
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                  step.id === currentStep 
                    ? 'bg-amber-500/10 text-amber-400' 
                    : step.id < currentStep 
                      ? 'text-white/60' 
                      : 'text-white/20'
                }`}>
                  {step.id < currentStep ? (
                    <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">{Icons.check}</span>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/[0.06]" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
              {error}
            </div>
          )}

          {/* Step 1: Website */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-medium text-white mb-1">Enter your website</h3>
                <p className="text-[13px] text-white/40">We'll analyze your site to set up tracking</p>
              </div>

              <div>
                <label className="block text-[13px] text-white/50 mb-2">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[13px] text-white/50 mb-2">Brand names (how AI might mention you)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBrandName()}
                    placeholder="Enter brand name"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                  />
                  <button onClick={handleAddBrandName} className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition">
                    {Icons.plus}
                  </button>
                </div>
                {brandNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {brandNames.map((name, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[13px]">
                        {name}
                        <button onClick={() => setBrandNames(brandNames.filter((_, j) => j !== i))} className="text-amber-400/60 hover:text-amber-400">
                          {Icons.x}
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] text-white/50 mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                >
                  {INDUSTRIES.map(ind => <option key={ind} value={ind} className="bg-[#1a1a1f] text-white">{ind}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Competitors */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-medium text-white mb-1">Your competitors</h3>
                <p className="text-[13px] text-white/40">We'll compare your visibility against these companies</p>
              </div>

              {generatingCompetitors ? (
                <div className="flex items-center justify-center py-12 text-white/40">
                  {Icons.loader}
                  <span className="ml-3">Finding competitors...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {competitors.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div>
                          <div className="text-[14px] text-white">{comp.name}</div>
                          <div className="text-[12px] text-white/40">{comp.domain}</div>
                        </div>
                        <button onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} className="p-2 text-white/30 hover:text-red-400 transition">
                          {Icons.trash}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                      placeholder="Add competitor name"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                    />
                    <button onClick={handleAddCompetitor} className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition">
                      {Icons.plus}
                    </button>
                  </div>

                  <button onClick={generateCompetitors} className="text-[13px] text-amber-400 hover:text-amber-300">
                    Regenerate suggestions
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Engines */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-medium text-white mb-1">AI Search Engines</h3>
                <p className="text-[13px] text-white/40">Select which AI platforms to track</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(AI_SEARCH_ENGINES).map(([id, engine]) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (selectedEngines.includes(id)) {
                        setSelectedEngines(selectedEngines.filter(e => e !== id))
                      } else {
                        setSelectedEngines([...selectedEngines, id])
                      }
                    }}
                    className={`p-4 rounded-xl border text-left transition ${
                      selectedEngines.includes(id)
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[14px] font-medium ${selectedEngines.includes(id) ? 'text-amber-400' : 'text-white'}`}>
                        {engine.name}
                      </span>
                      {selectedEngines.includes(id) && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black">
                          {Icons.check}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-white/40">{engine.credits}x credit multiplier</div>
                  </button>
                ))}
              </div>

              <div className="text-[13px] text-white/40">
                Selected: {selectedEngines.length} engines
              </div>
            </div>
          )}

          {/* Step 4: Topics */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-medium text-white mb-1">Topics to track</h3>
                <p className="text-[13px] text-white/40">Select topic categories for your prompts</p>
              </div>

              {generatingTopics ? (
                <div className="flex items-center justify-center py-12 text-white/40">
                  {Icons.loader}
                  <span className="ml-3">Generating topics...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          if (selectedTopics.includes(topic.id)) {
                            setSelectedTopics(selectedTopics.filter(t => t !== topic.id))
                          } else {
                            setSelectedTopics([...selectedTopics, topic.id])
                          }
                        }}
                        className={`p-4 rounded-xl border text-left transition ${
                          selectedTopics.includes(topic.id)
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[14px] font-medium ${selectedTopics.includes(topic.id) ? 'text-amber-400' : 'text-white'}`}>
                            {topic.name}
                          </span>
                          {selectedTopics.includes(topic.id) && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black">
                              {Icons.check}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-white/40 line-clamp-2">{topic.description}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                      placeholder="Add custom topic"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                    />
                    <button onClick={handleAddTopic} className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition">
                      {Icons.plus}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Prompts */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-medium text-white mb-1">Configure prompts</h3>
                <p className="text-[13px] text-white/40">Set location and prompts per topic</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-white/50 mb-2">Location</label>
                  <div className="relative">
                    <button
                      onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left text-white text-[14px] flex items-center justify-between"
                    >
                      <span>{selectedLocation.name}</span>
                      {Icons.chevronDown}
                    </button>
                    {locationDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setLocationDropdownOpen(false)} />
                        <div className="absolute left-0 top-full mt-2 w-full bg-[#1a1a1f] border border-white/[0.1] rounded-xl shadow-xl z-50 max-h-64 overflow-hidden">
                          <div className="p-2 border-b border-white/[0.06]">
                            <input
                              type="text"
                              value={locationSearch}
                              onChange={(e) => setLocationSearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] text-white text-[13px] placeholder-white/30 focus:outline-none"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredLocations.slice(0, 20).map(loc => (
                              <button
                                key={loc.code}
                                onClick={() => { setSelectedLocation(loc); setLocationDropdownOpen(false) }}
                                className="w-full px-4 py-2.5 text-left text-[13px] text-white hover:bg-white/[0.05] flex justify-between"
                              >
                                <span>{loc.name}</span>
                                <span className="text-white/40">{loc.language}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] text-white/50 mb-2">Prompts per topic</label>
                  <select
                    value={promptsPerTopic}
                    onChange={(e) => setPromptsPerTopic(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] focus:outline-none appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    {[5, 10, 15, 20, 25].map(n => <option key={n} value={n} className="bg-[#1a1a1f] text-white">{n} prompts</option>)}
                  </select>
                </div>
              </div>

              {generatingPrompts ? (
                <div className="flex items-center justify-center py-12 text-white/40">
                  {Icons.loader}
                  <span className="ml-3">Generating prompts...</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-white">{generatedPrompts.length} prompts generated</span>
                    <button onClick={generatePrompts} className="text-[13px] text-amber-400 hover:text-amber-300">
                      Regenerate
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {generatedPrompts.slice(0, 10).map(prompt => (
                      <div key={prompt.id} className="p-3 rounded-lg bg-white/[0.02] text-[13px]">
                        <div className="text-white/70">{prompt.text}</div>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-[11px] px-2 py-0.5 rounded ${prompt.type === 'branded' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.05] text-white/40'}`}>
                            {prompt.type}
                          </span>
                          <span className="text-[11px] text-white/30">{prompt.topicName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-medium text-white mb-1">Review configuration</h3>
                <p className="text-[13px] text-white/40">Confirm your tracking setup</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[12px] text-white/40 mb-1">Website</div>
                  <div className="text-[14px] text-white">{website}</div>
                  {brandNames.length > 0 && (
                    <div className="text-[13px] text-white/50 mt-1">Brands: {brandNames.join(', ')}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[12px] text-white/40 mb-1">Competitors</div>
                    <div className="text-[14px] text-white">{competitors.length} companies</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[12px] text-white/40 mb-1">AI Engines</div>
                    <div className="text-[14px] text-white">{selectedEngines.length} platforms</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[12px] text-white/40 mb-1">Topics</div>
                    <div className="text-[14px] text-white">{selectedTopics.length} categories</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[12px] text-white/40 mb-1">Total Prompts</div>
                    <div className="text-[14px] text-white">{generatedPrompts.length}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-[12px] text-amber-400/60 mb-1">Estimated credits per run</div>
                  <div className="text-2xl font-bold text-amber-400">{totalCredits}</div>
                  <div className="text-[12px] text-white/40 mt-1">
                    {generatedPrompts.length} prompts × {selectedEngines.length} engines
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
          {currentStep > 1 ? (
            <button onClick={handlePrevious} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] transition">
              {Icons.chevronLeft}
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition ${
                canProceed()
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110'
                  : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              {Icons.chevronRight}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 disabled:opacity-50"
            >
              {loading ? Icons.loader : Icons.sparkles}
              <span>{loading ? 'Creating...' : 'Start Tracking'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
