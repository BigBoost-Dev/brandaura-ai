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
  // Awareness Stage
  { type: 'awareness', template: 'What are the best {category} tools in 2025?', intent: 'discovery' },
  { type: 'awareness', template: 'Top {category} software for businesses', intent: 'discovery' },
  { type: 'awareness', template: 'Most popular {category} solutions right now', intent: 'discovery' },
  { type: 'awareness', template: '{category} tools I should know about', intent: 'discovery' },
  
  // Consideration Stage  
  { type: 'consideration', template: 'Compare {brand} vs {competitor}', intent: 'comparison' },
  { type: 'consideration', template: '{brand} alternatives worth considering', intent: 'alternatives' },
  { type: 'consideration', template: 'Is {brand} better than {competitor}?', intent: 'comparison' },
  { type: 'consideration', template: 'What are the pros and cons of {brand}?', intent: 'evaluation' },
  { type: 'consideration', template: '{brand} vs {competitor} for {useCase}', intent: 'comparison' },
  
  // Decision Stage
  { type: 'decision', template: '{brand} pricing and plans', intent: 'purchase' },
  { type: 'decision', template: 'Should I buy {brand}?', intent: 'purchase' },
  { type: 'decision', template: 'Is {brand} worth it for {useCase}?', intent: 'purchase' },
  { type: 'decision', template: '{brand} enterprise features', intent: 'purchase' },
  
  // Reputation Stage
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
  'Analytics': { avgVisibility: 46, topPerformer: 79, medianMentions: 52 }
}

// Pricing Plans
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    tests: 100,
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
    tests: 1000,
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
    tests: 5000,
    brands: 10,
    platforms: 6,
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
    tests: 'Unlimited',
    brands: 'Unlimited',
    platforms: 6,
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
