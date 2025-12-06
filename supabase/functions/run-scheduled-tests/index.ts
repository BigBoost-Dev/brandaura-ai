// supabase/functions/run-scheduled-tests/index.ts
// This function runs on a schedule to execute automated tests
// Triggered by pg_cron or external scheduler (e.g., cron-job.org)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI Platforms configuration
const AI_PLATFORMS: Record<string, { model: string; name: string }> = {
  'gpt-4o': { model: 'openai/gpt-4o', name: 'ChatGPT' },
  'claude-sonnet': { model: 'anthropic/claude-sonnet-4', name: 'Claude' },
  'gemini-flash': { model: 'google/gemini-2.0-flash-001', name: 'Gemini' },
  'perplexity': { model: 'perplexity/sonar-pro', name: 'Perplexity' },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!OPENROUTER_API_KEY || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables')
    }

    // Use service role for scheduled tasks (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_KEY
    )

    // Get all enabled schedules that are due
    const now = new Date()
    const { data: schedules, error: schedError } = await supabase
      .from('schedules')
      .select(`
        *,
        brand:brands(*)
      `)
      .eq('enabled', true)
      .lte('next_run', now.toISOString())

    if (schedError) {
      throw schedError
    }

    console.log(`Found ${schedules?.length || 0} schedules to run`)

    const results = []

    for (const schedule of schedules || []) {
      const brand = schedule.brand
      if (!brand) continue

      console.log(`Running tests for brand: ${brand.name}`)

      const platforms = brand.selected_platforms || ['gpt-4o', 'claude-sonnet']
      const queries = generateQueries(brand, platforms)
      const batchId = Date.now().toString()
      const testResults = []

      for (const { query, type, platformId } of queries) {
        const platform = AI_PLATFORMS[platformId]
        if (!platform) continue

        try {
          // Query OpenRouter
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: platform.model,
              messages: [{ role: 'user', content: query }],
              max_tokens: 1500,
              temperature: 0.7
            })
          })

          if (response.ok) {
            const data = await response.json()
            const text = data.choices?.[0]?.message?.content || ''
            const analysis = analyzeResponse(text, brand.name, brand.competitors || [])

            testResults.push({
              brand_id: brand.id,
              user_id: brand.user_id,
              batch_id: batchId,
              platform_id: platformId,
              platform_name: platform.name,
              model: platform.model,
              query,
              query_type: type,
              brand_mention: analysis.brandMention,
              brand_position: analysis.brandPosition,
              sentiment: analysis.sentiment,
              confidence: analysis.confidence,
              mention_count: analysis.mentionCount,
              competitor_mentions: analysis.competitorMentions,
              snippet: analysis.snippet,
              cost: data.usage ? (data.usage.prompt_tokens * 0.000001 + data.usage.completion_tokens * 0.000002) : 0
            })
          }
        } catch (err) {
          console.error(`Error querying ${platform.name}:`, err)
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 1000))
      }

      // Save results
      if (testResults.length > 0) {
        const { error: insertError } = await supabase
          .from('test_results')
          .insert(testResults)

        if (insertError) {
          console.error('Error saving results:', insertError)
        } else {
          console.log(`Saved ${testResults.length} results for ${brand.name}`)
        }
      }

      // Update schedule next_run
      const nextRun = calculateNextRun(schedule)
      await supabase
        .from('schedules')
        .update({ 
          last_run: now.toISOString(),
          next_run: nextRun.toISOString()
        })
        .eq('id', schedule.id)

      // Check for alerts
      await checkAlerts(supabase, brand, testResults)

      results.push({
        brand: brand.name,
        tests: testResults.length,
        nextRun
      })
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Scheduled test error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper functions
function generateQueries(brand: any, platforms: string[]) {
  const templates = [
    { type: 'awareness', template: `What are the best ${brand.category} tools in 2025?` },
    { type: 'consideration', template: `What are the pros and cons of ${brand.name}?` },
    { type: 'decision', template: `Should I buy ${brand.name}?` },
    { type: 'reputation', template: `What do people think about ${brand.name}?` }
  ]

  const queries: { query: string; type: string; platformId: string }[] = []
  
  platforms.forEach(platformId => {
    templates.forEach(t => {
      queries.push({ query: t.template, type: t.type, platformId })
    })
  })

  return queries
}

function analyzeResponse(response: string, brandName: string, competitors: any[]) {
  const lowerResponse = response.toLowerCase()
  const lowerBrand = brandName.toLowerCase()
  
  let brandMention = 'notMentioned'
  let brandPosition = null
  let sentiment = 'neutral'
  let confidence = 0
  
  const brandRegex = new RegExp(`\\b${lowerBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
  const mentionCount = (response.match(brandRegex) || []).length
  
  if (mentionCount > 0) {
    const idx = lowerResponse.indexOf(lowerBrand)
    const context = lowerResponse.slice(Math.max(0, idx - 200), Math.min(lowerResponse.length, idx + 250))
    
    if (/\b(top pick|best choice|#1|highly recommend|winner)\b/i.test(context)) {
      brandMention = 'leader'; sentiment = 'positive'; confidence = 0.9
    } else if (/\b(drawback|issue|problem|avoid)\b/i.test(context)) {
      brandMention = 'negative'; sentiment = 'negative'; confidence = 0.85
    } else if (/\b(recommend|great|good|solid)\b/i.test(context)) {
      brandMention = 'recommended'; sentiment = 'positive'; confidence = 0.8
    } else if (/\b(alternative|option|also)\b/i.test(context)) {
      brandMention = 'alternative'; sentiment = 'neutral'; confidence = 0.75
    } else {
      brandMention = 'mentioned'; sentiment = 'neutral'; confidence = 0.7
    }
  }

  const competitorMentions: Record<string, string> = {}
  competitors.forEach((c: any) => {
    const name = c.name?.toLowerCase()
    if (name && lowerResponse.includes(name)) {
      competitorMentions[c.name] = 'mentioned'
    }
  })

  const snippet = mentionCount > 0 
    ? '...' + response.slice(Math.max(0, lowerResponse.indexOf(lowerBrand) - 50), 200) + '...'
    : response.slice(0, 200) + '...'

  return { brandMention, brandPosition, sentiment, confidence, mentionCount, competitorMentions, snippet }
}

function calculateNextRun(schedule: any): Date {
  const now = new Date()
  const [hours, minutes] = (schedule.time || '09:00').split(':').map(Number)
  
  const next = new Date(now)
  next.setHours(hours, minutes, 0, 0)

  switch (schedule.frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1)
      break
    case 'daily':
      if (next <= now) next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
  }

  return next
}

async function checkAlerts(supabase: any, brand: any, results: any[]) {
  if (results.length === 0) return

  // Get alert config
  const { data: alert } = await supabase
    .from('alerts')
    .select('*')
    .eq('brand_id', brand.id)
    .eq('enabled', true)
    .single()

  if (!alert) return

  // Calculate current visibility
  const scores = results.map((r: any) => {
    const scoreMap: Record<string, number> = {
      leader: 100, recommended: 75, mentioned: 50, alternative: 30, notMentioned: 0, negative: -20
    }
    return scoreMap[r.brand_mention] || 0
  })
  const currentScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length

  // Get previous scores
  const { data: prevResults } = await supabase
    .from('test_results')
    .select('brand_mention')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })
    .limit(50)
    .range(results.length, results.length + 50)

  if (prevResults && prevResults.length > 0) {
    const prevScores = prevResults.map((r: any) => {
      const scoreMap: Record<string, number> = {
        leader: 100, recommended: 75, mentioned: 50, alternative: 30, notMentioned: 0, negative: -20
      }
      return scoreMap[r.brand_mention] || 0
    })
    const prevScore = prevScores.reduce((a: number, b: number) => a + b, 0) / prevScores.length

    const drop = prevScore - currentScore
    if (drop >= alert.threshold) {
      // Send alert (call send-alert function)
      console.log(`Alert triggered for ${brand.name}: dropped ${drop}%`)
      
      // You would call another edge function or use Resend/SendGrid here
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-alert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: alert.email,
          brandName: brand.name,
          oldScore: prevScore,
          newScore: currentScore
        })
      })
    }
  }
}
