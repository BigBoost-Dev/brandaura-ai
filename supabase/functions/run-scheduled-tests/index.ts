// supabase/functions/run-scheduled-tests/index.ts
// Runs scheduled tracking using Topic Wizard configuration
// Triggered by pg_cron or external scheduler

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AI Engines (matches Topic Wizard configuration)
const AI_ENGINES: Record<string, { model: string; name: string }> = {
  'chatgpt-auto': { model: 'openai/gpt-4o', name: 'ChatGPT' },
  'chatgpt-search': { model: 'openai/gpt-4o', name: 'ChatGPT Search' },
  'gemini': { model: 'google/gemini-2.0-flash-001', name: 'Gemini' },
  'perplexity': { model: 'perplexity/sonar-pro', name: 'Perplexity' },
  'claude': { model: 'anthropic/claude-sonnet-4', name: 'Claude' },
  'google-ai-mode': { model: 'google/gemini-2.0-flash-001', name: 'Google AI' },
  // Legacy platform IDs
  'gpt-4o': { model: 'openai/gpt-4o', name: 'ChatGPT' },
  'claude-sonnet': { model: 'anthropic/claude-sonnet-4', name: 'Claude' },
  'gemini-flash': { model: 'google/gemini-2.0-flash-001', name: 'Gemini' },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    
    if (!OPENROUTER_API_KEY || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_KEY)

    // Get brands with schedules due to run
    const now = new Date()
    const { data: brands, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .not('settings', 'is', null)
      .not('settings->frequency', 'is', null)

    if (brandError) throw brandError

    // Filter brands that need to run
    const brandsToRun = (brands || []).filter((brand: any) => {
      const settings = brand.settings || {}
      const frequency = settings.frequency || 'weekly'
      const lastRun = brand.last_tracking_run ? new Date(brand.last_tracking_run) : null
      
      if (!lastRun) return true // Never run, should run
      
      const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
      
      switch (frequency) {
        case 'daily': return hoursSinceLastRun >= 24
        case 'weekly': return hoursSinceLastRun >= 168
        case 'monthly': return hoursSinceLastRun >= 720
        default: return hoursSinceLastRun >= 168
      }
    })

    console.log(`Found ${brandsToRun.length} brands to run`)

    const allResults = []

    for (const brand of brandsToRun) {
      const settings = brand.settings || {}
      const prompts = settings.prompts || []
      const engines = settings.engines || ['chatgpt-auto', 'perplexity', 'gemini']

      if (prompts.length === 0) {
        console.log(`Skipping ${brand.name}: no prompts configured`)
        continue
      }

      console.log(`Running tracking for ${brand.name}: ${prompts.length} prompts × ${engines.length} engines`)

      const batchId = Date.now().toString()
      const testResults = []

      for (const prompt of prompts) {
        for (const engineId of engines) {
          const engine = AI_ENGINES[engineId]
          if (!engine) continue

          try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: engine.model,
                messages: [{ role: 'user', content: prompt.text }],
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
                platform_id: engineId,
                platform_name: engine.name,
                model: engine.model,
                query: prompt.text,
                query_type: prompt.type || 'branded',
                topic_id: prompt.topicId,
                topic_name: prompt.topicName,
                prompt_persona: prompt.persona,
                prompt_intent: prompt.intent,
                brand_mention: analysis.brandMention,
                brand_position: analysis.brandPosition,
                sentiment: analysis.sentiment,
                confidence: analysis.confidence,
                mention_count: analysis.mentionCount,
                competitor_mentions: analysis.competitorMentions,
                snippet: analysis.snippet,
                full_response: text,
                cited_urls: analysis.citedUrls,
                cost: data.usage ? (data.usage.prompt_tokens * 0.000001 + data.usage.completion_tokens * 0.000002) : 0
              })
            }
          } catch (err) {
            console.error(`Error querying ${engine.name}:`, err)
          }

          await new Promise(r => setTimeout(r, 1000))
        }
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

      // Update last_tracking_run
      await supabase
        .from('brands')
        .update({ last_tracking_run: now.toISOString() })
        .eq('id', brand.id)

      // Check for alerts
      await checkAlerts(supabase, brand, testResults, SUPABASE_URL, SUPABASE_SERVICE_KEY)

      allResults.push({
        brand: brand.name,
        tests: testResults.length,
        prompts: prompts.length,
        engines: engines.length
      })
    }

    return new Response(
      JSON.stringify({ success: true, results: allResults }),
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
    
    if (/\b(top pick|best choice|#1|highly recommend|winner|best overall)\b/i.test(context)) {
      brandMention = 'leader'; sentiment = 'positive'; confidence = 0.9
    } else if (/\b(drawback|issue|problem|avoid|not recommended)\b/i.test(context)) {
      brandMention = 'negative'; sentiment = 'negative'; confidence = 0.85
    } else if (/\b(recommend|great|good|solid|excellent)\b/i.test(context)) {
      brandMention = 'recommended'; sentiment = 'positive'; confidence = 0.8
    } else if (/\b(alternative|option|also consider)\b/i.test(context)) {
      brandMention = 'alternative'; sentiment = 'neutral'; confidence = 0.75
    } else {
      brandMention = 'mentioned'; sentiment = 'neutral'; confidence = 0.7
    }

    // Find position in lists
    const lines = response.split('\n')
    for (const line of lines) {
      if (line.toLowerCase().includes(lowerBrand)) {
        const match = line.match(/^\s*(\d+)[\.\)\:\-]/)
        if (match) {
          brandPosition = parseInt(match[1])
          break
        }
      }
    }
  }

  const competitorMentions: Record<string, string> = {}
  competitors.forEach((c: any) => {
    const name = (c.name || c).toLowerCase()
    if (lowerResponse.includes(name)) {
      const cIdx = lowerResponse.indexOf(name)
      const cCtx = lowerResponse.slice(Math.max(0, cIdx - 100), Math.min(lowerResponse.length, cIdx + 150))
      if (/\b(top|best|leading|winner)\b/i.test(cCtx)) {
        competitorMentions[c.name || c] = 'leader'
      } else if (/\b(recommend|great|good)\b/i.test(cCtx)) {
        competitorMentions[c.name || c] = 'recommended'
      } else {
        competitorMentions[c.name || c] = 'mentioned'
      }
    }
  })

  // Extract URLs
  const urlPattern = /https?:\/\/[^\s\)\"\>\]]+/g
  const citedUrls = response.match(urlPattern) || []

  const snippet = mentionCount > 0 
    ? '...' + response.slice(Math.max(0, lowerResponse.indexOf(lowerBrand) - 50), 200) + '...'
    : response.slice(0, 200) + '...'

  return { brandMention, brandPosition, sentiment, confidence, mentionCount, competitorMentions, snippet, citedUrls }
}

async function checkAlerts(supabase: any, brand: any, results: any[], supabaseUrl: string, serviceKey: string) {
  if (results.length === 0) return

  const settings = brand.settings || {}
  const alertConfig = settings.alerts || {}
  
  if (!alertConfig.enabled || !alertConfig.email) return

  // Calculate current score
  const scoreMap: Record<string, number> = {
    leader: 100, recommended: 75, mentioned: 50, alternative: 30, notMentioned: 0, negative: -20
  }
  const scores = results.map((r: any) => scoreMap[r.brand_mention] || 0)
  const currentScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length

  // Get previous scores
  const { data: prevResults } = await supabase
    .from('test_results')
    .select('brand_mention')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })
    .range(results.length, results.length + 50)

  if (prevResults && prevResults.length > 0) {
    const prevScores = prevResults.map((r: any) => scoreMap[r.brand_mention] || 0)
    const prevScore = prevScores.reduce((a: number, b: number) => a + b, 0) / prevScores.length

    const drop = prevScore - currentScore
    const threshold = alertConfig.threshold || 10

    if (drop >= threshold) {
      console.log(`Alert triggered for ${brand.name}: dropped ${drop.toFixed(1)}%`)
      
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-alert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: alertConfig.email,
            brandName: brand.name,
            oldScore: prevScore,
            newScore: currentScore,
            drop: drop
          })
        })
      } catch (err) {
        console.error('Failed to send alert:', err)
      }
    }
  }
}
