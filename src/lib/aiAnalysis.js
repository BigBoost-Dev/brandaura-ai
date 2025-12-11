/**
 * Advanced AI Analysis Engine
 * - Source Attribution: Identify WHERE AI learned about brands
 * - Content Scoring: Rate content for AI discoverability
 * - Gap Analysis: What competitors have that you don't
 * - Recommendations: Actionable optimization suggestions
 */

// Known source patterns that AI commonly cites
const SOURCE_PATTERNS = {
  reviewSites: [
    { pattern: /g2\.com|g2crowd/i, name: 'G2', type: 'review', authority: 'high' },
    { pattern: /capterra\.com/i, name: 'Capterra', type: 'review', authority: 'high' },
    { pattern: /trustpilot\.com/i, name: 'Trustpilot', type: 'review', authority: 'high' },
    { pattern: /trustradius\.com/i, name: 'TrustRadius', type: 'review', authority: 'high' },
    { pattern: /softwareadvice\.com/i, name: 'Software Advice', type: 'review', authority: 'medium' },
    { pattern: /getapp\.com/i, name: 'GetApp', type: 'review', authority: 'medium' },
    { pattern: /yelp\.com/i, name: 'Yelp', type: 'review', authority: 'medium' },
    { pattern: /glassdoor\.com/i, name: 'Glassdoor', type: 'review', authority: 'medium' },
  ],
  mediaSites: [
    { pattern: /forbes\.com/i, name: 'Forbes', type: 'media', authority: 'high' },
    { pattern: /techcrunch\.com/i, name: 'TechCrunch', type: 'media', authority: 'high' },
    { pattern: /bloomberg\.com/i, name: 'Bloomberg', type: 'media', authority: 'high' },
    { pattern: /reuters\.com/i, name: 'Reuters', type: 'media', authority: 'high' },
    { pattern: /wired\.com/i, name: 'Wired', type: 'media', authority: 'high' },
    { pattern: /theverge\.com/i, name: 'The Verge', type: 'media', authority: 'high' },
    { pattern: /entrepreneur\.com/i, name: 'Entrepreneur', type: 'media', authority: 'medium' },
    { pattern: /inc\.com/i, name: 'Inc.', type: 'media', authority: 'medium' },
    { pattern: /businessinsider\.com/i, name: 'Business Insider', type: 'media', authority: 'medium' },
    { pattern: /cnet\.com/i, name: 'CNET', type: 'media', authority: 'medium' },
    { pattern: /zdnet\.com/i, name: 'ZDNet', type: 'media', authority: 'medium' },
  ],
  socialForums: [
    { pattern: /reddit\.com/i, name: 'Reddit', type: 'social', authority: 'medium' },
    { pattern: /quora\.com/i, name: 'Quora', type: 'social', authority: 'medium' },
    { pattern: /twitter\.com|x\.com/i, name: 'Twitter/X', type: 'social', authority: 'low' },
    { pattern: /linkedin\.com/i, name: 'LinkedIn', type: 'social', authority: 'medium' },
    { pattern: /facebook\.com/i, name: 'Facebook', type: 'social', authority: 'low' },
    { pattern: /producthunt\.com/i, name: 'Product Hunt', type: 'social', authority: 'medium' },
    { pattern: /hackernews|news\.ycombinator/i, name: 'Hacker News', type: 'social', authority: 'medium' },
  ],
  knowledgeBases: [
    { pattern: /wikipedia\.org/i, name: 'Wikipedia', type: 'knowledge', authority: 'high' },
    { pattern: /crunchbase\.com/i, name: 'Crunchbase', type: 'knowledge', authority: 'high' },
    { pattern: /github\.com/i, name: 'GitHub', type: 'knowledge', authority: 'medium' },
    { pattern: /stackoverflow\.com/i, name: 'Stack Overflow', type: 'knowledge', authority: 'medium' },
    { pattern: /medium\.com/i, name: 'Medium', type: 'knowledge', authority: 'medium' },
    { pattern: /dev\.to/i, name: 'Dev.to', type: 'knowledge', authority: 'medium' },
  ],
  industryBlogs: [
    { pattern: /hubspot\.com\/blog/i, name: 'HubSpot Blog', type: 'blog', authority: 'high' },
    { pattern: /neilpatel\.com/i, name: 'Neil Patel', type: 'blog', authority: 'high' },
    { pattern: /moz\.com\/blog/i, name: 'Moz Blog', type: 'blog', authority: 'high' },
    { pattern: /searchenginejournal\.com/i, name: 'Search Engine Journal', type: 'blog', authority: 'medium' },
    { pattern: /searchengineland\.com/i, name: 'Search Engine Land', type: 'blog', authority: 'medium' },
    { pattern: /ahrefs\.com\/blog/i, name: 'Ahrefs Blog', type: 'blog', authority: 'high' },
    { pattern: /backlinko\.com/i, name: 'Backlinko', type: 'blog', authority: 'high' },
  ]
}

// Flatten all patterns for easy lookup
const ALL_SOURCES = Object.values(SOURCE_PATTERNS).flat()

/**
 * Extract and categorize sources from AI response
 */
export function extractSources(response, citedUrls = []) {
  const sources = []
  const mentionedSources = new Set()
  
  // Extract from explicit URLs
  citedUrls.forEach(url => {
    for (const source of ALL_SOURCES) {
      if (source.pattern.test(url)) {
        if (!mentionedSources.has(source.name)) {
          sources.push({
            name: source.name,
            type: source.type,
            authority: source.authority,
            url: url,
            confidence: 0.95
          })
          mentionedSources.add(source.name)
        }
        break
      }
    }
    
    // Unknown source - extract domain
    if (!sources.find(s => s.url === url)) {
      try {
        const domain = new URL(url).hostname.replace('www.', '')
        if (!mentionedSources.has(domain)) {
          sources.push({
            name: domain,
            type: 'unknown',
            authority: 'unknown',
            url: url,
            confidence: 0.9
          })
          mentionedSources.add(domain)
        }
      } catch (e) {}
    }
  })
  
  // Look for source mentions in text (even without URLs)
  const textPatterns = [
    { pattern: /according to ([\w\s]+)/gi, group: 1 },
    { pattern: /reported by ([\w\s]+)/gi, group: 1 },
    { pattern: /based on ([\w\s]+) data/gi, group: 1 },
    { pattern: /from ([\w\s]+) research/gi, group: 1 },
    { pattern: /([\w\s]+) reports that/gi, group: 1 },
    { pattern: /cited by ([\w\s]+)/gi, group: 1 },
    { pattern: /sources?: ([\w\s,]+)/gi, group: 1 },
  ]
  
  textPatterns.forEach(({ pattern }) => {
    let match
    while ((match = pattern.exec(response)) !== null) {
      const sourceName = match[1].trim()
      // Check if it matches a known source
      for (const source of ALL_SOURCES) {
        if (source.pattern.test(sourceName)) {
          if (!mentionedSources.has(source.name)) {
            sources.push({
              name: source.name,
              type: source.type,
              authority: source.authority,
              url: null,
              confidence: 0.7,
              mentionContext: match[0].substring(0, 100)
            })
            mentionedSources.add(source.name)
          }
          break
        }
      }
    }
  })
  
  // Look for implicit source indicators
  const implicitIndicators = [
    { pattern: /user reviews|customer reviews|reviews show/i, source: 'Review Sites', type: 'review' },
    { pattern: /reddit users|redditors|subreddit/i, source: 'Reddit', type: 'social' },
    { pattern: /industry experts|analysts/i, source: 'Industry Analysis', type: 'media' },
    { pattern: /official website|company website/i, source: 'Official Website', type: 'official' },
    { pattern: /case studies|customer success/i, source: 'Case Studies', type: 'official' },
    { pattern: /documentation|docs/i, source: 'Documentation', type: 'official' },
  ]
  
  implicitIndicators.forEach(({ pattern, source, type }) => {
    if (pattern.test(response) && !mentionedSources.has(source)) {
      sources.push({
        name: source,
        type: type,
        authority: 'inferred',
        url: null,
        confidence: 0.5,
        isImplicit: true
      })
      mentionedSources.add(source)
    }
  })
  
  return sources
}

/**
 * Analyze content gaps - what competitors have that brand doesn't
 */
export function analyzeContentGaps(results, brandName, competitors) {
  // Helper to get mention type
  const getMentionType = (r) => r.mention_type || r.brand_mention || r.brandMention || 'notMentioned'
  
  const gaps = []
  const competitorStrengths = {}
  const brandWeaknesses = []
  
  // Group results by topic
  const topicResults = {}
  results.forEach(r => {
    const topic = r.topic || r.topic_name || r.query_type || 'General'
    if (!topicResults[topic]) {
      topicResults[topic] = []
    }
    topicResults[topic].push(r)
  })
  
  // Analyze each topic
  Object.entries(topicResults).forEach(([topic, topicData]) => {
    const brandMentions = topicData.filter(r => getMentionType(r) !== 'notMentioned')
    const brandNotMentioned = topicData.filter(r => getMentionType(r) === 'notMentioned')
    
    // Check competitor performance in this topic
    const competitorPerformance = {}
    competitors.forEach(comp => {
      const compName = comp.name || comp
      competitorPerformance[compName] = {
        mentioned: 0,
        leader: 0,
        total: 0
      }
    })
    
    topicData.forEach(r => {
      if (r.competitor_mentions) {
        Object.entries(r.competitor_mentions).forEach(([comp, status]) => {
          if (competitorPerformance[comp]) {
            competitorPerformance[comp].total++
            if (status !== 'notMentioned') {
              competitorPerformance[comp].mentioned++
              if (status === 'leader') {
                competitorPerformance[comp].leader++
              }
            }
          }
        })
      }
    })
    
    // Identify gaps
    const brandMentionRate = topicData.length > 0 ? brandMentions.length / topicData.length : 0
    
    Object.entries(competitorPerformance).forEach(([comp, perf]) => {
      const compMentionRate = perf.total > 0 ? perf.mentioned / perf.total : 0
      
      if (compMentionRate > brandMentionRate + 0.2) {
        gaps.push({
          topic,
          competitor: comp,
          competitorMentionRate: compMentionRate,
          brandMentionRate: brandMentionRate,
          gap: compMentionRate - brandMentionRate,
          severity: compMentionRate > 0.7 ? 'high' : compMentionRate > 0.4 ? 'medium' : 'low',
          recommendation: `${comp} is mentioned ${Math.round(compMentionRate * 100)}% of the time for "${topic}" queries, while you're at ${Math.round(brandMentionRate * 100)}%. Analyze their content strategy for this topic.`
        })
        
        if (!competitorStrengths[comp]) {
          competitorStrengths[comp] = []
        }
        competitorStrengths[comp].push(topic)
      }
    })
    
    // Track brand weaknesses
    if (brandMentionRate < 0.3) {
      brandWeaknesses.push({
        topic,
        mentionRate: brandMentionRate,
        queries: brandNotMentioned.length
      })
    }
  })
  
  return {
    gaps: gaps.sort((a, b) => b.gap - a.gap),
    competitorStrengths,
    brandWeaknesses,
    summary: {
      totalGaps: gaps.length,
      criticalGaps: gaps.filter(g => g.severity === 'high').length,
      topCompetitor: Object.entries(competitorStrengths)
        .sort((a, b) => b[1].length - a[1].length)[0]?.[0] || null
    }
  }
}

/**
 * Generate optimization recommendations
 */
export function generateRecommendations(results, gaps, sources, brand) {
  // Helper to get mention type
  const getMentionType = (r) => r.mention_type || r.brand_mention || r.brandMention || 'notMentioned'
  
  const recommendations = []
  
  // Source-based recommendations
  const sourceCounts = {}
  const competitorSources = {}
  
  results.forEach(r => {
    // Track sources when brand is NOT mentioned
    const mentionType = getMentionType(r)
    const resultSources = r.sources || r.citations || []
    
    if (mentionType === 'notMentioned' && resultSources.length > 0) {
      resultSources.forEach(src => {
        const srcName = typeof src === 'string' ? src : (src.name || src.url || 'unknown')
        sourceCounts[srcName] = (sourceCounts[srcName] || 0) + 1
        
        // Track which competitors are mentioned from this source
        const compMentions = r.competitor_mentions || r.competitorMentions || {}
        Object.entries(compMentions).forEach(([comp, status]) => {
          if (status !== 'notMentioned') {
            if (!competitorSources[srcName]) {
              competitorSources[srcName] = {}
            }
            competitorSources[srcName][comp] = (competitorSources[srcName][comp] || 0) + 1
          }
        })
      })
    }
  })
  
  // Recommend getting on top sources
  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  topSources.forEach(([source, count], idx) => {
    const sourceInfo = ALL_SOURCES.find(s => s.name === source)
    const competitorsOnSource = competitorSources[source] 
      ? Object.keys(competitorSources[source]).join(', ')
      : 'competitors'
    
    recommendations.push({
      id: `source-${idx}`,
      type: 'source',
      priority: idx === 0 ? 'critical' : idx < 3 ? 'high' : 'medium',
      title: `Get listed on ${source}`,
      description: `AI cited ${source} ${count} times when NOT mentioning you. ${competitorsOnSource} are getting visibility here.`,
      action: sourceInfo?.type === 'review' 
        ? `Create or claim your ${source} profile. Encourage customers to leave reviews.`
        : sourceInfo?.type === 'media'
        ? `Pitch stories to ${source} or get featured in their articles.`
        : `Create valuable content or presence on ${source}.`,
      impact: 'high',
      effort: sourceInfo?.type === 'review' ? 'low' : 'medium',
      category: 'visibility'
    })
  })
  
  // Content gap recommendations
  gaps.gaps.slice(0, 5).forEach((gap, idx) => {
    recommendations.push({
      id: `gap-${idx}`,
      type: 'content',
      priority: gap.severity === 'high' ? 'critical' : gap.severity,
      title: `Create content for "${gap.topic}"`,
      description: gap.recommendation,
      action: `Analyze ${gap.competitor}'s content about "${gap.topic}". Create comprehensive guides, comparisons, and use cases that AI can cite.`,
      impact: 'high',
      effort: 'medium',
      category: 'content'
    })
  })
  
  // Prompt-based recommendations
  const lowMentionPrompts = results
    .filter(r => getMentionType(r) === 'notMentioned')
    .slice(0, 10)
  
  const promptPatterns = {}
  lowMentionPrompts.forEach(r => {
    const type = r.prompt_intent || r.query_type || 'general'
    promptPatterns[type] = (promptPatterns[type] || 0) + 1
  })
  
  Object.entries(promptPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([intent, count], idx) => {
      recommendations.push({
        id: `intent-${idx}`,
        type: 'content',
        priority: 'medium',
        title: `Optimize for "${intent}" intent queries`,
        description: `You're not being mentioned in ${count} "${intent}" queries. This intent type needs more targeted content.`,
        action: `Create content that directly answers ${intent} questions. Use clear headings, structured data, and authoritative language.`,
        impact: 'medium',
        effort: 'medium',
        category: 'optimization'
      })
    })
  
  // Technical SEO recommendations
  recommendations.push({
    id: 'technical-1',
    type: 'technical',
    priority: 'high',
    title: 'Implement structured data',
    description: 'Structured data helps AI understand and cite your content more accurately.',
    action: 'Add Schema.org markup: Organization, Product, FAQ, HowTo, and Review schemas.',
    impact: 'high',
    effort: 'low',
    category: 'technical'
  })
  
  recommendations.push({
    id: 'technical-2',
    type: 'technical',
    priority: 'medium',
    title: 'Create an LLMs.txt file',
    description: 'LLMs.txt tells AI crawlers what content to prioritize, like robots.txt for AI.',
    action: 'Create /llms.txt with your key pages, products, and brand information.',
    impact: 'medium',
    effort: 'low',
    category: 'technical'
  })
  
  // Brand consistency recommendations
  const uniqueSnippets = [...new Set(results.map(r => r.snippet).filter(Boolean))]
  const inconsistentMentions = uniqueSnippets.filter(s => 
    s.toLowerCase().includes(brand.name.toLowerCase()) && 
    (s.includes('however') || s.includes('but') || s.includes('although'))
  )
  
  if (inconsistentMentions.length > 2) {
    recommendations.push({
      id: 'brand-1',
      type: 'brand',
      priority: 'high',
      title: 'Address mixed brand perception',
      description: `AI mentions your brand with caveats ${inconsistentMentions.length} times. This indicates mixed signals in your online presence.`,
      action: 'Audit your online reviews and mentions. Address negative feedback and amplify positive testimonials.',
      impact: 'high',
      effort: 'high',
      category: 'reputation'
    })
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Calculate content discoverability score
 */
export function calculateContentScore(results, brand) {
  const scores = {
    visibility: 0,
    authority: 0,
    sentiment: 0,
    coverage: 0,
    competitive: 0
  }
  
  if (results.length === 0) return { overall: 0, breakdown: scores, grade: 'F', improvements: [], strengths: [] }
  
  // Helper to get mention type from any field
  const getMentionType = (r) => r.mention_type || r.brand_mention || r.brandMention || 'notMentioned'
  
  // Visibility: % of queries where brand is mentioned
  const mentioned = results.filter(r => getMentionType(r) !== 'notMentioned')
  scores.visibility = Math.round((mentioned.length / results.length) * 100)
  
  // Authority: weighted by mention type
  const mentionWeights = { leader: 100, recommended: 75, mentioned: 50, alternative: 25, notMentioned: 0 }
  const authoritySum = results.reduce((sum, r) => sum + (mentionWeights[getMentionType(r)] || 0), 0)
  scores.authority = Math.round(authoritySum / results.length)
  
  // Sentiment
  const sentimentScores = { positive: 100, neutral: 50, negative: 0 }
  const sentimentSum = mentioned.reduce((sum, r) => sum + (sentimentScores[r.sentiment] || 50), 0)
  scores.sentiment = mentioned.length > 0 ? Math.round(sentimentSum / mentioned.length) : 50
  
  // Coverage: how many different topics/intents we're mentioned in
  const topics = [...new Set(results.map(r => r.topic || r.topic_name || r.query_type || 'General'))]
  const coveredTopics = [...new Set(mentioned.map(r => r.topic || r.topic_name || r.query_type || 'General'))]
  scores.coverage = topics.length > 0 ? Math.round((coveredTopics.length / topics.length) * 100) : 0
  
  // Competitive: how often we beat competitors
  let wins = 0, losses = 0
  results.forEach(r => {
    const compMentions = r.competitor_mentions || r.competitorMentions || {}
    if (Object.keys(compMentions).length > 0) {
      const brandIsLeader = getMentionType(r) === 'leader'
      const brandIsMentioned = getMentionType(r) !== 'notMentioned'
      
      Object.values(compMentions).forEach(status => {
        if (brandIsLeader && status !== 'leader') wins++
        if (!brandIsMentioned && status === 'leader') losses++
        if (brandIsMentioned && status === 'notMentioned') wins++
        if (!brandIsMentioned && status !== 'notMentioned') losses++
      })
    }
  })
  scores.competitive = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 50
  
  // Overall score (weighted average)
  const overall = Math.round(
    scores.visibility * 0.3 +
    scores.authority * 0.25 +
    scores.sentiment * 0.15 +
    scores.coverage * 0.15 +
    scores.competitive * 0.15
  )
  
  // Generate strengths and improvements based on scores
  const strengths = []
  const improvements = []
  
  if (scores.visibility >= 70) {
    strengths.push(`Strong visibility: Brand mentioned in ${scores.visibility}% of AI responses`)
  } else if (scores.visibility < 50) {
    improvements.push(`Increase visibility: Currently only ${scores.visibility}% mention rate`)
  }
  
  if (scores.authority >= 60) {
    strengths.push(`Good authority score: AI recommends you favorably ${scores.authority}% of the time`)
  } else if (scores.authority < 40) {
    improvements.push(`Build authority: Focus on getting "top pick" recommendations`)
  }
  
  if (scores.sentiment >= 70) {
    strengths.push(`Positive sentiment: AI describes your brand positively`)
  } else if (scores.sentiment < 50) {
    improvements.push(`Improve sentiment: Work on brand perception and testimonials`)
  }
  
  if (scores.coverage >= 80) {
    strengths.push(`Excellent topic coverage: Mentioned across most topics`)
  } else if (scores.coverage < 60) {
    improvements.push(`Expand coverage: Create content for more topic areas`)
  }
  
  if (scores.competitive >= 60) {
    strengths.push(`Competitive edge: Outperforming competitors in AI recommendations`)
  } else if (scores.competitive < 40) {
    improvements.push(`Competitive gap: Competitors are being recommended more often`)
  }
  
  // Add generic tips if lists are short
  if (strengths.length === 0) {
    strengths.push('Keep creating quality content to improve your AI presence')
  }
  if (improvements.length === 0) {
    improvements.push('Continue monitoring and optimizing your AI visibility')
  }
  
  return {
    overall,
    breakdown: scores,
    grade: overall >= 80 ? 'A' : overall >= 60 ? 'B' : overall >= 40 ? 'C' : overall >= 20 ? 'D' : 'F',
    strengths,
    improvements
  }
}

/**
 * Calculate ROI metrics
 */
export function calculateROI(results, analyticsData = null) {
  // Helper to get mention type
  const getMentionType = (r) => r.mention_type || r.brand_mention || r.brandMention || 'notMentioned'
  
  const metrics = {
    mentions: {
      total: results.length,
      positive: results.filter(r => getMentionType(r) === 'leader' || getMentionType(r) === 'recommended').length,
      topPicks: results.filter(r => getMentionType(r) === 'leader').length
    },
    trend: {
      current: 0,
      previous: 0,
      change: 0
    },
    estimated: {
      impressions: 0,
      clicks: 0,
      value: 0
    }
  }
  
  // Calculate trend (compare last 7 days to previous 7 days)
  const now = new Date()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000)
  
  const recentResults = results.filter(r => new Date(r.created_at) > weekAgo)
  const previousResults = results.filter(r => {
    const date = new Date(r.created_at)
    return date > twoWeeksAgo && date <= weekAgo
  })
  
  const recentMentionRate = recentResults.length > 0
    ? recentResults.filter(r => getMentionType(r) !== 'notMentioned').length / recentResults.length
    : 0
  const previousMentionRate = previousResults.length > 0
    ? previousResults.filter(r => getMentionType(r) !== 'notMentioned').length / previousResults.length
    : 0
  
  metrics.trend.current = Math.round(recentMentionRate * 100)
  metrics.trend.previous = Math.round(previousMentionRate * 100)
  metrics.trend.change = metrics.trend.current - metrics.trend.previous
  
  // Estimate value (rough estimates based on industry data)
  // Average AI query has ~1000 monthly searches, 30% CTR to mentioned brands
  const avgMonthlySearches = 1000
  const avgCTR = 0.30
  const avgCPC = 2.50 // What you'd pay for equivalent PPC
  
  metrics.estimated.impressions = metrics.mentions.positive * avgMonthlySearches
  metrics.estimated.clicks = Math.round(metrics.estimated.impressions * avgCTR)
  metrics.estimated.value = Math.round(metrics.estimated.clicks * avgCPC)
  
  // If we have actual analytics data, use it
  if (analyticsData) {
    metrics.actual = analyticsData
  }
  
  return metrics
}

export { SOURCE_PATTERNS, ALL_SOURCES }
