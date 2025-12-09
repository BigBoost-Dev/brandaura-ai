/**
 * Advanced Analysis Utilities for BrandAura AI
 * - Source Attribution
 * - Content Scoring
 * - Optimization Recommendations
 */

/**
 * Extract and analyze sources from AI responses
 * Identifies where AI got its information from
 */
export function extractSources(response) {
  const sources = []
  
  // Pattern 1: Explicit URLs
  const urlPattern = /https?:\/\/[^\s\)\"\>\]\,]+/g
  const urls = response.match(urlPattern) || []
  urls.forEach(url => {
    const domain = extractDomain(url)
    sources.push({
      type: 'url',
      url: url.replace(/[\.\,\)\]\>]+$/, ''), // Clean trailing punctuation
      domain,
      confidence: 0.95,
      category: categorizeDomain(domain)
    })
  })
  
  // Pattern 2: "According to [Source]" patterns
  const accordingPatterns = [
    /according to (?:the )?([A-Z][a-zA-Z\s]+?)(?:,|\.|'s|'s|\band\b)/gi,
    /(?:as reported by|as stated by|per) (?:the )?([A-Z][a-zA-Z\s]+?)(?:,|\.|'s)/gi,
    /(?:source:|sources?:)\s*([A-Z][a-zA-Z\s,&]+?)(?:\.|$)/gi
  ]
  
  accordingPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(response)) !== null) {
      const sourceName = match[1].trim()
      if (sourceName.length > 2 && sourceName.length < 50 && !isCommonWord(sourceName)) {
        sources.push({
          type: 'citation',
          name: sourceName,
          confidence: 0.8,
          category: categorizeSource(sourceName)
        })
      }
    }
  })
  
  // Pattern 3: Bracketed references [1], [Source Name]
  const bracketPattern = /\[([^\]]+)\]/g
  let bracketMatch
  while ((bracketMatch = bracketPattern.exec(response)) !== null) {
    const ref = bracketMatch[1].trim()
    if (ref.length > 1 && !/^\d+$/.test(ref)) { // Skip just numbers
      sources.push({
        type: 'reference',
        name: ref,
        confidence: 0.7,
        category: 'unknown'
      })
    }
  }
  
  // Pattern 4: Known review/comparison sites mentioned
  const knownSources = [
    { pattern: /\bG2\b/i, name: 'G2', category: 'review_site' },
    { pattern: /\bCapterra\b/i, name: 'Capterra', category: 'review_site' },
    { pattern: /\bTrustpilot\b/i, name: 'Trustpilot', category: 'review_site' },
    { pattern: /\bYelp\b/i, name: 'Yelp', category: 'review_site' },
    { pattern: /\bReddit\b/i, name: 'Reddit', category: 'forum' },
    { pattern: /\bQuora\b/i, name: 'Quora', category: 'forum' },
    { pattern: /\bForbes\b/i, name: 'Forbes', category: 'publication' },
    { pattern: /\bTechCrunch\b/i, name: 'TechCrunch', category: 'publication' },
    { pattern: /\bWired\b/i, name: 'Wired', category: 'publication' },
    { pattern: /\bThe Verge\b/i, name: 'The Verge', category: 'publication' },
    { pattern: /\bCNET\b/i, name: 'CNET', category: 'publication' },
    { pattern: /\bPCMag\b/i, name: 'PCMag', category: 'publication' },
    { pattern: /\bWirecutter\b/i, name: 'Wirecutter', category: 'publication' },
    { pattern: /\bConsumer Reports\b/i, name: 'Consumer Reports', category: 'publication' },
    { pattern: /\bGartner\b/i, name: 'Gartner', category: 'analyst' },
    { pattern: /\bForrester\b/i, name: 'Forrester', category: 'analyst' },
    { pattern: /\bWikipedia\b/i, name: 'Wikipedia', category: 'encyclopedia' },
    { pattern: /\bLinkedIn\b/i, name: 'LinkedIn', category: 'social' },
    { pattern: /\bTwitter\b|\bX\.com\b/i, name: 'Twitter/X', category: 'social' },
    { pattern: /\bYouTube\b/i, name: 'YouTube', category: 'video' }
  ]
  
  knownSources.forEach(({ pattern, name, category }) => {
    if (pattern.test(response)) {
      // Check if not already in sources
      if (!sources.find(s => s.name === name || s.domain?.includes(name.toLowerCase()))) {
        sources.push({
          type: 'known_source',
          name,
          confidence: 0.85,
          category
        })
      }
    }
  })
  
  // Deduplicate by domain/name
  const seen = new Set()
  return sources.filter(s => {
    const key = s.url || s.name || s.domain
    if (seen.has(key.toLowerCase())) return false
    seen.add(key.toLowerCase())
    return true
  })
}

/**
 * Score content for AI discoverability
 * Returns 0-100 score with breakdown
 */
export function scoreContent(content, brandName, keywords = []) {
  const scores = {
    clarity: 0,
    structure: 0,
    authority: 0,
    relevance: 0,
    freshness: 0,
    citations: 0
  }
  
  const text = typeof content === 'string' ? content : ''
  const lowerText = text.toLowerCase()
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  
  // 1. Clarity Score (20 points)
  // - Sentence length
  // - Readability
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0
  
  if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
    scores.clarity = 20
  } else if (avgSentenceLength >= 8 && avgSentenceLength <= 25) {
    scores.clarity = 15
  } else {
    scores.clarity = 10
  }
  
  // 2. Structure Score (20 points)
  // - Headers, lists, sections
  const hasHeaders = /<h[1-6]|^#{1,6}\s|^\*\*[^*]+\*\*$/m.test(text)
  const hasList = /<[uo]l>|^[\-\*]\s|^\d+\.\s/m.test(text)
  const hasParagraphs = text.split(/\n\n+/).length >= 3
  
  if (hasHeaders) scores.structure += 8
  if (hasList) scores.structure += 6
  if (hasParagraphs) scores.structure += 6
  
  // 3. Authority Score (20 points)
  // - Statistics, data points
  // - Expert quotes
  // - Citations
  const hasNumbers = /\d+%|\d+\s*(million|billion|thousand|users|customers)/i.test(text)
  const hasQuotes = /"[^"]{20,}"|'[^']{20,}'/.test(text)
  const hasCitations = /\[\d+\]|\(source|\(via\s/i.test(text)
  const hasExpertTerms = /according to|research shows|studies indicate|experts say/i.test(text)
  
  if (hasNumbers) scores.authority += 6
  if (hasQuotes) scores.authority += 5
  if (hasCitations) scores.authority += 5
  if (hasExpertTerms) scores.authority += 4
  
  // 4. Relevance Score (20 points)
  // - Brand mentions
  // - Keyword density
  const brandMentions = (lowerText.match(new RegExp(brandName.toLowerCase(), 'g')) || []).length
  const keywordMatches = keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length
  
  if (brandMentions >= 3) scores.relevance += 10
  else if (brandMentions >= 1) scores.relevance += 5
  
  if (keywords.length > 0) {
    const keywordRatio = keywordMatches / keywords.length
    scores.relevance += Math.round(keywordRatio * 10)
  } else {
    scores.relevance += 5 // Default if no keywords provided
  }
  
  // 5. Freshness indicators (10 points)
  const currentYear = new Date().getFullYear()
  const hasCurrentYear = text.includes(currentYear.toString())
  const hasRecentYear = text.includes((currentYear - 1).toString())
  const hasDates = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i.test(text)
  
  if (hasCurrentYear) scores.freshness = 10
  else if (hasRecentYear || hasDates) scores.freshness = 6
  else scores.freshness = 2
  
  // 6. Citations/Sources (10 points)
  const urlCount = (text.match(/https?:\/\//g) || []).length
  const sourceReferences = (text.match(/\bsource|\bcitation|\breference|\bvia\b/gi) || []).length
  
  scores.citations = Math.min(10, urlCount * 2 + sourceReferences * 2)
  
  // Calculate total
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  
  // Generate recommendations
  const recommendations = []
  
  if (scores.clarity < 15) {
    recommendations.push({
      category: 'clarity',
      priority: 'high',
      suggestion: 'Simplify sentences. Aim for 15-20 words per sentence for better AI comprehension.'
    })
  }
  
  if (scores.structure < 15) {
    recommendations.push({
      category: 'structure',
      priority: 'high',
      suggestion: 'Add clear headers (H2, H3), bullet points, and break content into digestible sections.'
    })
  }
  
  if (scores.authority < 12) {
    recommendations.push({
      category: 'authority',
      priority: 'medium',
      suggestion: 'Include statistics, expert quotes, and citations to establish credibility.'
    })
  }
  
  if (scores.relevance < 12) {
    recommendations.push({
      category: 'relevance',
      priority: 'high',
      suggestion: `Mention "${brandName}" more naturally throughout the content. Include target keywords.`
    })
  }
  
  if (scores.freshness < 6) {
    recommendations.push({
      category: 'freshness',
      priority: 'medium',
      suggestion: 'Add current year references and recent dates to signal content freshness.'
    })
  }
  
  if (scores.citations < 5) {
    recommendations.push({
      category: 'citations',
      priority: 'low',
      suggestion: 'Add source links and references to boost credibility for AI systems.'
    })
  }
  
  return {
    total,
    grade: total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : total >= 20 ? 'D' : 'F',
    scores,
    recommendations,
    wordCount,
    sentenceCount: sentences.length
  }
}

/**
 * Generate optimization recommendations based on tracking results
 */
export function generateRecommendations(results, brand, competitors = []) {
  const recommendations = []
  
  if (!results || results.length === 0) {
    return [{
      id: 'no-data',
      priority: 'critical',
      category: 'tracking',
      title: 'Start Tracking',
      description: 'Run your first tracking session to get personalized recommendations.',
      action: 'Run Tracking',
      impact: 'high'
    }]
  }
  
  // Analyze patterns
  const totalQueries = results.length
  const mentioned = results.filter(r => r.brand_mention !== 'notMentioned')
  const notMentioned = results.filter(r => r.brand_mention === 'notMentioned')
  const mentionRate = (mentioned.length / totalQueries) * 100
  
  // 1. Low mention rate
  if (mentionRate < 30) {
    recommendations.push({
      id: 'low-visibility',
      priority: 'critical',
      category: 'visibility',
      title: 'Critical: Low AI Visibility',
      description: `Your brand is only mentioned in ${mentionRate.toFixed(0)}% of AI responses. This is significantly below industry average (50%+).`,
      action: 'Review content strategy',
      impact: 'high',
      details: [
        'AI models may not have enough quality content about your brand',
        'Focus on creating content on high-authority sites',
        'Ensure your website has clear, crawlable information'
      ]
    })
  }
  
  // 2. Competitor outperforming
  const competitorMentionCounts = {}
  competitors.forEach(comp => {
    const compName = comp.name || comp
    competitorMentionCounts[compName] = results.filter(r => {
      const mentions = r.competitor_mentions || {}
      return mentions[compName] && mentions[compName] !== 'notMentioned'
    }).length
  })
  
  const topCompetitor = Object.entries(competitorMentionCounts)
    .sort((a, b) => b[1] - a[1])[0]
  
  if (topCompetitor && topCompetitor[1] > mentioned.length) {
    recommendations.push({
      id: 'competitor-winning',
      priority: 'high',
      category: 'competitive',
      title: `${topCompetitor[0]} Outranking You`,
      description: `${topCompetitor[0]} is mentioned ${topCompetitor[1]} times vs your ${mentioned.length} mentions.`,
      action: 'Analyze competitor content',
      impact: 'high',
      details: [
        `Research what content ${topCompetitor[0]} has that you don\'t`,
        'Check review sites for their presence',
        'Look for comparison articles featuring them'
      ]
    })
  }
  
  // 3. Source gap analysis
  const allSources = []
  results.forEach(r => {
    if (r.full_response) {
      const sources = extractSources(r.full_response)
      allSources.push(...sources)
    }
  })
  
  // Count source categories
  const sourceCategoryCounts = {}
  allSources.forEach(s => {
    sourceCategoryCounts[s.category] = (sourceCategoryCounts[s.category] || 0) + 1
  })
  
  // Find missing high-value sources
  const highValueCategories = ['review_site', 'publication', 'analyst']
  highValueCategories.forEach(cat => {
    if (!sourceCategoryCounts[cat] || sourceCategoryCounts[cat] < 3) {
      recommendations.push({
        id: `missing-${cat}`,
        priority: 'medium',
        category: 'content',
        title: `Increase ${formatCategory(cat)} Presence`,
        description: `AI responses rarely cite ${formatCategory(cat)}s when discussing your brand.`,
        action: `Get listed on ${formatCategory(cat)}s`,
        impact: 'medium',
        details: getSourceActionItems(cat)
      })
    }
  })
  
  // 4. Sentiment issues
  const negativeResults = results.filter(r => r.sentiment === 'negative' || r.brand_mention === 'negative')
  if (negativeResults.length > 0) {
    recommendations.push({
      id: 'negative-sentiment',
      priority: 'high',
      category: 'reputation',
      title: 'Negative Mentions Detected',
      description: `${negativeResults.length} responses contain negative sentiment about your brand.`,
      action: 'Address reputation issues',
      impact: 'high',
      details: [
        'Review the specific negative responses',
        'Identify source of negative information',
        'Create content addressing concerns',
        'Respond to negative reviews professionally'
      ]
    })
  }
  
  // 5. Topic gaps
  const topicPerformance = {}
  results.forEach(r => {
    const topic = r.topic_name || 'General'
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { total: 0, mentioned: 0 }
    }
    topicPerformance[topic].total++
    if (r.brand_mention !== 'notMentioned') {
      topicPerformance[topic].mentioned++
    }
  })
  
  Object.entries(topicPerformance).forEach(([topic, data]) => {
    const rate = (data.mentioned / data.total) * 100
    if (rate < 20 && data.total >= 3) {
      recommendations.push({
        id: `topic-gap-${topic}`,
        priority: 'medium',
        category: 'content',
        title: `Weak Performance: "${topic}"`,
        description: `Only ${rate.toFixed(0)}% mention rate for "${topic}" queries.`,
        action: 'Create targeted content',
        impact: 'medium',
        details: [
          `Create a dedicated page/article about ${topic}`,
          'Include your brand naturally in the content',
          'Add FAQs addressing common questions'
        ]
      })
    }
  })
  
  // 6. Engine-specific issues
  const enginePerformance = {}
  results.forEach(r => {
    const engine = r.platform_name || r.platform_id || 'Unknown'
    if (!enginePerformance[engine]) {
      enginePerformance[engine] = { total: 0, mentioned: 0 }
    }
    enginePerformance[engine].total++
    if (r.brand_mention !== 'notMentioned') {
      enginePerformance[engine].mentioned++
    }
  })
  
  Object.entries(enginePerformance).forEach(([engine, data]) => {
    const rate = (data.mentioned / data.total) * 100
    if (rate < 20 && data.total >= 3) {
      recommendations.push({
        id: `engine-gap-${engine}`,
        priority: 'low',
        category: 'technical',
        title: `Low Visibility on ${engine}`,
        description: `${engine} mentions your brand in only ${rate.toFixed(0)}% of responses.`,
        action: 'Optimize for this engine',
        impact: 'low',
        details: getEngineOptimizationTips(engine)
      })
    }
  })
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return recommendations.slice(0, 10) // Top 10 recommendations
}

/**
 * Calculate ROI metrics from results + analytics data
 */
export function calculateROI(results, analyticsData = null) {
  const metrics = {
    mentions: {
      total: 0,
      leader: 0,
      recommended: 0,
      mentioned: 0,
      notMentioned: 0
    },
    estimatedReach: 0,
    estimatedClicks: 0,
    estimatedValue: 0,
    conversionPotential: 0
  }
  
  if (!results || results.length === 0) return metrics
  
  // Count mentions by type
  results.forEach(r => {
    metrics.mentions.total++
    const mention = r.brand_mention || 'notMentioned'
    if (metrics.mentions[mention] !== undefined) {
      metrics.mentions[mention]++
    }
  })
  
  // Estimate reach based on AI platform usage stats (rough estimates)
  // These are industry estimates for monthly active users
  const platformReach = {
    'chatgpt-auto': 200000000,
    'chatgpt-search': 200000000,
    'perplexity': 15000000,
    'gemini': 100000000,
    'claude': 10000000,
    'google-ai-mode': 500000000,
    'google-aio': 500000000
  }
  
  // Estimate clicks based on mention position
  // Leader position ~15% CTR, Recommended ~8%, Mentioned ~3%
  const ctrByMention = {
    leader: 0.15,
    recommended: 0.08,
    mentioned: 0.03,
    alternative: 0.02,
    negative: 0.01,
    notMentioned: 0
  }
  
  // Estimate query volume (conservative: 0.001% of platform users ask relevant queries)
  const queryVolumeRate = 0.00001
  
  let totalEstimatedQueries = 0
  let totalEstimatedClicks = 0
  
  results.forEach(r => {
    const platform = r.platform_id || 'chatgpt-auto'
    const reach = platformReach[platform] || 50000000
    const estimatedQueries = reach * queryVolumeRate
    
    const mention = r.brand_mention || 'notMentioned'
    const ctr = ctrByMention[mention] || 0
    
    totalEstimatedQueries += estimatedQueries
    totalEstimatedClicks += estimatedQueries * ctr
  })
  
  metrics.estimatedReach = Math.round(totalEstimatedQueries)
  metrics.estimatedClicks = Math.round(totalEstimatedClicks)
  
  // Estimate value (assuming $5 per click average value)
  const valuePerClick = 5
  metrics.estimatedValue = Math.round(totalEstimatedClicks * valuePerClick)
  
  // Conversion potential (assuming 2% conversion rate)
  metrics.conversionPotential = Math.round(totalEstimatedClicks * 0.02)
  
  // If we have real analytics data, use it
  if (analyticsData) {
    if (analyticsData.aiReferralTraffic) {
      metrics.actualClicks = analyticsData.aiReferralTraffic
    }
    if (analyticsData.aiConversions) {
      metrics.actualConversions = analyticsData.aiConversions
    }
    if (analyticsData.aiRevenue) {
      metrics.actualRevenue = analyticsData.aiRevenue
    }
  }
  
  return metrics
}

// Helper functions
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace('www.', '')
  } catch {
    return url
  }
}

function categorizeDomain(domain) {
  const categories = {
    review_site: ['g2.com', 'capterra.com', 'trustpilot.com', 'yelp.com', 'trustradius.com'],
    forum: ['reddit.com', 'quora.com', 'stackexchange.com', 'stackoverflow.com'],
    publication: ['forbes.com', 'techcrunch.com', 'wired.com', 'theverge.com', 'cnet.com', 'pcmag.com', 'nytimes.com', 'wsj.com'],
    social: ['linkedin.com', 'twitter.com', 'x.com', 'facebook.com'],
    video: ['youtube.com', 'vimeo.com'],
    analyst: ['gartner.com', 'forrester.com', 'idc.com'],
    encyclopedia: ['wikipedia.org', 'britannica.com']
  }
  
  for (const [category, domains] of Object.entries(categories)) {
    if (domains.some(d => domain.includes(d))) {
      return category
    }
  }
  return 'other'
}

function categorizeSource(name) {
  const lowerName = name.toLowerCase()
  if (/research|study|report|survey/i.test(lowerName)) return 'research'
  if (/review|rating/i.test(lowerName)) return 'review_site'
  if (/news|times|post|journal/i.test(lowerName)) return 'publication'
  return 'unknown'
}

function isCommonWord(word) {
  const common = ['the', 'and', 'for', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'their', 'said', 'each', 'which', 'other', 'also', 'some', 'most', 'many', 'these', 'those']
  return common.includes(word.toLowerCase())
}

function formatCategory(category) {
  const formats = {
    review_site: 'Review Site',
    publication: 'Publication',
    analyst: 'Industry Analyst',
    forum: 'Forum',
    social: 'Social Media',
    video: 'Video Platform'
  }
  return formats[category] || category
}

function getSourceActionItems(category) {
  const actions = {
    review_site: [
      'Create profiles on G2, Capterra, and TrustRadius',
      'Encourage satisfied customers to leave reviews',
      'Respond to existing reviews professionally',
      'Keep product information up to date'
    ],
    publication: [
      'Pitch stories to relevant tech publications',
      'Write guest posts on industry blogs',
      'Create newsworthy announcements',
      'Build relationships with journalists'
    ],
    analyst: [
      'Submit for Gartner/Forrester evaluations',
      'Participate in industry benchmark studies',
      'Share data for research reports',
      'Attend analyst briefings'
    ]
  }
  return actions[category] || ['Increase presence in this category']
}

function getEngineOptimizationTips(engine) {
  const tips = {
    'ChatGPT': [
      'ChatGPT relies heavily on web content quality',
      'Ensure your site is crawlable and well-structured',
      'Create comprehensive FAQ pages',
      'Build presence on Reddit and forums'
    ],
    'Perplexity': [
      'Perplexity uses real-time web search',
      'Keep content fresh and updated',
      'Use clear, factual statements',
      'Ensure good SEO fundamentals'
    ],
    'Gemini': [
      'Google products favor structured data',
      'Implement schema markup on your site',
      'Optimize for Google Search as well',
      'Create content on Google properties (YouTube)'
    ],
    'Claude': [
      'Claude values nuanced, accurate content',
      'Focus on comprehensive explanations',
      'Avoid marketing hype, be factual',
      'Include context and background'
    ]
  }
  
  const key = Object.keys(tips).find(k => engine.includes(k))
  return tips[key] || ['Ensure quality content across all channels']
}
