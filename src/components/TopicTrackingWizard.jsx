import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  AI_SEARCH_ENGINES, 
  LOCATIONS_LANGUAGES, 
  SEARCH_INTENTS, 
  PROMPT_TYPES, 
  DEFAULT_PERSONAS,
  INDUSTRY_BENCHMARKS
} from '../lib/constants'
import { useBrandsStore } from '../hooks/useStore'
import { queryAI } from '../lib/api'

// Step configuration - Updated flow
const STEPS = [
  { id: 1, key: 'website', label: 'Website' },
  { id: 2, key: 'competitors', label: 'Competitors' },
  { id: 3, key: 'engines', label: 'AI Search Engines' },
  { id: 4, key: 'tracking', label: 'Tracking' },
  { id: 5, key: 'topics', label: 'Topics' },
  { id: 6, key: 'prompts', label: 'Prompts' },
  { id: 7, key: 'review', label: 'Prompt Review' },
  { id: 8, key: 'final', label: 'Final Review' }
]

export default function TopicTrackingWizard({ userId, onComplete, onCancel, existingBrands = [] }) {
  const { addBrand } = useBrandsStore()
  
  // Current step
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Website & Brands
  const [website, setWebsite] = useState('')
  const [brandNames, setBrandNames] = useState([])
  const [brandInput, setBrandInput] = useState('')
  const [channels, setChannels] = useState({ youtube: '', linkedin: '', twitter: '' })
  const [selectedWebsite, setSelectedWebsite] = useState(existingBrands.length > 0 ? existingBrands[0] : null)
  const [industry, setIndustry] = useState(existingBrands.length > 0 ? (existingBrands[0].industry || 'Digital Marketing') : 'Digital Marketing')

  // Step 2: Competitors (auto-generated)
  const [competitors, setCompetitors] = useState([])
  const [competitorInput, setCompetitorInput] = useState('')
  const [generatingCompetitors, setGeneratingCompetitors] = useState(false)

  // Step 3: AI Search Engines
  const [selectedEngines, setSelectedEngines] = useState(['chatgpt-auto', 'perplexity', 'gemini'])

  // Step 4: Tracking Settings
  const [selectedLocation, setSelectedLocation] = useState({ code: 'IN', name: 'India', language: 'English' })
  const [locationSearch, setLocationSearch] = useState('')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [trackingFrequency, setTrackingFrequency] = useState('weekly')
  const [promptsPerTopic, setPromptsPerTopic] = useState(25)

  // Step 5: Topics
  const [topics, setTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [topicPromptCounts, setTopicPromptCounts] = useState({})
  const [generatingTopics, setGeneratingTopics] = useState(false)
  const [customTopicInput, setCustomTopicInput] = useState('')

  // Step 6: Prompts Configuration
  const [promptTab, setPromptTab] = useState('types')
  const [enabledPromptTypes, setEnabledPromptTypes] = useState(['branded', 'unbranded'])
  const [enabledIntents, setEnabledIntents] = useState(SEARCH_INTENTS.map(i => i.id))
  const [personas, setPersonas] = useState([...DEFAULT_PERSONAS])
  const [selectedPersonas, setSelectedPersonas] = useState(['broad-audience'])
  const [newPersonaName, setNewPersonaName] = useState('')
  const [newPersonaDescription, setNewPersonaDescription] = useState('')
  const [showAddPersona, setShowAddPersona] = useState(false)

  // Step 7: Prompt Review
  const [generatedPrompts, setGeneratedPrompts] = useState([])
  const [generatingPrompts, setGeneratingPrompts] = useState(false)
  const [showAddPrompt, setShowAddPrompt] = useState(false)
  const [newPromptText, setNewPromptText] = useState('')
  const [newPromptType, setNewPromptType] = useState('branded')
  const [newPromptPersona, setNewPromptPersona] = useState('')
  const [newPromptIntent, setNewPromptIntent] = useState('')
  const [selectedPromptTopic, setSelectedPromptTopic] = useState(null)

  // Step 8: Final Review
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false)

  // Credits
  const availableCredits = 200

  // Calculate credit forecast
  const creditForecast = useMemo(() => {
    const totalPrompts = selectedTopics.reduce((sum, topicId) => {
      return sum + (topicPromptCounts[topicId] || promptsPerTopic)
    }, 0)
    
    const totalEngineMultiplier = selectedEngines.reduce((sum, engineId) => {
      return sum + (AI_SEARCH_ENGINES[engineId]?.credits || 1)
    }, 0)
    
    const weeklyRate = totalPrompts * totalEngineMultiplier
    const weeksLeft = weeklyRate > 0 ? Math.floor(availableCredits / weeklyRate) : Infinity
    
    return {
      totalPrompts,
      totalEngines: selectedEngines.length,
      weeklyRate: Math.round(weeklyRate),
      weeksLeft: weeksLeft === Infinity ? 'Unlimited' : `${weeksLeft} Weeks`,
      resetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }, [selectedTopics, topicPromptCounts, promptsPerTopic, selectedEngines])

  // Auto-generate competitors when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && competitors.length === 0 && !generatingCompetitors) {
      generateCompetitors()
    }
  }, [currentStep])

  // Auto-generate topics when moving to step 5
  useEffect(() => {
    if (currentStep === 5 && topics.length === 0 && !generatingTopics) {
      generateTopics()
    }
  }, [currentStep])

  // Auto-generate prompts when moving to step 7
  useEffect(() => {
    if (currentStep === 7 && generatedPrompts.length === 0 && !generatingPrompts && selectedTopics.length > 0) {
      generatePrompts()
    }
  }, [currentStep])

  // Generate competitors based on website/industry
  const generateCompetitors = async () => {
    setGeneratingCompetitors(true)
    setError('')
    
    const brandContext = brandNames.length > 0 ? brandNames.join(', ') : website
    
    try {
      const response = await queryAI('openai/gpt-4o-mini', `You are a competitive intelligence expert. Given a business website and industry, identify their top 5 competitors.

Website: ${website || 'Not provided'}
Brand: ${brandContext}
Industry: ${industry}

Return ONLY a JSON array with exactly 5 competitor objects. Each object should have:
- domain: the competitor's website domain (e.g., "competitor.com")
- name: the competitor's brand name
- traffic: estimated monthly traffic (number)
- growth: year-over-year traffic growth percentage (number, can be negative)

Example format:
[
  {"domain": "competitor1.com", "name": "Competitor One", "traffic": 50000, "growth": 25},
  {"domain": "competitor2.com", "name": "Competitor Two", "traffic": 120000, "growth": -5}
]

Return ONLY the JSON array, no other text.`, { max_tokens: 500 })

      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setCompetitors(parsed.slice(0, 5))
      }
    } catch (err) {
      console.error('Error generating competitors:', err)
      // Set demo competitors
      setCompetitors([
        { domain: 'competitor1.com', name: 'Competitor One', traffic: 45000, growth: 32 },
        { domain: 'competitor2.com', name: 'Competitor Two', traffic: 78000, growth: -8 },
        { domain: 'competitor3.com', name: 'Competitor Three', traffic: 125000, growth: 45 },
        { domain: 'competitor4.com', name: 'Competitor Four', traffic: 34000, growth: 12 },
        { domain: 'competitor5.com', name: 'Competitor Five', traffic: 89000, growth: 28 },
      ])
    } finally {
      setGeneratingCompetitors(false)
    }
  }

  // Generate topics based on brand/industry
  const generateTopics = async () => {
    setGeneratingTopics(true)
    setError('')
    
    const brandContext = brandNames.length > 0 ? brandNames.join(', ') : website
    
    try {
      const response = await queryAI('openai/gpt-4o-mini', `You are an AI search optimization expert. Generate 10 highly relevant topics for tracking AI search visibility.

Brand/Website: ${brandContext || website}
Industry: ${industry}
Competitors: ${competitors.map(c => c.name || c.domain).join(', ')}

Generate topics that:
1. Are directly relevant to what this brand sells/offers
2. Match how users search for these services in AI chatbots
3. Cover different aspects of the business (products, services, comparisons, reviews)
4. Include both branded and generic industry topics

Return ONLY a JSON array with exactly 10 topic objects:
[
  {"id": "topic-1", "name": "topic name here", "description": "brief description", "category": "category"},
  ...
]

Categories should be one of: "Products", "Services", "Comparisons", "Reviews", "How-to", "Industry"

Return ONLY the JSON array.`, { max_tokens: 800 })

      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const topicsWithIds = parsed.map((t, i) => ({
          ...t,
          id: t.id || `topic-${i + 1}`
        }))
        setTopics(topicsWithIds)
        // Auto-select first 3 topics
        setSelectedTopics(topicsWithIds.slice(0, 3).map(t => t.id))
        const counts = {}
        topicsWithIds.forEach(t => { counts[t.id] = promptsPerTopic })
        setTopicPromptCounts(counts)
      }
    } catch (err) {
      console.error('Error generating topics:', err)
      // Demo topics relevant to digital marketing
      const demoTopics = [
        { id: 'topic-1', name: `${industry} services`, description: `General ${industry.toLowerCase()} services`, category: 'Services' },
        { id: 'topic-2', name: `Best ${industry.toLowerCase()} agencies`, description: 'Agency comparison and reviews', category: 'Comparisons' },
        { id: 'topic-3', name: `${brandNames[0] || 'Brand'} reviews`, description: 'Brand reviews and testimonials', category: 'Reviews' },
        { id: 'topic-4', name: `${industry} tools`, description: 'Tools and software in the industry', category: 'Products' },
        { id: 'topic-5', name: `How to choose ${industry.toLowerCase()}`, description: 'Decision guides', category: 'How-to' },
        { id: 'topic-6', name: `${industry} pricing`, description: 'Pricing and cost information', category: 'Services' },
        { id: 'topic-7', name: `${industry} trends`, description: 'Industry trends and insights', category: 'Industry' },
        { id: 'topic-8', name: `${industry} for small business`, description: 'Solutions for SMBs', category: 'Services' },
        { id: 'topic-9', name: `${industry} ROI`, description: 'Return on investment discussions', category: 'How-to' },
        { id: 'topic-10', name: `Enterprise ${industry.toLowerCase()}`, description: 'Enterprise solutions', category: 'Services' },
      ]
      setTopics(demoTopics)
      setSelectedTopics(demoTopics.slice(0, 3).map(t => t.id))
      const counts = {}
      demoTopics.forEach(t => { counts[t.id] = promptsPerTopic })
      setTopicPromptCounts(counts)
    } finally {
      setGeneratingTopics(false)
    }
  }

  // Generate prompts for selected topics
  const generatePrompts = async () => {
    setGeneratingPrompts(true)
    setError('')
    
    const selectedTopicNames = topics.filter(t => selectedTopics.includes(t.id))
    const brandContext = brandNames.length > 0 ? brandNames.join(', ') : website
    const selectedPersonaNames = personas.filter(p => selectedPersonas.includes(p.id)).map(p => p.name)
    const selectedIntentNames = SEARCH_INTENTS.filter(i => enabledIntents.includes(i.id)).map(i => i.name)

    const allPrompts = []

    for (const topic of selectedTopicNames) {
      try {
        const response = await queryAI('openai/gpt-4o-mini', `Generate ${topicPromptCounts[topic.id] || promptsPerTopic} search prompts for AI visibility tracking.

Topic: ${topic.name}
Brand: ${brandContext}
Industry: ${industry}
Prompt Types: ${enabledPromptTypes.join(', ')}
Personas: ${selectedPersonaNames.join(', ')}
Search Intents: ${selectedIntentNames.join(', ')}

Generate realistic prompts that users would actually ask AI assistants like ChatGPT, Perplexity, or Gemini.

Return ONLY a JSON array:
[
  {
    "text": "the prompt text",
    "type": "branded" or "unbranded",
    "persona": "persona name",
    "intent": "intent type"
  }
]

Make prompts diverse across types, personas, and intents. Return ONLY JSON.`, { max_tokens: 1500 })

        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          const promptsWithMeta = parsed.map((p, i) => ({
            ...p,
            id: `${topic.id}-prompt-${i + 1}`,
            topicId: topic.id,
            topicName: topic.name
          }))
          allPrompts.push(...promptsWithMeta)
        }
      } catch (err) {
        console.error('Error generating prompts for topic:', topic.name, err)
      }
    }

    if (allPrompts.length === 0) {
      // Generate demo prompts
      selectedTopicNames.forEach(topic => {
        for (let i = 0; i < (topicPromptCounts[topic.id] || 5); i++) {
          allPrompts.push({
            id: `${topic.id}-prompt-${i + 1}`,
            topicId: topic.id,
            topicName: topic.name,
            text: `What are the best ${topic.name.toLowerCase()} options?`,
            type: i % 2 === 0 ? 'branded' : 'unbranded',
            persona: selectedPersonaNames[i % selectedPersonaNames.length] || 'General',
            intent: selectedIntentNames[i % selectedIntentNames.length] || 'Informational'
          })
        }
      })
    }

    setGeneratedPrompts(allPrompts)
    setGeneratingPrompts(false)
  }

  // Handle brand input
  const handleAddBrand = () => {
    if (brandInput.trim()) {
      const newBrands = brandInput.split(',').map(b => b.trim()).filter(b => b && !brandNames.includes(b))
      setBrandNames([...brandNames, ...newBrands])
      setBrandInput('')
    }
  }

  const handleRemoveBrand = (brand) => {
    setBrandNames(brandNames.filter(b => b !== brand))
  }

  // Handle competitor
  const handleAddCompetitor = () => {
    if (competitorInput.trim() && competitors.length < 5) {
      setCompetitors([...competitors, { domain: competitorInput.trim(), name: competitorInput.trim(), traffic: 0, growth: 0 }])
      setCompetitorInput('')
    }
  }

  const handleRemoveCompetitor = (domain) => {
    setCompetitors(competitors.filter(c => c.domain !== domain))
  }

  // Handle topic selection
  const handleToggleTopic = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId))
    } else {
      setSelectedTopics([...selectedTopics, topicId])
      if (!topicPromptCounts[topicId]) {
        setTopicPromptCounts({ ...topicPromptCounts, [topicId]: promptsPerTopic })
      }
    }
  }

  // Add custom topic
  const handleAddCustomTopic = () => {
    if (customTopicInput.trim()) {
      const newTopic = {
        id: `custom-${Date.now()}`,
        name: customTopicInput.trim(),
        description: 'Custom topic',
        category: 'Custom'
      }
      setTopics([...topics, newTopic])
      setSelectedTopics([...selectedTopics, newTopic.id])
      setTopicPromptCounts({ ...topicPromptCounts, [newTopic.id]: promptsPerTopic })
      setCustomTopicInput('')
    }
  }

  // Add persona
  const handleAddPersona = () => {
    if (newPersonaName.trim()) {
      const newPersona = {
        id: `persona-${Date.now()}`,
        name: newPersonaName.trim(),
        description: newPersonaDescription.trim()
      }
      setPersonas([...personas, newPersona])
      setSelectedPersonas([...selectedPersonas, newPersona.id])
      setNewPersonaName('')
      setNewPersonaDescription('')
      setShowAddPersona(false)
    }
  }

  // Add prompt
  const handleAddPrompt = () => {
    if (newPromptText.trim() && selectedPromptTopic) {
      const newPrompt = {
        id: `manual-${Date.now()}`,
        topicId: selectedPromptTopic,
        topicName: topics.find(t => t.id === selectedPromptTopic)?.name || 'Unknown',
        text: newPromptText.trim(),
        type: newPromptType,
        persona: newPromptPersona || 'General',
        intent: newPromptIntent || 'Informational'
      }
      setGeneratedPrompts([...generatedPrompts, newPrompt])
      setNewPromptText('')
      setNewPromptType('branded')
      setNewPromptPersona('')
      setNewPromptIntent('')
      setShowAddPrompt(false)
    }
  }

  // Delete prompt
  const handleDeletePrompt = (promptId) => {
    setGeneratedPrompts(generatedPrompts.filter(p => p.id !== promptId))
  }

  // Navigation
  const canProceed = () => {
    switch (currentStep) {
      case 1: return (website.trim() || selectedWebsite) && brandNames.length > 0
      case 2: return true // Competitors are optional
      case 3: return selectedEngines.length > 0
      case 4: return selectedLocation
      case 5: return selectedTopics.length > 0
      case 6: return enabledPromptTypes.length > 0 && enabledIntents.length > 0 && selectedPersonas.length > 0
      case 7: return generatedPrompts.length > 0
      case 8: return true
      default: return true
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Save brand if new
      if (!selectedWebsite) {
        await addBrand(userId, {
          name: brandNames[0] || website,
          website,
          brand_names: brandNames,
          industry,
          competitors: competitors.map(c => c.domain),
          settings: {
            engines: selectedEngines,
            location: selectedLocation,
            frequency: trackingFrequency,
            topics: selectedTopics.map(id => topics.find(t => t.id === id)),
            prompts: generatedPrompts,
            promptTypes: enabledPromptTypes,
            intents: enabledIntents,
            personas: selectedPersonas
          }
        })
      }
      onComplete?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Format traffic number
  const formatTraffic = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto p-4">
      <div className="w-full max-w-4xl mx-auto bg-[#1a1a1f] rounded-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold">Track Topic Performance</h2>
          <div className="flex items-center gap-4">
            {onCancel && (
              <button onClick={onCancel} className="text-white/60 hover:text-white p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center min-w-0">
                  <div className={`w-3 h-3 rounded-full transition-colors ${
                    step.id < currentStep ? 'bg-[#4a9d7c]'
                    : step.id === currentStep ? 'bg-[#4a9d7c] ring-4 ring-[#4a9d7c]/20'
                    : 'bg-white/20'
                  }`} />
                  <span className={`text-xs mt-2 whitespace-nowrap ${
                    step.id <= currentStep ? 'text-[#4a9d7c] font-medium' : 'text-white/40'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mt-[-20px] min-w-[20px] ${
                    step.id < currentStep ? 'bg-[#4a9d7c]' : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Website & Brand */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Website & Brand</h3>
                <p className="text-white/50 mt-2">Enter your website and brand information</p>
              </div>

              {existingBrands.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-3">Your Brands</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {existingBrands.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          setSelectedWebsite(brand)
                          setWebsite(brand.website || '')
                          setBrandNames(brand.brand_names || [brand.name])
                          setIndustry(brand.industry || 'Digital Marketing')
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedWebsite?.id === brand.id
                            ? 'bg-primary-500/20 border-primary-500 ring-2 ring-primary-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="font-medium text-white">{brand.name}</div>
                        <div className="text-sm text-white/50 mt-1">{brand.website || 'No website'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g., bigboost.agency"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Brand Names</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 min-h-[50px]">
                    {brandNames.map(brand => (
                      <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-[#4a9d7c]/20 text-[#4a9d7c] rounded-lg text-sm">
                        {brand}
                        <button onClick={() => handleRemoveBrand(brand)} className="hover:text-white">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddBrand()}
                      placeholder="Add brand names..."
                      className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-white placeholder:text-white/30"
                    />
                  </div>
                  <button onClick={handleAddBrand} className="px-4 py-2 bg-[#4a9d7c] hover:bg-[#3d8268] text-white rounded-xl">
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Industry</label>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
                  {Object.keys(INDUSTRY_BENCHMARKS).map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Channels (Optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={channels.youtube}
                    onChange={(e) => setChannels({ ...channels, youtube: e.target.value })}
                    placeholder="YouTube Channel"
                    className="input"
                  />
                  <input
                    type="text"
                    value={channels.linkedin}
                    onChange={(e) => setChannels({ ...channels, linkedin: e.target.value })}
                    placeholder="LinkedIn Page"
                    className="input"
                  />
                  <input
                    type="text"
                    value={channels.twitter}
                    onChange={(e) => setChannels({ ...channels, twitter: e.target.value })}
                    placeholder="Twitter/X Handle"
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Competitors */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Who are your key competitors?</h3>
                <p className="text-white/50 mt-2">We found these competitors based on your industry</p>
              </div>

              {generatingCompetitors ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="spinner w-8 h-8 mb-4" />
                  <p className="text-white/60">Finding your competitors...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selected Competitors */}
                  <div>
                    <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl border border-white/10 min-h-[120px]">
                      {competitors.map(comp => (
                        <span key={comp.domain} className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                          <span className="text-white">{comp.domain}</span>
                          <button onClick={() => handleRemoveCompetitor(comp.domain)} className="text-white/40 hover:text-white">×</button>
                        </span>
                      ))}
                      {competitors.length < 5 && (
                        <div className="flex gap-2 w-full mt-2">
                          <input
                            type="text"
                            value={competitorInput}
                            onChange={(e) => setCompetitorInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                            placeholder="Add competitor domain"
                            className="flex-1 bg-transparent border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30"
                          />
                        </div>
                      )}
                    </div>
                    {competitors.length >= 5 && (
                      <p className="text-sm text-amber-400 mt-2">Maximum of 5 reached</p>
                    )}
                    <button
                      onClick={() => setCompetitors([])}
                      className="text-sm text-white/40 hover:text-white mt-2"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Traffic Data */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-white/50 mb-4">Here's who we found, and their monthly traffic:</p>
                    <div className="space-y-3">
                      {competitors.map(comp => (
                        <div key={comp.domain} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                            {comp.name?.charAt(0) || comp.domain.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{comp.domain}</div>
                          </div>
                          <div className="text-sm text-white/60">{formatTraffic(comp.traffic)}</div>
                          <div className={`text-sm font-medium ${comp.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {comp.growth >= 0 ? '↑' : '↓'} {Math.abs(comp.growth)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: AI Search Engines */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Select AI Search Engines</h3>
                <p className="text-white/50 mt-2">Choose which AI platforms to track your visibility on</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedEngines.includes(id)
                        ? 'bg-white/10 border-[#4a9d7c] ring-2 ring-[#4a9d7c]/30'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${engine.color}20` }}>
                        {engine.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{engine.name}</div>
                        <div className="text-xs text-white/40">{engine.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center text-sm text-white/40">
                {selectedEngines.length} engine{selectedEngines.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}

          {/* Step 4: Tracking Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Tracking Settings</h3>
                <p className="text-white/50 mt-2">Configure how often and where to track</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Location & Language</label>
                  <div className="relative">
                    <button
                      onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                      className="input w-full text-left flex items-center justify-between"
                    >
                      <span>{selectedLocation?.name || 'Select location'} ({selectedLocation?.language || ''})</span>
                      <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {locationDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
                        <input
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search locations..."
                          className="w-full px-4 py-3 bg-transparent border-b border-white/10 text-white placeholder:text-white/30"
                        />
                        {LOCATIONS_LANGUAGES
                          .filter(loc => loc.name.toLowerCase().includes(locationSearch.toLowerCase()))
                          .slice(0, 10)
                          .map(loc => (
                            <button
                              key={loc.code}
                              onClick={() => {
                                setSelectedLocation(loc)
                                setLocationDropdownOpen(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-white/5 text-white/80"
                            >
                              {loc.name} ({loc.language})
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tracking Frequency</label>
                  <select
                    value={trackingFrequency}
                    onChange={(e) => setTrackingFrequency(e.target.value)}
                    className="input"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="daily" disabled>Daily (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Prompts per Topic</label>
                  <select
                    value={promptsPerTopic}
                    onChange={(e) => setPromptsPerTopic(Number(e.target.value))}
                    className="input"
                  >
                    <option value={10}>10 prompts</option>
                    <option value={25}>25 prompts</option>
                    <option value={50}>50 prompts</option>
                    <option value={100}>100 prompts</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Topics */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Select Topics to Track</h3>
                <p className="text-white/50 mt-2">Choose topics relevant to your brand</p>
              </div>

              {generatingTopics ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="spinner w-8 h-8 mb-4" />
                  <p className="text-white/60">Generating relevant topics for {brandNames[0] || website}...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedTopics.includes(topic.id)
                            ? 'bg-[#4a9d7c]/20 border-[#4a9d7c] ring-2 ring-[#4a9d7c]/30'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedTopics.includes(topic.id)
                              ? 'bg-[#4a9d7c] border-[#4a9d7c]'
                              : 'border-white/30'
                          }`}>
                            {selectedTopics.includes(topic.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{topic.name}</div>
                            <div className="text-xs text-white/40">{topic.category}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Add Custom Topic */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                      placeholder="Add custom topic..."
                      className="input flex-1"
                    />
                    <button onClick={handleAddCustomTopic} className="btn-primary px-4">
                      Add Topic
                    </button>
                  </div>

                  <div className="text-center text-sm text-white/40">
                    {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 6: Prompts Configuration */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Configure Prompts</h3>
                <p className="text-white/50 mt-2">Set prompt types, intents, and personas</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/10 pb-2">
                {[
                  { id: 'types', label: 'Prompt Types' },
                  { id: 'intents', label: 'Search Intents' },
                  { id: 'personas', label: 'Personas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPromptTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      promptTab === tab.id
                        ? 'bg-[#4a9d7c]/20 text-[#4a9d7c]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Prompt Types */}
              {promptTab === 'types' && (
                <div className="space-y-4">
                  <p className="text-sm text-white/50">Select which types of prompts to generate</p>
                  {PROMPT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        if (enabledPromptTypes.includes(type.id)) {
                          setEnabledPromptTypes(enabledPromptTypes.filter(t => t !== type.id))
                        } else {
                          setEnabledPromptTypes([...enabledPromptTypes, type.id])
                        }
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        enabledPromptTypes.includes(type.id)
                          ? 'bg-[#4a9d7c]/20 border-[#4a9d7c]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          enabledPromptTypes.includes(type.id) ? 'bg-[#4a9d7c] border-[#4a9d7c]' : 'border-white/30'
                        }`}>
                          {enabledPromptTypes.includes(type.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{type.name}</div>
                          <div className="text-sm text-white/40">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Intents */}
              {promptTab === 'intents' && (
                <div className="space-y-4">
                  <p className="text-sm text-white/50">Select search intents to include</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SEARCH_INTENTS.map(intent => (
                      <button
                        key={intent.id}
                        onClick={() => {
                          if (enabledIntents.includes(intent.id)) {
                            setEnabledIntents(enabledIntents.filter(i => i !== intent.id))
                          } else {
                            setEnabledIntents([...enabledIntents, intent.id])
                          }
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          enabledIntents.includes(intent.id)
                            ? 'bg-[#4a9d7c]/20 border-[#4a9d7c]'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            enabledIntents.includes(intent.id) ? 'bg-[#4a9d7c] border-[#4a9d7c]' : 'border-white/30'
                          }`}>
                            {enabledIntents.includes(intent.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{intent.name}</div>
                            <div className="text-xs text-white/40">{intent.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personas */}
              {promptTab === 'personas' && (
                <div className="space-y-4">
                  <p className="text-sm text-white/50">Select or create personas for prompt generation</p>
                  <div className="space-y-3">
                    {personas.map(persona => (
                      <button
                        key={persona.id}
                        onClick={() => {
                          if (selectedPersonas.includes(persona.id)) {
                            setSelectedPersonas(selectedPersonas.filter(p => p !== persona.id))
                          } else {
                            setSelectedPersonas([...selectedPersonas, persona.id])
                          }
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          selectedPersonas.includes(persona.id)
                            ? 'bg-[#4a9d7c]/20 border-[#4a9d7c]'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedPersonas.includes(persona.id) ? 'bg-[#4a9d7c] border-[#4a9d7c]' : 'border-white/30'
                          }`}>
                            {selectedPersonas.includes(persona.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{persona.name}</div>
                            <div className="text-sm text-white/40">{persona.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Add Persona */}
                  {showAddPersona ? (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                      <input
                        type="text"
                        value={newPersonaName}
                        onChange={(e) => setNewPersonaName(e.target.value)}
                        placeholder="Persona name"
                        className="input"
                      />
                      <textarea
                        value={newPersonaDescription}
                        onChange={(e) => setNewPersonaDescription(e.target.value)}
                        placeholder="Persona description"
                        className="input min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleAddPersona} className="btn-primary">Save</button>
                        <button onClick={() => setShowAddPersona(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddPersona(true)}
                      className="w-full p-4 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                    >
                      + Add Custom Persona
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 7: Prompt Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Review Prompts</h3>
                <p className="text-white/50 mt-2">Add or edit prompts for your topics</p>
              </div>

              {generatingPrompts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="spinner w-8 h-8 mb-4" />
                  <p className="text-white/60">Generating prompts for your topics...</p>
                </div>
              ) : (
                <>
                  {/* Topic Filter */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Topic:</span>
                    <select
                      value={selectedPromptTopic || ''}
                      onChange={(e) => setSelectedPromptTopic(e.target.value || null)}
                      className="input py-2 px-3"
                    >
                      <option value="">All Topics</option>
                      {topics.filter(t => selectedTopics.includes(t.id)).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddPrompt(true)}
                      className="btn-primary px-4 py-2"
                    >
                      Add Prompt
                    </button>
                  </div>

                  {/* Add Prompt Form */}
                  {showAddPrompt && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                      <h4 className="font-medium">Add Prompt</h4>
                      <p className="text-sm text-white/50">This prompt will be associated with the selected topic</p>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Prompt Type</label>
                          <select value={newPromptType} onChange={(e) => setNewPromptType(e.target.value)} className="input">
                            <option value="branded">Branded</option>
                            <option value="unbranded">Unbranded</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Persona</label>
                          <select value={newPromptPersona} onChange={(e) => setNewPromptPersona(e.target.value)} className="input">
                            <option value="">Select a persona</option>
                            {personas.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">Search Intent</label>
                          <select value={newPromptIntent} onChange={(e) => setNewPromptIntent(e.target.value)} className="input">
                            <option value="">Select an intent</option>
                            {SEARCH_INTENTS.map(i => (
                              <option key={i.id} value={i.name}>{i.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <textarea
                        value={newPromptText}
                        onChange={(e) => setNewPromptText(e.target.value)}
                        placeholder="Add a new prompt"
                        className="input min-h-[100px]"
                      />

                      <div className="flex gap-2 justify-end">
                        <button onClick={handleAddPrompt} className="btn-primary">Save</button>
                        <button onClick={() => setShowAddPrompt(false)} className="text-white/60 hover:text-white">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Prompts List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {generatedPrompts
                      .filter(p => !selectedPromptTopic || p.topicId === selectedPromptTopic)
                      .map(prompt => (
                        <div key={prompt.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3">
                          <div className="flex-1">
                            <div className="text-sm text-white">{prompt.text}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{prompt.type}</span>
                              <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{prompt.persona}</span>
                              <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{prompt.intent}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="text-white/40 hover:text-red-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                  </div>

                  <div className="text-center text-sm text-white/40">
                    {generatedPrompts.length} prompt{generatedPrompts.length !== 1 ? 's' : ''} total
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 8: Final Review */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Final Review</h3>
                <p className="text-white/50 mt-2">Review your configuration before starting</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topic Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Review Your Topic Selection</h4>
                    <div className="relative">
                      <button
                        onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
                        className="px-3 py-1.5 bg-white/10 rounded-lg text-sm flex items-center gap-2"
                      >
                        {selectedEngines.length} AI Search Engines
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {engineDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl z-10">
                          <div className="p-3 border-b border-white/10 flex items-center justify-between">
                            <span className="text-sm text-white/60">{selectedEngines.length} selected</span>
                            <div className="flex gap-2 text-xs">
                              <button onClick={() => setSelectedEngines(Object.keys(AI_SEARCH_ENGINES))} className="text-[#4a9d7c]">Select all</button>
                              <button onClick={() => setSelectedEngines([])} className="text-white/40">Deselect all</button>
                            </div>
                          </div>
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
                              className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border ${selectedEngines.includes(id) ? 'bg-[#4a9d7c] border-[#4a9d7c]' : 'border-white/30'}`}>
                                  {selectedEngines.includes(id) && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm text-white">{engine.name}</span>
                              </div>
                              <span className="text-xs text-white/40">x {engine.credits}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/50 mb-4">
                    All topics will be tracked {trackingFrequency} in {selectedLocation?.name} ({selectedLocation?.language})
                  </p>

                  <div className="space-y-2">
                    {topics.filter(t => selectedTopics.includes(t.id)).map(topic => (
                      <div key={topic.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#4a9d7c] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white">{topic.name}</div>
                          <div className="text-xs text-white/40">{topicPromptCounts[topic.id] || promptsPerTopic} Prompts</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/60">Manage your topic prompts manually:</p>
                    <p className="text-sm text-white/40">download the file, edit, and re-upload your version</p>
                    <div className="flex gap-2 mt-3">
                      <button className="px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5">
                        ↓ Download
                      </button>
                      <button className="px-4 py-2 border border-white/20 rounded-lg text-sm hover:bg-white/5 text-white/40">
                        ↑ Upload
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credit Usage Forecast */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold mb-4">Credit Usage Forecast</h4>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <select className="input py-2 px-3 w-20">
                      <option>{selectedTopics.length}</option>
                    </select>
                    <span className="text-white/60">Topics ({creditForecast.totalPrompts} prompts)</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Available Credits:</span>
                      <span className="font-medium">{availableCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Current Weekly Rate:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Projected Weekly Rate:</span>
                      <span className="font-medium">{creditForecast.weeklyRate}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="text-white/60">Tracking Time Left:</span>
                      <span className="font-semibold text-white">{creditForecast.weeksLeft}</span>
                    </div>
                    <div className="text-sm text-white/40">
                      Credit Reset Date: {creditForecast.resetDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          {currentStep > 1 ? (
            <button onClick={handlePrevious} className="flex items-center gap-2 text-white/60 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${
                canProceed()
                  ? 'bg-[#4a9d7c] hover:bg-[#3d8268] text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              Next: {STEPS[currentStep]?.label}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-[#4a9d7c] hover:bg-[#3d8268] text-white"
            >
              {loading ? 'Starting...' : 'Start Tracking'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
