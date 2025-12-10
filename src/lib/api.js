import { supabase } from './supabase'
import { MENTION_TYPES } from './constants'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Cache session to avoid repeated getSession calls
let cachedSession = null
let sessionExpiry = 0

async function getSession() {
  const now = Date.now()
  // Use cached session if still valid (cache for 10 minutes)
  if (cachedSession && sessionExpiry > now) {
    console.log('[getSession] Using cached session')
    return cachedSession
  }
  
  console.log('[getSession] Fetching fresh session...')
  const { data: { session } } = await supabase.auth.getSession()
  console.log('[getSession] Got session:', !!session)
  if (session) {
    cachedSession = session
    sessionExpiry = now + 10 * 60 * 1000 // 10 minutes
  }
  return session
}

/**
 * Query AI through the secure backend proxy
 * NEVER call OpenRouter directly from frontend
 */
export async function queryAI(model, query, timeoutMs = 45000) {
  console.log(`[queryAI] Starting: ${model}`)
  
  try {
    // Get session (uses cache if available)
    const session = await getSession()
    
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Call our secure Edge Function with timeout using Promise.race
    console.log(`[queryAI] Fetching...`)
    
    const fetchPromise = fetch(`${SUPABASE_URL}/functions/v1/query-ai`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, query })
    })
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
    })
    
    const response = await Promise.race([fetchPromise, timeoutPromise])

    console.log(`[queryAI] Response: ${response.status}`)

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || `API error: ${response.status}` }
    }

    const data = await response.json()
    console.log(`[queryAI] Success, length: ${data.choices?.[0]?.message?.content?.length || 0}`)
    
    return {
      success: true,
      response: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
      cost: data.usage ? (data.usage.prompt_tokens * 0.000001 + data.usage.completion_tokens * 0.000002) : 0
    }
  } catch (error) {
    console.log(`[queryAI] Error: ${error.message}`)
    return { success: false, error: error.message === 'TIMEOUT' ? 'Request timed out' : error.message }
  }
}

/**
 * Analyze AI response for brand mentions
 */
export function analyzeResponse(response, brandName, competitors = []) {
  const lowerResponse = response.toLowerCase()
  const lowerBrand = brandName.toLowerCase()
  
  let brandMention = 'notMentioned'
  let brandPosition = null
  let sentiment = 'neutral'
  let confidence = 0
  
  // Check for brand mention
  const brandRegex = new RegExp(`\\b${escapeRegex(lowerBrand)}\\b`, 'gi')
  const brandMatches = response.match(brandRegex) || []
  const mentionCount = brandMatches.length
  
  if (mentionCount > 0) {
    // Find context around first mention
    const brandIndex = lowerResponse.indexOf(lowerBrand)
    const contextStart = Math.max(0, brandIndex - 200)
    const contextEnd = Math.min(lowerResponse.length, brandIndex + 250)
    const context = lowerResponse.slice(contextStart, contextEnd)
    
    // Determine mention type based on context
    const patterns = {
      leader: /\b(top pick|best choice|#1|number one|leading|first choice|highly recommend|excellent choice|winner|standout|best overall|top recommendation|clear winner|our pick)\b/i,
      recommended: /\b(recommend|great option|good choice|solid|popular choice|well-regarded|trusted|reliable|strong contender|worth considering|notable)\b/i,
      alternative: /\b(alternative|another option|also consider|competitor|similar to|instead of|comparable|runner-up)\b/i,
      negative: /\b(drawback|downside|limitation|expensive|complex|difficult|issue|problem|concern|caveat|lacking|weakness|cons include|not recommended|avoid)\b/i
    }
    
    if (patterns.leader.test(context)) {
      brandMention = 'leader'
      sentiment = 'positive'
      confidence = 0.9
    } else if (patterns.negative.test(context) && !patterns.recommended.test(context)) {
      brandMention = 'negative'
      sentiment = 'negative'
      confidence = 0.85
    } else if (patterns.recommended.test(context)) {
      brandMention = 'recommended'
      sentiment = 'positive'
      confidence = 0.8
    } else if (patterns.alternative.test(context)) {
      brandMention = 'alternative'
      sentiment = 'neutral'
      confidence = 0.75
    } else {
      brandMention = 'mentioned'
      sentiment = 'neutral'
      confidence = 0.7
    }
    
    // Find position in numbered lists
    const lines = response.split('\n')
    for (const line of lines) {
      if (line.toLowerCase().includes(lowerBrand)) {
        const numMatch = line.match(/^\s*(\d+)[\.\)\:\-]/)
        if (numMatch) {
          brandPosition = parseInt(numMatch[1])
          break
        }
      }
    }
  }
  
  // Analyze competitor mentions
  const competitorMentions = {}
  competitors.forEach(comp => {
    const compName = comp.name?.toLowerCase() || comp.toLowerCase()
    const compRegex = new RegExp(`\\b${escapeRegex(compName)}\\b`, 'gi')
    
    if (compRegex.test(response)) {
      const idx = lowerResponse.indexOf(compName)
      const ctx = lowerResponse.slice(Math.max(0, idx - 100), Math.min(lowerResponse.length, idx + 150))
      
      if (/\b(top|best|leading|winner|excellent)\b/i.test(ctx)) {
        competitorMentions[comp.name || comp] = 'leader'
      } else if (/\b(recommend|great|good|solid)\b/i.test(ctx)) {
        competitorMentions[comp.name || comp] = 'recommended'
      } else {
        competitorMentions[comp.name || comp] = 'mentioned'
      }
    } else {
      competitorMentions[comp.name || comp] = 'notMentioned'
    }
  })
  
  // Extract URLs
  const urlPattern = /https?:\/\/[^\s\)\"\>\]]+/g
  const citedUrls = response.match(urlPattern) || []
  
  // Generate snippet
  let snippet = ''
  if (mentionCount > 0) {
    const idx = lowerResponse.indexOf(lowerBrand)
    const start = Math.max(0, idx - 60)
    const end = Math.min(response.length, idx + 180)
    snippet = (start > 0 ? '...' : '') + response.slice(start, end).trim() + (end < response.length ? '...' : '')
  } else {
    snippet = response.slice(0, 250) + (response.length > 250 ? '...' : '')
  }
  
  return {
    brandMention,
    brandPosition,
    sentiment,
    confidence,
    mentionCount,
    competitorMentions,
    citedUrls,
    snippet,
    wordCount: response.split(/\s+/).length
  }
}

/**
 * Generate queries from templates
 */
export function generateQueries(brand, platforms) {
  const { name, category, useCase, competitors } = brand
  const templates = [
    { type: 'awareness', template: `What are the best ${category} tools in 2025?` },
    { type: 'awareness', template: `Top ${category} software for businesses` },
    { type: 'consideration', template: `What are the pros and cons of ${name}?` },
    { type: 'consideration', template: `Is ${name} good for ${useCase || 'business'}?` },
    { type: 'decision', template: `Should I buy ${name}?` },
    { type: 'reputation', template: `What do people think about ${name}?` }
  ]
  
  // Add competitor comparison queries
  if (competitors?.length > 0) {
    competitors.slice(0, 2).forEach(comp => {
      templates.push({
        type: 'consideration',
        template: `Compare ${name} vs ${comp.name || comp}`
      })
    })
  }
  
  const queries = []
  platforms.forEach(platformId => {
    templates.forEach(t => {
      queries.push({
        query: t.template,
        type: t.type,
        platformId
      })
    })
  })
  
  return queries
}

/**
 * Calculate metrics from results
 */
export function calculateMetrics(results, platforms, competitors = []) {
  if (!results || results.length === 0) return null
  
  // Overall visibility score
  const scores = results.map(r => MENTION_TYPES[r.brand_mention || r.brandMention]?.score || 0)
  const visibilityScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  
  // By platform
  const byPlatform = {}
  platforms.forEach(pid => {
    const platformResults = results.filter(r => r.platform_id === pid || r.platformId === pid)
    if (platformResults.length > 0) {
      const pScores = platformResults.map(r => MENTION_TYPES[r.brand_mention || r.brandMention]?.score || 0)
      byPlatform[pid] = {
        score: Math.round(pScores.reduce((a, b) => a + b, 0) / pScores.length),
        tests: platformResults.length,
        leader: platformResults.filter(r => (r.brand_mention || r.brandMention) === 'leader').length,
        mentioned: platformResults.filter(r => (r.brand_mention || r.brandMention) !== 'notMentioned').length
      }
    }
  })
  
  // By query type
  const byType = {}
  const types = ['awareness', 'consideration', 'decision', 'reputation']
  types.forEach(type => {
    const typeResults = results.filter(r => (r.query_type || r.queryType) === type)
    if (typeResults.length > 0) {
      const tScores = typeResults.map(r => MENTION_TYPES[r.brand_mention || r.brandMention]?.score || 0)
      byType[type] = Math.round(tScores.reduce((a, b) => a + b, 0) / tScores.length)
    }
  })
  
  // Mention distribution
  const mentionDist = {}
  Object.keys(MENTION_TYPES).forEach(type => {
    mentionDist[type] = results.filter(r => (r.brand_mention || r.brandMention) === type).length
  })
  
  // Competitor scores
  const competitorScores = {}
  competitors.forEach(comp => {
    const compName = comp.name || comp
    const compMentions = results
      .filter(r => {
        const mentions = r.competitor_mentions || r.competitorMentions || {}
        return mentions[compName] && mentions[compName] !== 'notMentioned'
      })
      .map(r => {
        const mentions = r.competitor_mentions || r.competitorMentions || {}
        return MENTION_TYPES[mentions[compName]]?.score || 0
      })
    
    competitorScores[compName] = compMentions.length > 0
      ? Math.round(compMentions.reduce((a, b) => a + b, 0) / compMentions.length)
      : 0
  })
  
  // Timeline (last 30 days)
  const dailyData = {}
  results.forEach(r => {
    const day = (r.created_at || r.timestamp)?.slice(0, 10)
    if (day) {
      if (!dailyData[day]) dailyData[day] = []
      dailyData[day].push(MENTION_TYPES[r.brand_mention || r.brandMention]?.score || 0)
    }
  })
  
  const timeline = Object.entries(dailyData)
    .map(([date, dayScores]) => ({
      date,
      score: Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length),
      tests: dayScores.length
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
  
  // Week-over-week trend
  const now = new Date()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000)
  
  const thisWeek = results.filter(r => new Date(r.created_at || r.timestamp) > weekAgo)
  const lastWeek = results.filter(r => {
    const date = new Date(r.created_at || r.timestamp)
    return date > twoWeeksAgo && date <= weekAgo
  })
  
  let trend = 0
  if (thisWeek.length > 0 && lastWeek.length > 0) {
    const thisAvg = thisWeek.map(r => MENTION_TYPES[r.brand_mention || r.brandMention]?.score || 0).reduce((a, b) => a + b, 0) / thisWeek.length
    const lastAvg = lastWeek.map(r => MENTION_TYPES[r.brand_mention || r.brandMention]?.score || 0).reduce((a, b) => a + b, 0) / lastWeek.length
    trend = thisAvg - lastAvg
  }
  
  // Total cost
  const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0)
  
  return {
    visibilityScore,
    totalTests: results.length,
    byPlatform,
    byType,
    mentionDist,
    competitorScores,
    timeline,
    trend,
    leaderCount: mentionDist.leader || 0,
    mentionedCount: results.filter(r => (r.brand_mention || r.brandMention) !== 'notMentioned').length,
    notMentionedCount: mentionDist.notMentioned || 0,
    totalCost
  }
}

// Utility functions
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
