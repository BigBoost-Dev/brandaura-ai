import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  AI_SEARCH_ENGINES, 
  LOCATIONS_LANGUAGES, 
  SEARCH_INTENTS, 
  PROMPT_TYPES, 
  DEFAULT_PERSONAS,
  TOPIC_LOADING_MESSAGES,
  PROMPT_LOADING_MESSAGES,
  INDUSTRY_BENCHMARKS
} from '../lib/constants'
import { useBrandsStore } from '../hooks/useStore'
import { queryAI } from '../lib/api'

// Step configuration
const STEPS = [
  { id: 1, key: 'website', label: 'Website' },
  { id: 2, key: 'engines', label: 'AI Search Engines' },
  { id: 3, key: 'tracking', label: 'Tracking' },
  { id: 4, key: 'topics', label: 'Topics' },
  { id: 5, key: 'prompts', label: 'Prompts' },
  { id: 6, key: 'review', label: 'Prompt Review' },
  { id: 7, key: 'final', label: 'Final Review' }
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
  const [competitors, setCompetitors] = useState([])
  const [competitorInput, setCompetitorInput] = useState('')
  const [selectedWebsite, setSelectedWebsite] = useState(existingBrands.length > 0 ? existingBrands[0] : null)
  const [industry, setIndustry] = useState(existingBrands.length > 0 ? (existingBrands[0].industry || 'Digital Marketing') : 'Digital Marketing')
  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false)

  // Step 2: AI Search Engines
  const [selectedEngines, setSelectedEngines] = useState([])

  // Step 3: Tracking Settings
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [trackingFrequency, setTrackingFrequency] = useState('weekly')
  const [promptsPerTopic, setPromptsPerTopic] = useState(25)

  // Step 4: Topics
  const [topics, setTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [topicPromptCounts, setTopicPromptCounts] = useState({})
  const [generatingTopics, setGeneratingTopics] = useState(false)
  const [topicLoadingMessage, setTopicLoadingMessage] = useState(0)
  const [customTopicInput, setCustomTopicInput] = useState('')

  // Step 5: Prompts Configuration
  const [promptTab, setPromptTab] = useState('types') // types, intents, personas
  const [enabledPromptTypes, setEnabledPromptTypes] = useState(['branded', 'unbranded'])
  const [enabledIntents, setEnabledIntents] = useState(SEARCH_INTENTS.map(i => i.id))
  const [personas, setPersonas] = useState([...DEFAULT_PERSONAS])
  const [selectedPersonas, setSelectedPersonas] = useState(['broad-audience'])
  const [newPersonaName, setNewPersonaName] = useState('')
  const [newPersonaDescription, setNewPersonaDescription] = useState('')
  const [showAddPersona, setShowAddPersona] = useState(false)

  // Step 6: Prompt Review
  const [generatedPrompts, setGeneratedPrompts] = useState([])
  const [generatingPrompts, setGeneratingPrompts] = useState(false)
  const [promptLoadingMessage, setPromptLoadingMessage] = useState(0)
  const [showAddPrompt, setShowAddPrompt] = useState(false)
  const [newPromptText, setNewPromptText] = useState('')
  const [newPromptType, setNewPromptType] = useState('branded')
  const [newPromptPersona, setNewPromptPersona] = useState('')
  const [newPromptIntent, setNewPromptIntent] = useState('')
  const [editingPromptId, setEditingPromptId] = useState(null)
  const [selectedPromptTopic, setSelectedPromptTopic] = useState(null)

  // Step 7: Final Review
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false)

  // Credits calculation
  const availableCredits = 200 // This would come from user's plan
  const creditResetDate = new Date()
  creditResetDate.setDate(creditResetDate.getDate() + 20) // Example reset date

  // Calculate projected weekly rate
  const projectedWeeklyRate = useMemo(() => {
    const totalPrompts = selectedTopics.reduce((sum, topicId) => {
      return sum + (topicPromptCounts[topicId] || promptsPerTopic)
    }, 0)
    
    const engineCredits = selectedEngines.reduce((sum, engineId) => {
      return sum + (AI_SEARCH_ENGINES[engineId]?.credits || 0)
    }, 0)
    
    return Math.round(totalPrompts * engineCredits)
  }, [selectedTopics, topicPromptCounts, promptsPerTopic, selectedEngines])

  // Tracking time calculation
  const trackingTimeLeft = useMemo(() => {
    if (projectedWeeklyRate === 0) return 'Unlimited'
    const weeks = Math.floor(availableCredits / projectedWeeklyRate)
    if (weeks < 1) return '< 1 Week'
    if (weeks === 1) return '1 Week'
    return `${weeks} Weeks`
  }, [availableCredits, projectedWeeklyRate])

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!locationSearch) return LOCATIONS_LANGUAGES
    const search = locationSearch.toLowerCase()
    return LOCATIONS_LANGUAGES.filter(loc => 
      loc.label.toLowerCase().includes(search) ||
      loc.country.toLowerCase().includes(search) ||
      loc.language.toLowerCase().includes(search)
    )
  }, [locationSearch])

  // Loading message rotation for topics
  useEffect(() => {
    if (generatingTopics) {
      const interval = setInterval(() => {
        setTopicLoadingMessage(prev => (prev + 1) % TOPIC_LOADING_MESSAGES.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [generatingTopics])

  // Loading message rotation for prompts
  useEffect(() => {
    if (generatingPrompts) {
      const interval = setInterval(() => {
        setPromptLoadingMessage(prev => (prev + 1) % PROMPT_LOADING_MESSAGES.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [generatingPrompts])

  // Generate topics using AI
  const generateTopics = async () => {
    setGeneratingTopics(true)
    setTopicLoadingMessage(0)
    
    try {
      const brandContext = brandNames.length > 0 ? brandNames.join(', ') : website
      const prompt = `Generate 50 relevant search topics for a ${industry} business with the brand/website: ${brandContext}.
      
These topics should represent what potential customers might search for when looking for products/services in this industry.
Include a mix of:
- Industry-specific topics
- Problem-solving topics
- Comparison topics
- How-to topics
- Best practices topics

Return ONLY a JSON array of topic strings, no other text. Example format:
["AI in digital marketing", "Content marketing strategies", "SEO best practices"]`

      const result = await queryAI('openai/gpt-4o-mini', prompt)
      
      if (result.success && result.response) {
        try {
          // Extract JSON from response
          const jsonMatch = result.response.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const topicsArray = JSON.parse(jsonMatch[0])
            setTopics(topicsArray.map((topic, index) => ({
              id: `topic-${index}`,
              name: topic,
              promptCount: promptsPerTopic
            })))
          }
        } catch (parseError) {
          console.error('Failed to parse topics:', parseError)
          // Fallback topics
          setTopics(generateFallbackTopics())
        }
      } else {
        setTopics(generateFallbackTopics())
      }
    } catch (err) {
      console.error('Error generating topics:', err)
      setTopics(generateFallbackTopics())
    } finally {
      setGeneratingTopics(false)
    }
  }

  // Fallback topics if AI fails
  const generateFallbackTopics = () => {
    const fallbackTopics = [
      'AI in digital marketing',
      'AI-powered ad campaigns',
      'Affiliate marketing programs',
      'App marketing strategies',
      'B2B lead generation',
      'Brand growth strategies',
      'Building a sales funnel',
      'Competitive analysis online',
      'Content marketing strategy',
      'Conversion rate optimization',
      'Customer acquisition cost',
      'Customer data platforms (CDP)',
      'Digital advertising trends',
      'Email marketing automation',
      'Growth hacking techniques',
      'Influencer marketing ROI',
      'Lead nurturing strategies',
      'Marketing analytics tools',
      'Mobile marketing trends',
      'Omnichannel marketing',
      'Pay-per-click advertising',
      'Personalization in marketing',
      'Programmatic advertising',
      'Retargeting strategies',
      'SEO best practices',
      'Social media management',
      'Video marketing trends',
      'Voice search optimization',
      'Web analytics tools',
      'Website conversion optimization'
    ]
    
    return fallbackTopics.map((topic, index) => ({
      id: `topic-${index}`,
      name: topic,
      promptCount: promptsPerTopic
    }))
  }

  // Generate prompts using AI
  const generatePrompts = async () => {
    setGeneratingPrompts(true)
    setPromptLoadingMessage(0)
    
    try {
      const selectedTopicNames = topics
        .filter(t => selectedTopics.includes(t.id))
        .map(t => t.name)
      
      const brandContext = brandNames.length > 0 ? brandNames[0] : website
      const selectedIntentNames = SEARCH_INTENTS
        .filter(i => enabledIntents.includes(i.id))
        .map(i => i.name)
      
      const prompt = `Generate search prompts for AI visibility tracking.

Brand/Website: ${brandContext}
Topics: ${selectedTopicNames.join(', ')}
Search Intents: ${selectedIntentNames.join(', ')}
Include Branded Prompts: ${enabledPromptTypes.includes('branded')}
Include Non-Branded Prompts: ${enabledPromptTypes.includes('unbranded')}
Target: ${promptsPerTopic} prompts per topic

Generate realistic prompts that users might ask AI assistants. Mix branded (mentioning ${brandContext}) and unbranded prompts.

Return ONLY a JSON array with this structure:
[{"text": "prompt text", "type": "branded" or "unbranded", "topic": "topic name", "intent": "intent name"}]`

      const result = await queryAI('openai/gpt-4o-mini', prompt)
      
      if (result.success && result.response) {
        try {
          const jsonMatch = result.response.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const promptsArray = JSON.parse(jsonMatch[0])
            setGeneratedPrompts(promptsArray.map((p, index) => ({
              id: `prompt-${index}`,
              text: p.text,
              type: p.type || 'unbranded',
              topic: p.topic || selectedTopicNames[0],
              intent: p.intent || 'recommendations',
              persona: 'broad-audience'
            })))
          }
        } catch (parseError) {
          console.error('Failed to parse prompts:', parseError)
          setGeneratedPrompts(generateFallbackPrompts(selectedTopicNames, brandContext))
        }
      } else {
        const selectedTopicNamesFallback = topics
          .filter(t => selectedTopics.includes(t.id))
          .map(t => t.name)
        setGeneratedPrompts(generateFallbackPrompts(selectedTopicNamesFallback, brandContext))
      }
    } catch (err) {
      console.error('Error generating prompts:', err)
      const selectedTopicNames = topics
        .filter(t => selectedTopics.includes(t.id))
        .map(t => t.name)
      const brandContext = brandNames.length > 0 ? brandNames[0] : website
      setGeneratedPrompts(generateFallbackPrompts(selectedTopicNames, brandContext))
    } finally {
      setGeneratingPrompts(false)
    }
  }

  // Fallback prompts if AI fails
  const generateFallbackPrompts = (topicNames, brand) => {
    const prompts = []
    const intents = SEARCH_INTENTS.filter(i => enabledIntents.includes(i.id))
    
    topicNames.forEach((topic, topicIndex) => {
      // Generate prompts for each topic
      const promptTemplates = [
        { text: `What are the best tools for ${topic}?`, type: 'unbranded', intent: 'recommendations' },
        { text: `Can ${brand} help with ${topic}?`, type: 'branded', intent: 'recommendations' },
        { text: `How does AI impact ${topic}?`, type: 'unbranded', intent: 'education' },
        { text: `Compare ${brand} to competitors for ${topic}`, type: 'branded', intent: 'comparison' },
        { text: `${topic} best practices for small businesses`, type: 'unbranded', intent: 'education' },
        { text: `Is ${brand} good for ${topic}?`, type: 'branded', intent: 'recommendations' },
        { text: `How much does ${topic} software cost?`, type: 'unbranded', intent: 'pricing' },
        { text: `${brand} pricing for ${topic} services`, type: 'branded', intent: 'pricing' },
        { text: `How to get started with ${topic}`, type: 'unbranded', intent: 'education' },
        { text: `${brand} ${topic} features and benefits`, type: 'branded', intent: 'navigation' }
      ]
      
      promptTemplates.forEach((template, i) => {
        if (enabledPromptTypes.includes(template.type)) {
          prompts.push({
            id: `prompt-${topicIndex}-${i}`,
            text: template.text,
            type: template.type,
            topic: topic,
            intent: template.intent,
            persona: 'broad-audience'
          })
        }
      })
    })
    
    return prompts.slice(0, selectedTopics.length * promptsPerTopic)
  }

  // Handle brand name input
  const handleAddBrand = () => {
    if (brandInput.trim() && !brandNames.includes(brandInput.trim())) {
      setBrandNames([...brandNames, brandInput.trim()])
      setBrandInput('')
    }
  }

  const handleRemoveBrand = (brand) => {
    setBrandNames(brandNames.filter(b => b !== brand))
  }

  // Handle competitor input
  const handleAddCompetitor = () => {
    if (competitorInput.trim() && !competitors.includes(competitorInput.trim()) && competitors.length < 5) {
      setCompetitors([...competitors, competitorInput.trim()])
      setCompetitorInput('')
    }
  }

  const handleRemoveCompetitor = (comp) => {
    setCompetitors(competitors.filter(c => c !== comp))
  }

  // Handle engine selection
  const toggleEngine = (engineId) => {
    setSelectedEngines(prev =>
      prev.includes(engineId)
        ? prev.filter(e => e !== engineId)
        : [...prev, engineId]
    )
  }

  // Handle topic selection
  const toggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    )
  }

  // Handle adding custom topic
  const handleAddTopic = () => {
    if (customTopicInput.trim()) {
      const newTopic = {
        id: `topic-custom-${Date.now()}`,
        name: customTopicInput.trim(),
        promptCount: promptsPerTopic
      }
      setTopics([...topics, newTopic])
      setCustomTopicInput('')
    }
  }

  // Handle prompt type toggle
  const togglePromptType = (typeId) => {
    setEnabledPromptTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  // Handle intent toggle
  const toggleIntent = (intentId) => {
    setEnabledIntents(prev =>
      prev.includes(intentId)
        ? prev.filter(i => i !== intentId)
        : [...prev, intentId]
    )
  }

  // Handle persona toggle
  const togglePersona = (personaId) => {
    setSelectedPersonas(prev =>
      prev.includes(personaId)
        ? prev.filter(p => p !== personaId)
        : [...prev, personaId]
    )
  }

  // Handle adding new persona
  const handleAddPersona = () => {
    if (newPersonaName.trim()) {
      const newPersona = {
        id: `persona-${Date.now()}`,
        name: newPersonaName.trim(),
        description: newPersonaDescription.trim() || 'Custom persona',
        icon: '👤',
        isDefault: false
      }
      setPersonas([...personas, newPersona])
      setSelectedPersonas([...selectedPersonas, newPersona.id])
      setNewPersonaName('')
      setNewPersonaDescription('')
      setShowAddPersona(false)
    }
  }

  // Handle adding new prompt
  const handleAddPrompt = () => {
    if (newPromptText.trim()) {
      const newPrompt = {
        id: `prompt-custom-${Date.now()}`,
        text: newPromptText.trim(),
        type: newPromptType,
        topic: selectedPromptTopic || topics.find(t => selectedTopics.includes(t.id))?.name || '',
        intent: newPromptIntent || 'recommendations',
        persona: newPromptPersona || 'broad-audience'
      }
      setGeneratedPrompts([...generatedPrompts, newPrompt])
      setNewPromptText('')
      setNewPromptType('branded')
      setNewPromptPersona('')
      setNewPromptIntent('')
      setShowAddPrompt(false)
    }
  }

  // Handle editing prompt
  const handleSavePromptEdit = (promptId, newText) => {
    setGeneratedPrompts(prev =>
      prev.map(p => p.id === promptId ? { ...p, text: newText } : p)
    )
    setEditingPromptId(null)
  }

  // Handle deleting prompt
  const handleDeletePrompt = (promptId) => {
    setGeneratedPrompts(prev => prev.filter(p => p.id !== promptId))
  }

  // Export prompts to CSV
  const exportPromptsCSV = () => {
    const headers = ['Prompt', 'Type', 'Topic', 'Intent', 'Persona']
    const rows = generatedPrompts.map(p => [
      `"${p.text.replace(/"/g, '""')}"`,
      p.type,
      p.topic,
      p.intent,
      p.persona
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompts-${website || 'brand'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import prompts from CSV
  const importPromptsCSV = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n').slice(1) // Skip header
        const imported = lines
          .filter(line => line.trim())
          .map((line, index) => {
            const parts = line.match(/(".*?"|[^,]+)/g) || []
            return {
              id: `prompt-imported-${index}`,
              text: (parts[0] || '').replace(/^"|"$/g, '').replace(/""/g, '"'),
              type: (parts[1] || 'unbranded').trim(),
              topic: (parts[2] || '').trim(),
              intent: (parts[3] || 'recommendations').trim(),
              persona: (parts[4] || 'broad-audience').trim()
            }
          })
        setGeneratedPrompts(imported)
      }
      reader.readAsText(file)
    }
  }

  // Step navigation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return website.trim() && brandNames.length > 0
      case 2:
        return selectedEngines.length > 0
      case 3:
        return selectedLocation !== null
      case 4:
        return selectedTopics.length > 0
      case 5:
        return enabledPromptTypes.length > 0 && enabledIntents.length > 0 && selectedPersonas.length > 0
      case 6:
        return generatedPrompts.length > 0
      case 7:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep === 3 && topics.length === 0) {
      // Generate topics when entering step 4
      await generateTopics()
    }
    if (currentStep === 5 && generatedPrompts.length === 0) {
      // Generate prompts when entering step 6
      await generatePrompts()
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Final submission
  const handleStartTracking = async () => {
    setLoading(true)
    setError('')

    try {
      const locationData = LOCATIONS_LANGUAGES.find(l => l.id === selectedLocation)
      
      await addBrand({
        user_id: userId,
        name: brandNames[0],
        domain: website,
        category: industry,
        industry: industry,
        use_case: 'topic-tracking',
        competitors: competitors.map(c => ({ name: c })),
        selected_platforms: selectedEngines,
        settings: {
          location: selectedLocation,
          locationLabel: locationData?.label,
          trackingFrequency,
          topics: topics.filter(t => selectedTopics.includes(t.id)),
          prompts: generatedPrompts,
          promptTypes: enabledPromptTypes,
          searchIntents: enabledIntents,
          personas: personas.filter(p => selectedPersonas.includes(p.id)),
          brandNames,
          promptsPerTopic
        }
      })
      
      onComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Get prompts for current topic (for review step)
  const getPromptsForTopic = (topicName) => {
    return generatedPrompts.filter(p => p.topic === topicName)
  }

  // Calculate total prompts
  const totalPrompts = useMemo(() => {
    return selectedTopics.reduce((sum, topicId) => {
      return sum + (topicPromptCounts[topicId] || promptsPerTopic)
    }, 0)
  }, [selectedTopics, topicPromptCounts, promptsPerTopic])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="w-full max-w-4xl mx-auto bg-[#1a1a1f] rounded-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold">Track Topic Performance</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sufficient Credits
            </div>
            <button
              onClick={onCancel}
              className="text-white/60 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full transition-colors ${
                      step.id < currentStep
                        ? 'bg-[#4a9d7c]'
                        : step.id === currentStep
                        ? 'bg-[#4a9d7c] ring-4 ring-[#4a9d7c]/20'
                        : 'bg-white/20'
                    }`}
                  />
                  <span className={`text-xs mt-2 whitespace-nowrap ${
                    step.id <= currentStep ? 'text-[#4a9d7c] font-medium' : 'text-white/40'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mt-[-20px] ${
                    step.id < currentStep ? 'bg-[#4a9d7c]' : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {/* Step 1: Website & Brands */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">
                  {existingBrands.length > 0 ? 'Select or Add Brand' : 'Set Up Your Brand'}
                </h3>
                <p className="text-white/50 mt-2">
                  {existingBrands.length > 0 
                    ? 'Choose an existing brand to track topics for, or add a new one.'
                    : 'Enter your website and brand information to get started.'}
                </p>
              </div>

              {/* Existing Brands Selection */}
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
                          setCompetitors(brand.competitors || [])
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedWebsite?.id === brand.id
                            ? 'bg-primary-500/20 border-primary-500 ring-2 ring-primary-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="font-medium text-white">{brand.name}</div>
                        <div className="text-sm text-white/50 mt-1">{brand.website || 'No website'}</div>
                        {brand.industry && (
                          <div className="text-xs text-white/40 mt-1">{brand.industry}</div>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedWebsite(null)
                        setWebsite('')
                        setBrandNames([])
                        setIndustry('Digital Marketing')
                        setCompetitors([])
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedWebsite === null && existingBrands.length > 0
                          ? 'bg-[#4a9d7c]/20 border-[#4a9d7c] ring-2 ring-[#4a9d7c]/50'
                          : 'bg-white/5 border-white/10 border-dashed hover:border-[#4a9d7c]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[#4a9d7c]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium">Add New Brand</span>
                      </div>
                      <div className="text-sm text-white/40 mt-1">Create a new brand to track</div>
                    </button>
                  </div>
                </div>
              )}

              {/* New Brand Form - Show when no existing brands OR "Add New" is selected */}
              {(existingBrands.length === 0 || selectedWebsite === null) && (
                <div className="space-y-6">
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
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Brand names associated with your website:
                      <button className="ml-2 text-white/40 hover:text-white/60">
                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 min-h-[50px]">
                        {brandNames.map(brand => (
                          <span
                            key={brand}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#4a9d7c]/20 text-[#4a9d7c] rounded-lg text-sm"
                          >
                            {brand}
                            <button onClick={() => handleRemoveBrand(brand)} className="hover:text-white">×</button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={brandInput}
                          onChange={(e) => setBrandInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddBrand()}
                          placeholder="Enter brand names, separated by commas."
                          className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-white placeholder:text-white/30"
                        />
                      </div>
                      <button
                        onClick={handleAddBrand}
                        className="px-4 py-2 bg-[#4a9d7c] hover:bg-[#3d8268] text-white rounded-xl font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button className="px-3 py-2 text-white/40 hover:text-white/60">
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Industry</label>
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
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Competitors (optional, max 5)
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 min-h-[50px]">
                      {competitors.map(comp => (
                        <span
                          key={comp}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 rounded-lg text-sm"
                        >
                          {comp}
                          <button onClick={() => handleRemoveCompetitor(comp)} className="hover:text-white">×</button>
                        </span>
                      ))}
                      {competitors.length < 5 && (
                        <input
                          type="text"
                          value={competitorInput}
                          onChange={(e) => setCompetitorInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                          placeholder="Add competitor domain"
                          className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-white placeholder:text-white/30"
                        />
                      )}
                    </div>
                    {competitors.length >= 5 && (
                      <p className="text-sm text-amber-400 mt-2">Maximum of 5 reached</p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Brand Summary - Show when existing brand is selected */}
              {selectedWebsite && (
                <div className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <span className="text-primary-400 font-bold">{selectedWebsite.name?.charAt(0) || 'B'}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{selectedWebsite.name}</div>
                      <div className="text-sm text-white/50">{selectedWebsite.website || 'No website configured'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: AI Search Engines */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Select AI Search Engines</h3>
                <p className="text-white/50 mt-2">Pick the engines you want monitored for your topics.</p>
              </div>

              <div>
                <h4 className="font-semibold text-white/80 mb-4">AI Search Engines</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(AI_SEARCH_ENGINES).map(([id, engine]) => (
                    <button
                      key={id}
                      onClick={() => toggleEngine(id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedEngines.includes(id)
                          ? 'border-[#4a9d7c] bg-[#4a9d7c]/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedEngines.includes(id) ? 'border-[#4a9d7c] bg-[#4a9d7c]' : 'border-white/30'
                          }`}>
                            {selectedEngines.includes(id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{engine.name}</div>
                            <div className="text-sm text-white/50">{engine.credits} credit{engine.credits !== 1 ? 's' : ''} per AI response collection</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-amber-400">⚠️</span>
                  <div>
                    <span className="text-amber-400 font-medium">Warning</span>
                    <span className="text-white/70 ml-2">Tracking multiple AI search engines uses more credits. You can review your credit usage afterward.</span>
                  </div>
                </div>

                <button className="mt-4 text-[#4a9d7c] hover:text-[#5ab88f] text-sm font-medium">
                  Show more
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Tracking Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Tracking Settings</h3>
                <p className="text-white/50 mt-2">Set the basics for tracking: where, how often, and how many prompts per topic.</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Location & Language
                      <button className="ml-2 text-white/40 hover:text-white/60">
                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                        className="w-full input flex items-center justify-between"
                      >
                        <span className={selectedLocation ? 'text-white' : 'text-white/40'}>
                          {selectedLocation 
                            ? LOCATIONS_LANGUAGES.find(l => l.id === selectedLocation)?.label 
                            : 'Select'}
                        </span>
                        <svg className={`w-5 h-5 text-white/40 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {locationDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-[#25252b] rounded-xl border border-white/10 shadow-xl max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-white/10">
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <input
                                type="text"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                placeholder="Search"
                                className="w-full pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#4a9d7c]"
                              />
                              {locationSearch && (
                                <button
                                  onClick={() => setLocationSearch('')}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div className="p-2">
                              <div className="text-xs text-white/40 px-3 py-2">All Locations & Languages</div>
                              {filteredLocations.map(loc => (
                                <button
                                  key={loc.id}
                                  onClick={() => {
                                    setSelectedLocation(loc.id)
                                    setLocationDropdownOpen(false)
                                    setLocationSearch('')
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-2 ${
                                    selectedLocation === loc.id ? 'bg-[#4a9d7c]/20 text-[#4a9d7c]' : 'text-white/80'
                                  }`}
                                >
                                  <span>{loc.flag}</span>
                                  <span>{loc.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Prompts per Topic</label>
                    <input
                      type="number"
                      value={promptsPerTopic}
                      onChange={(e) => setPromptsPerTopic(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="100"
                      className="input w-32"
                    />
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-white mb-4">Credit Usage Forecast</h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <select className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white border border-white/10">
                      <option>1</option>
                      <option>2</option>
                      <option>5</option>
                      <option>10</option>
                    </select>
                    <span className="text-white/60 text-sm">Topics ({promptsPerTopic * 1} prompts)</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Available Credits:</span>
                      <span className="text-white font-medium">{availableCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        Current Weekly Rate:
                        <button className="ml-1 text-white/40 hover:text-white/60">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                      <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        Projected Weekly Rate:
                        <button className="ml-1 text-white/40 hover:text-white/60">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                      <span className={`font-medium ${projectedWeeklyRate > availableCredits ? 'text-red-400' : 'text-white'}`}>
                        {projectedWeeklyRate}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Tracking Time Left:</span>
                        <span className={`font-medium ${trackingTimeLeft === '< 1 Week' ? 'text-red-400' : 'text-white'}`}>
                          {trackingTimeLeft}
                        </span>
                      </div>
                    </div>
                    <div className="text-white/40 text-xs mt-2">
                      Credit Reset Date: {creditResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Topics */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Select Topics</h3>
              </div>

              {generatingTopics ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative mb-6">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3 text-center">
                    {TOPIC_LOADING_MESSAGES.map((msg, i) => (
                      <p
                        key={i}
                        className={`text-white/60 transition-opacity duration-500 ${
                          i === topicLoadingMessage ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-white">Suggested Topics</h4>
                      <p className="text-sm text-white/50">{topics.length} Topics Generated</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCustomTopicInput(customTopicInput ? '' : ' ')}
                        className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
                      >
                        Add Topics
                      </button>
                      <button
                        onClick={generateTopics}
                        className="px-4 py-2 border border-[#4a9d7c] text-[#4a9d7c] rounded-lg hover:bg-[#4a9d7c]/10 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Regenerate Topics
                      </button>
                    </div>
                  </div>

                  {customTopicInput !== '' && (
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={customTopicInput.trim()}
                        onChange={(e) => setCustomTopicInput(e.target.value)}
                        placeholder="Enter custom topic"
                        className="input flex-1"
                        autoFocus
                      />
                      <button
                        onClick={handleAddTopic}
                        disabled={!customTopicInput.trim()}
                        className="px-4 py-2 bg-[#4a9d7c] text-white rounded-lg disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setCustomTopicInput('')}
                        className="px-4 py-2 text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto border border-white/10 rounded-xl">
                    {topics.map(topic => (
                      <div
                        key={topic.id}
                        className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 ${
                          selectedTopics.includes(topic.id) ? 'bg-[#4a9d7c]/5' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedTopics.includes(topic.id) ? 'border-[#4a9d7c] bg-[#4a9d7c]' : 'border-white/30'
                          }`}
                        >
                          {selectedTopics.includes(topic.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <span className="flex-1 text-white/80">{topic.name}</span>
                        {selectedTopics.includes(topic.id) && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={topicPromptCounts[topic.id] || promptsPerTopic}
                              onChange={(e) => setTopicPromptCounts({
                                ...topicPromptCounts,
                                [topic.id]: Math.max(1, parseInt(e.target.value) || 1)
                              })}
                              min="1"
                              max="100"
                              className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-center text-sm text-white"
                            />
                            <span className="text-white/50 text-sm">No. of prompts in topic</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-white/50">
                    {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Configure Prompts */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Configure Prompts</h3>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {[
                  { id: 'types', label: 'Prompt Types' },
                  { id: 'intents', label: 'Search Intents' },
                  { id: 'personas', label: 'Personas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPromptTab(tab.id)}
                    className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 -mb-px ${
                      promptTab === tab.id
                        ? 'text-[#4a9d7c] border-[#4a9d7c]'
                        : 'text-white/50 border-transparent hover:text-white/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Prompt Types Tab */}
              {promptTab === 'types' && (
                <div className="space-y-4">
                  <p className="text-white/60">Select the types of prompts you would like to include in the generation.</p>
                  
                  {PROMPT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => togglePromptType(type.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        enabledPromptTypes.includes(type.id)
                          ? 'border-[#4a9d7c] bg-[#4a9d7c]/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          enabledPromptTypes.includes(type.id) ? 'border-[#4a9d7c] bg-[#4a9d7c]' : 'border-white/30'
                        }`}>
                          {enabledPromptTypes.includes(type.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{type.name}</div>
                          <div className="text-sm text-white/50 mt-1">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Intents Tab */}
              {promptTab === 'intents' && (
                <div className="space-y-4">
                  <p className="text-white/60">Each intent guides the generation of AI prompts based on the searcher's goals.</p>
                  
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {SEARCH_INTENTS.map(intent => (
                      <button
                        key={intent.id}
                        onClick={() => toggleIntent(intent.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          enabledIntents.includes(intent.id)
                            ? 'border-[#4a9d7c] bg-[#4a9d7c]/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            enabledIntents.includes(intent.id) ? 'border-[#4a9d7c] bg-[#4a9d7c]' : 'border-white/30'
                          }`}>
                            {enabledIntents.includes(intent.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{intent.name}</div>
                            <div className="text-sm text-white/50 mt-1">{intent.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personas Tab */}
              {promptTab === 'personas' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white/60">
                      Personas help tailor prompts to reflect the searcher's perspective.
                      <button className="ml-2 text-white/40 hover:text-white/60">
                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddPersona(true)}
                        className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
                      >
                        Add Persona
                      </button>
                      <button className="p-2 text-white/40 hover:text-white/60">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {showAddPersona && (
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4">
                      <h4 className="font-medium text-white">Add New Persona</h4>
                      <p className="text-sm text-white/50">This persona will guide prompt creation next and will be saved for future selection.</p>
                      
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Name</label>
                        <input
                          type="text"
                          value={newPersonaName}
                          onChange={(e) => setNewPersonaName(e.target.value)}
                          placeholder="Give this persona a clear, memorable name."
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Description</label>
                        <textarea
                          value={newPersonaDescription}
                          onChange={(e) => setNewPersonaDescription(e.target.value)}
                          placeholder="Describe your persona's perspective — who they are, what they care about, and how they might search."
                          className="input min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleAddPersona}
                          disabled={!newPersonaName.trim()}
                          className="px-4 py-2 bg-[#4a9d7c] text-white rounded-lg disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setShowAddPersona(false)
                            setNewPersonaName('')
                            setNewPersonaDescription('')
                          }}
                          className="px-4 py-2 text-[#4a9d7c] hover:text-[#5ab88f]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {personas.map(persona => (
                    <button
                      key={persona.id}
                      onClick={() => togglePersona(persona.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPersonas.includes(persona.id)
                          ? 'border-[#4a9d7c] bg-[#4a9d7c]/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPersonas.includes(persona.id) ? 'border-[#4a9d7c] bg-[#4a9d7c]' : 'border-white/30'
                        }`}>
                          {selectedPersonas.includes(persona.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-white">{persona.name}</div>
                          <div className="text-sm text-white/50 mt-1">{persona.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Prompt Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Review Prompts</h3>
                <p className="text-white/50 mt-2">Add or edit prompts for your topics.</p>
              </div>

              {generatingPrompts ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative mb-6">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3 text-center">
                    {PROMPT_LOADING_MESSAGES.map((msg, i) => (
                      <p
                        key={i}
                        className={`text-white/60 transition-opacity duration-500 ${
                          i === promptLoadingMessage ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-white/60">Topic:</span>
                      <select
                        value={selectedPromptTopic || ''}
                        onChange={(e) => setSelectedPromptTopic(e.target.value)}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="">All Topics</option>
                        {topics.filter(t => selectedTopics.includes(t.id)).map(topic => (
                          <option key={topic.id} value={topic.name}>{topic.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => setShowAddPrompt(true)}
                      className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
                    >
                      Add Prompt
                    </button>
                  </div>

                  {showAddPrompt && (
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4 mb-4">
                      <h4 className="font-medium text-white">Add Prompt</h4>
                      <p className="text-sm text-white/50">This prompt will be associated with the selected topic for all selected engines.</p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Prompt Type</label>
                          <select
                            value={newPromptType}
                            onChange={(e) => setNewPromptType(e.target.value)}
                            className="input"
                          >
                            <option value="branded">Branded</option>
                            <option value="unbranded">Unbranded</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Persona</label>
                          <select
                            value={newPromptPersona}
                            onChange={(e) => setNewPromptPersona(e.target.value)}
                            className="input"
                          >
                            <option value="">Select a persona</option>
                            {personas.filter(p => selectedPersonas.includes(p.id)).map(persona => (
                              <option key={persona.id} value={persona.id}>{persona.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Search Intent</label>
                          <select
                            value={newPromptIntent}
                            onChange={(e) => setNewPromptIntent(e.target.value)}
                            className="input"
                          >
                            <option value="">Select an intent</option>
                            {SEARCH_INTENTS.filter(i => enabledIntents.includes(i.id)).map(intent => (
                              <option key={intent.id} value={intent.id}>{intent.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-white/60 mb-2">Prompt Text</label>
                        <textarea
                          value={newPromptText}
                          onChange={(e) => setNewPromptText(e.target.value)}
                          placeholder="Add a new prompt"
                          className="input min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleAddPrompt}
                          disabled={!newPromptText.trim()}
                          className="px-4 py-2 bg-[#4a9d7c] text-white rounded-lg disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setShowAddPrompt(false)
                            setNewPromptText('')
                          }}
                          className="px-4 py-2 text-[#4a9d7c] hover:text-[#5ab88f]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Prompts Table */}
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 border-b border-white/10 grid grid-cols-12 gap-4 text-sm font-medium text-white/60">
                      <div className="col-span-1">
                        <input type="checkbox" className="rounded border-white/30" />
                      </div>
                      <div className="col-span-7 flex items-center gap-2">
                        Prompts ({generatedPrompts.filter(p => !selectedPromptTopic || p.topic === selectedPromptTopic).length})
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="col-span-3">Prompt Type</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {generatedPrompts
                        .filter(p => !selectedPromptTopic || p.topic === selectedPromptTopic)
                        .map(prompt => (
                          <div
                            key={prompt.id}
                            className="px-4 py-3 border-b border-white/5 last:border-b-0 grid grid-cols-12 gap-4 items-center hover:bg-white/5"
                          >
                            <div className="col-span-1">
                              <input type="checkbox" className="rounded border-white/30" />
                            </div>
                            <div className="col-span-7">
                              {editingPromptId === prompt.id ? (
                                <input
                                  type="text"
                                  defaultValue={prompt.text}
                                  onBlur={(e) => handleSavePromptEdit(prompt.id, e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleSavePromptEdit(prompt.id, e.target.value)}
                                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-white/80">{prompt.text}</span>
                              )}
                            </div>
                            <div className="col-span-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                prompt.type === 'branded' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {prompt.type === 'branded' ? 'Branded' : 'Unbranded'}
                              </span>
                            </div>
                            <div className="col-span-1 flex gap-2">
                              <button
                                onClick={() => setEditingPromptId(prompt.id)}
                                className="p-1 text-white/40 hover:text-white"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(prompt.id)}
                                className="p-1 text-white/40 hover:text-red-400"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 7: Final Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white/90">Final Review</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white">
                        Review Your Topic Selection
                        <button className="ml-2 text-white/40 hover:text-white/60">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </h4>
                      
                      {/* Engine dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
                          className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 flex items-center gap-2"
                        >
                          {selectedEngines.length} AI Search Engines
                          <svg className={`w-4 h-4 transition-transform ${engineDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {engineDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-72 bg-[#25252b] rounded-xl border border-white/10 shadow-xl z-50">
                            <div className="p-3 border-b border-white/10">
                              <input
                                type="text"
                                placeholder="Search"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40"
                              />
                            </div>
                            <div className="p-2">
                              <div className="flex justify-between text-xs text-white/50 px-3 py-2">
                                <span>{selectedEngines.length} selected</span>
                                <div className="flex gap-2">
                                  <button onClick={() => setSelectedEngines(Object.keys(AI_SEARCH_ENGINES))} className="text-[#4a9d7c] hover:underline">Select all</button>
                                  <span>|</span>
                                  <button onClick={() => setSelectedEngines([])} className="text-[#4a9d7c] hover:underline">Deselect all</button>
                                </div>
                              </div>
                              {Object.entries(AI_SEARCH_ENGINES).map(([id, engine]) => (
                                <button
                                  key={id}
                                  onClick={() => toggleEngine(id)}
                                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border ${selectedEngines.includes(id) ? 'bg-[#4a9d7c] border-[#4a9d7c]' : 'border-white/30'}`}>
                                      {selectedEngines.includes(id) && (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-white/80">{engine.name}</span>
                                  </div>
                                  <span className="text-white/50 text-sm">x {engine.credits}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-white/50 text-sm mb-4">
                      All topics will be tracked {trackingFrequency} in {LOCATIONS_LANGUAGES.find(l => l.id === selectedLocation)?.label || 'your location'}
                    </p>

                    {/* Selected Topics */}
                    <div className="space-y-2">
                      {topics.filter(t => selectedTopics.includes(t.id)).map(topic => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between p-3 bg-[#4a9d7c]/10 border border-[#4a9d7c]/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded border-2 border-[#4a9d7c] bg-[#4a9d7c] flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-white/80">{topic.name}</span>
                          </div>
                          <span className="text-white/50 text-sm">
                            {generatedPrompts.filter(p => p.topic === topic.name).length} Prompts
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CSV Management */}
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/60 text-sm mb-4">
                        Manage your topic prompts manually: download the file, edit, and re-upload your version
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={exportPromptsCSV}
                          className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <label className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 flex items-center gap-2 cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Upload
                          <input
                            type="file"
                            accept=".csv"
                            onChange={importPromptsCSV}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Forecast */}
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-white mb-4">Credit Usage Forecast</h4>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Available Credits:</span>
                      <span className="text-white font-medium">{availableCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        Current Weekly Rate:
                        <button className="ml-1 text-white/40 hover:text-white/60">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                      <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        Projected Weekly Rate:
                        <button className="ml-1 text-white/40 hover:text-white/60">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                      <span className="text-white font-medium">{projectedWeeklyRate}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Tracking Time Left:</span>
                        <span className="text-white font-medium">{trackingTimeLeft}</span>
                      </div>
                    </div>
                    <div className="text-white/40 text-xs mt-2">
                      Credit Reset Date: {creditResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            className="flex items-center gap-2 px-6 py-2.5 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {currentStep < 7 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                canProceed() && !loading
                  ? 'bg-[#4a9d7c] hover:bg-[#3d8268] text-white'
                  : 'bg-[#4a9d7c]/30 text-white/50 cursor-not-allowed'
              }`}
            >
              Next: {STEPS[currentStep]?.label}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleStartTracking}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#4a9d7c] hover:bg-[#3d8268] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Setting up...
                </>
              ) : (
                'Start Tracking'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
