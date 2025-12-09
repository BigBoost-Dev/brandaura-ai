// AI Platforms Configuration
export const AI_PLATFORMS = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'ChatGPT',
    model: 'openai/gpt-4o',
    color: '#10a37f',
    icon: '◈',
    company: 'OpenAI',
    description: 'Most popular consumer AI assistant'
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    model: 'openai/gpt-4o-mini',
    color: '#10a37f',
    icon: '◈',
    company: 'OpenAI',
    description: 'Fast and affordable GPT-4'
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude',
    model: 'anthropic/claude-sonnet-4',
    color: '#d97706',
    icon: '◆',
    company: 'Anthropic',
    description: 'Known for nuanced, helpful responses'
  },
  'gemini-flash': {
    id: 'gemini-flash',
    name: 'Gemini',
    model: 'google/gemini-2.0-flash-001',
    color: '#4285f4',
    icon: '◇',
    company: 'Google',
    description: "Google's flagship AI model"
  },
  'llama-3.1': {
    id: 'llama-3.1',
    name: 'Llama 3.1',
    model: 'meta-llama/llama-3.1-70b-instruct',
    color: '#7c3aed',
    icon: '◎',
    company: 'Meta',
    description: 'Leading open-source model'
  },
  'perplexity': {
    id: 'perplexity',
    name: 'Perplexity',
    model: 'perplexity/sonar-pro',
    color: '#22d3ee',
    icon: '◉',
    company: 'Perplexity AI',
    description: 'Search-augmented AI assistant'
  }
}

// AI Search Engines with Credit Costs (for wizard)
export const AI_SEARCH_ENGINES = {
  'chatgpt-auto': {
    id: 'chatgpt-auto',
    name: 'ChatGPT (Auto)',
    model: 'openai/gpt-4o',
    credits: 1,
    color: '#10a37f',
    icon: '◈',
    description: 'Automatic mode selection'
  },
  'chatgpt-search': {
    id: 'chatgpt-search',
    name: 'ChatGPT (Search)',
    model: 'openai/gpt-4o',
    credits: 2,
    color: '#10a37f',
    icon: '🔍',
    description: 'With web search enabled'
  },
  'gemini': {
    id: 'gemini',
    name: 'Gemini',
    model: 'google/gemini-2.0-flash-001',
    credits: 2,
    color: '#4285f4',
    icon: '◇',
    description: "Google's AI assistant"
  },
  'google-ai-mode': {
    id: 'google-ai-mode',
    name: 'Google AI Mode',
    model: 'google/gemini-2.0-flash-001',
    credits: 0.01,
    color: '#34a853',
    icon: '🔎',
    description: 'Google Search AI Overview'
  },
  'google-aio': {
    id: 'google-aio',
    name: 'Google AIO',
    model: 'google/gemini-2.0-flash-001',
    credits: 0.01,
    color: '#34a853',
    icon: '✨',
    description: 'AI-powered search results'
  },
  'perplexity': {
    id: 'perplexity',
    name: 'Perplexity',
    model: 'perplexity/sonar-pro',
    credits: 0.2,
    color: '#22d3ee',
    icon: '◉',
    description: 'Real-time search AI'
  },
  'claude': {
    id: 'claude',
    name: 'Claude',
    model: 'anthropic/claude-sonnet-4',
    credits: 1.5,
    color: '#d97706',
    icon: '◆',
    description: 'Anthropic Claude'
  }
}

// Locations and Languages
export const LOCATIONS_LANGUAGES = [
  { id: 'us-en', country: 'United States', language: 'English', label: 'United States (English)', flag: '🇺🇸' },
  { id: 'uk-en', country: 'United Kingdom', language: 'English', label: 'United Kingdom (English)', flag: '🇬🇧' },
  { id: 'ca-en', country: 'Canada', language: 'English', label: 'Canada (English)', flag: '🇨🇦' },
  { id: 'ca-fr', country: 'Canada', language: 'French', label: 'Canada (French)', flag: '🇨🇦' },
  { id: 'au-en', country: 'Australia', language: 'English', label: 'Australia (English)', flag: '🇦🇺' },
  { id: 'in-en', country: 'India', language: 'English', label: 'India (English)', flag: '🇮🇳' },
  { id: 'in-hi', country: 'India', language: 'Hindi', label: 'India (Hindi)', flag: '🇮🇳' },
  { id: 'in-ta', country: 'India', language: 'Tamil', label: 'India (Tamil)', flag: '🇮🇳' },
  { id: 'in-te', country: 'India', language: 'Telugu', label: 'India (Telugu)', flag: '🇮🇳' },
  { id: 'in-kn', country: 'India', language: 'Kannada', label: 'India (Kannada)', flag: '🇮🇳' },
  { id: 'in-ml', country: 'India', language: 'Malayalam', label: 'India (Malayalam)', flag: '🇮🇳' },
  { id: 'in-mr', country: 'India', language: 'Marathi', label: 'India (Marathi)', flag: '🇮🇳' },
  { id: 'de-de', country: 'Germany', language: 'German', label: 'Germany (German)', flag: '🇩🇪' },
  { id: 'fr-fr', country: 'France', language: 'French', label: 'France (French)', flag: '🇫🇷' },
  { id: 'es-es', country: 'Spain', language: 'Spanish', label: 'Spain (Spanish)', flag: '🇪🇸' },
  { id: 'mx-es', country: 'Mexico', language: 'Spanish', label: 'Mexico (Spanish)', flag: '🇲🇽' },
  { id: 'br-pt', country: 'Brazil', language: 'Portuguese', label: 'Brazil (Portuguese)', flag: '🇧🇷' },
  { id: 'jp-ja', country: 'Japan', language: 'Japanese', label: 'Japan (Japanese)', flag: '🇯🇵' },
  { id: 'kr-ko', country: 'South Korea', language: 'Korean', label: 'South Korea (Korean)', flag: '🇰🇷' },
  { id: 'cn-zh', country: 'China', language: 'Chinese', label: 'China (Chinese)', flag: '🇨🇳' },
  { id: 'sg-en', country: 'Singapore', language: 'English', label: 'Singapore (English)', flag: '🇸🇬' },
  { id: 'ae-en', country: 'UAE', language: 'English', label: 'UAE (English)', flag: '🇦🇪' },
  { id: 'ae-ar', country: 'UAE', language: 'Arabic', label: 'UAE (Arabic)', flag: '🇦🇪' },
  { id: 'nl-nl', country: 'Netherlands', language: 'Dutch', label: 'Netherlands (Dutch)', flag: '🇳🇱' },
  { id: 'it-it', country: 'Italy', language: 'Italian', label: 'Italy (Italian)', flag: '🇮🇹' },
  { id: 'se-sv', country: 'Sweden', language: 'Swedish', label: 'Sweden (Swedish)', flag: '🇸🇪' },
  { id: 'global-en', country: 'Global', language: 'English', label: 'Global (English)', flag: '🌍' }
]

// Search Intents
export const SEARCH_INTENTS = [
  {
    id: 'education',
    name: 'Education',
    description: 'Aiming to provide explanations, definitions, or learning content.',
    icon: '📚',
    enabled: true
  },
  {
    id: 'recommendations',
    name: 'Recommendations',
    description: 'Suggest options tailored to the searcher\'s needs or preferences.',
    icon: '💡',
    enabled: true
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Side-by-side analyses or contrasts between products, services, or options.',
    icon: '⚖️',
    enabled: true
  },
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Highlighting cost details or pricing information.',
    icon: '💰',
    enabled: true
  },
  {
    id: 'navigation',
    name: 'Brand/Service Navigation',
    description: 'Reflects a searcher\'s goal of exploring or learning about a specific brand or service.',
    icon: '🧭',
    enabled: true
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Guiding toward buying or transactional steps.',
    icon: '🛒',
    enabled: true
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Providing help, troubleshooting, or guidance on using a product or service.',
    icon: '🛠️',
    enabled: true
  },
  {
    id: 'reviews',
    name: 'Reviews & Reputation',
    description: 'Understanding what others think about a brand or product.',
    icon: '⭐',
    enabled: true
  }
]

// Prompt Types
export const PROMPT_TYPES = [
  {
    id: 'branded',
    name: 'Branded Prompts',
    description: 'Prompts that include your brand or products, helping AI generate responses that highlight your offerings and identity.',
    icon: '🏷️',
    enabled: true
  },
  {
    id: 'unbranded',
    name: 'Non-Branded Prompts',
    description: 'Prompts that focus on general topics without mentioning your brand, enabling AI to provide neutral, objective responses.',
    icon: '📝',
    enabled: true
  }
]

// Default Personas
export const DEFAULT_PERSONAS = [
  {
    id: 'broad-audience',
    name: 'Broad Audience',
    description: 'This persona reflects broadly representative searchers. It gives a general sense of how these users might phrase questions with different goals (search intents) in mind.',
    icon: '👥',
    isDefault: true
  }
]

// Tracking Frequencies
export const TRACKING_FREQUENCIES = [
  { id: 'daily', label: 'Daily', description: 'Track every day', multiplier: 7 },
  { id: 'weekly', label: 'Weekly', description: 'Track once per week', multiplier: 1 },
  { id: 'biweekly', label: 'Bi-weekly', description: 'Track every two weeks', multiplier: 0.5 },
  { id: 'monthly', label: 'Monthly', description: 'Track once per month', multiplier: 0.25 }
]

// Mention Types and Scoring
export const MENTION_TYPES = {
  leader: {
    id: 'leader',
    label: 'Top Pick',
    color: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.15)',
    score: 100,
    emoji: '🏆',
    description: 'Recommended as the best or top choice'
  },
  recommended: {
    id: 'recommended',
    label: 'Recommended',
    color: '#22d3ee',
    bgColor: 'rgba(34, 211, 238, 0.15)',
    score: 75,
    emoji: '✅',
    description: 'Explicitly recommended as a good option'
  },
  mentioned: {
    id: 'mentioned',
    label: 'Mentioned',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.15)',
    score: 50,
    emoji: '📝',
    description: 'Mentioned without specific recommendation'
  },
  alternative: {
    id: 'alternative',
    label: 'Alternative',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
    score: 30,
    emoji: '🔄',
    description: 'Listed as an alternative option'
  },
  notMentioned: {
    id: 'notMentioned',
    label: 'Not Found',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    score: 0,
    emoji: '👻',
    description: 'Brand was not mentioned in the response'
  },
  negative: {
    id: 'negative',
    label: 'Negative',
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.15)',
    score: -20,
    emoji: '⚠️',
    description: 'Mentioned with negative sentiment'
  }
}

// Query Templates by Funnel Stage
export const QUERY_TEMPLATES = [
  { type: 'awareness', template: 'What are the best {category} tools in 2025?', intent: 'discovery' },
  { type: 'awareness', template: 'Top {category} software for businesses', intent: 'discovery' },
  { type: 'awareness', template: 'Most popular {category} solutions right now', intent: 'discovery' },
  { type: 'awareness', template: '{category} tools I should know about', intent: 'discovery' },
  { type: 'consideration', template: 'Compare {brand} vs {competitor}', intent: 'comparison' },
  { type: 'consideration', template: '{brand} alternatives worth considering', intent: 'alternatives' },
  { type: 'consideration', template: 'Is {brand} better than {competitor}?', intent: 'comparison' },
  { type: 'consideration', template: 'What are the pros and cons of {brand}?', intent: 'evaluation' },
  { type: 'consideration', template: '{brand} vs {competitor} for {useCase}', intent: 'comparison' },
  { type: 'decision', template: '{brand} pricing and plans', intent: 'purchase' },
  { type: 'decision', template: 'Should I buy {brand}?', intent: 'purchase' },
  { type: 'decision', template: 'Is {brand} worth it for {useCase}?', intent: 'purchase' },
  { type: 'decision', template: '{brand} enterprise features', intent: 'purchase' },
  { type: 'reputation', template: 'What do people think about {brand}?', intent: 'reputation' },
  { type: 'reputation', template: 'Is {brand} trustworthy?', intent: 'trust' },
  { type: 'reputation', template: '{brand} reviews and reputation', intent: 'reputation' },
  { type: 'reputation', template: 'Problems with {brand}', intent: 'concerns' }
]

// Industry Benchmarks
export const INDUSTRY_BENCHMARKS = {
  'SaaS': { avgVisibility: 45, topPerformer: 78, medianMentions: 52 },
  'E-commerce': { avgVisibility: 38, topPerformer: 72, medianMentions: 45 },
  'FinTech': { avgVisibility: 42, topPerformer: 75, medianMentions: 48 },
  'HealthTech': { avgVisibility: 35, topPerformer: 68, medianMentions: 40 },
  'EdTech': { avgVisibility: 40, topPerformer: 70, medianMentions: 46 },
  'MarTech': { avgVisibility: 48, topPerformer: 82, medianMentions: 55 },
  'DevTools': { avgVisibility: 52, topPerformer: 85, medianMentions: 58 },
  'Productivity': { avgVisibility: 44, topPerformer: 76, medianMentions: 50 },
  'Security': { avgVisibility: 39, topPerformer: 71, medianMentions: 44 },
  'Analytics': { avgVisibility: 46, topPerformer: 79, medianMentions: 52 },
  'Digital Marketing': { avgVisibility: 47, topPerformer: 80, medianMentions: 53 },
  'Agency': { avgVisibility: 43, topPerformer: 74, medianMentions: 49 },
  'Consulting': { avgVisibility: 41, topPerformer: 73, medianMentions: 47 },
  'Healthcare': { avgVisibility: 36, topPerformer: 69, medianMentions: 42 },
  'Real Estate': { avgVisibility: 37, topPerformer: 70, medianMentions: 43 },
  'Legal': { avgVisibility: 34, topPerformer: 67, medianMentions: 39 },
  'Finance': { avgVisibility: 44, topPerformer: 77, medianMentions: 51 },
  'Retail': { avgVisibility: 40, topPerformer: 72, medianMentions: 46 },
  'Manufacturing': { avgVisibility: 33, topPerformer: 65, medianMentions: 38 },
  'Other': { avgVisibility: 40, topPerformer: 70, medianMentions: 45 }
}

// Pricing Plans
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 200,
    brands: 1,
    platforms: 3,
    features: [
      'Basic analytics',
      'Manual tests only',
      'Email support',
      '7-day data retention'
    ],
    popular: false
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 1000,
    brands: 3,
    platforms: 6,
    features: [
      'Advanced analytics',
      'Scheduled tests',
      'Email alerts',
      'Export reports',
      '30-day data retention',
      'Competitor tracking'
    ],
    popular: false
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 79,
    credits: 5000,
    brands: 10,
    platforms: 7,
    features: [
      'Everything in Starter',
      'API access',
      'Team members (up to 5)',
      'Priority support',
      'Custom integrations',
      '90-day data retention',
      'Industry benchmarks'
    ],
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    credits: 'Unlimited',
    brands: 'Unlimited',
    platforms: 7,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Dedicated support',
      'SLA guarantee',
      'Custom features',
      'On-premise option',
      'Unlimited data retention'
    ],
    popular: false
  }
}

// Funnel Stages
export const FUNNEL_STAGES = [
  { key: 'awareness', label: 'Awareness', color: '#22d3ee', emoji: '👀', description: 'Discovery & learning phase' },
  { key: 'consideration', label: 'Consideration', color: '#818cf8', emoji: '🤔', description: 'Comparing options' },
  { key: 'decision', label: 'Decision', color: '#4ade80', emoji: '✅', description: 'Ready to purchase' },
  { key: 'reputation', label: 'Reputation', color: '#fbbf24', emoji: '⭐', description: 'Trust & validation' }
]

// Schedule Frequencies
export const SCHEDULE_FREQUENCIES = [
  { id: 'hourly', label: 'Hourly', description: 'Every hour' },
  { id: 'daily', label: 'Daily', description: 'Once per day' },
  { id: 'weekly', label: 'Weekly', description: 'Once per week' },
  { id: 'monthly', label: 'Monthly', description: 'Once per month' }
]

// Days of Week
export const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon', full: 'Monday' },
  { id: 'tue', label: 'Tue', full: 'Tuesday' },
  { id: 'wed', label: 'Wed', full: 'Wednesday' },
  { id: 'thu', label: 'Thu', full: 'Thursday' },
  { id: 'fri', label: 'Fri', full: 'Friday' },
  { id: 'sat', label: 'Sat', full: 'Saturday' },
  { id: 'sun', label: 'Sun', full: 'Sunday' }
]

// Loading Messages for AI Generation
export const TOPIC_LOADING_MESSAGES = [
  'Generating topics based on your website content...',
  'Identifying related concepts and themes for broader context...',
  'Highlighting recurring patterns most relevant to your brand...'
]

export const PROMPT_LOADING_MESSAGES = [
  'Mapping how their goals and intents relate to topics...',
  'Uncovering how your personas express their needs...',
  'Delivering the search prompts your personas are likely to use...'
]
