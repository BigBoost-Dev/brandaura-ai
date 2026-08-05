// supabase/functions/query-ai/index.ts
// This Edge Function securely proxies requests to OpenRouter
// Your API key stays on the server and is never exposed to clients

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get API key from environment (set via: supabase secrets set OPENROUTER_API_KEY=xxx)
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    // Either provider is acceptable; per-model check happens once we know the model.
    if (!OPENROUTER_API_KEY && !Deno.env.get('OPENAI_API_KEY')) {
      throw new Error('No AI provider key configured')
    }

    // Verify user is authenticated
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile to check rate limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_calls_used, api_calls_limit, plan')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Check rate limit
    if (profile && profile.api_calls_used >= profile.api_calls_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Upgrade your plan for more API calls.',
          usage: { used: profile.api_calls_used, limit: profile.api_calls_limit }
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { model, query } = await req.json()

    if (!model || !query) {
      return new Response(
        JSON.stringify({ error: 'Missing model or query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenRouter API
    const startTime = Date.now()
    
    // --- OpenAI Responses API lane: ChatGPT models return fan-out queries + citations ---
    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')
    const lowerModel = String(model).toLowerCase()
    const isChatGPT = lowerModel.indexOf('gpt') === 0 || lowerModel.indexOf('openai/') === 0 || lowerModel.indexOf('o3') === 0 || lowerModel.indexOf('o4') === 0

    if (isChatGPT && OPENAI_KEY) {
      const oaiModel = lowerModel.indexOf('openai/') === 0 ? String(model).slice(7) : String(model)
      const oaiRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + OPENAI_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: oaiModel,
          tools: [{ type: 'web_search' }],
          tool_choice: 'auto',
          instructions: 'You are a research assistant answering a user question. You MUST use the web_search tool to look up current information before you answer. Run several targeted web searches with different queries, covering the question from multiple angles. Do not answer from prior knowledge alone.',
          input: query
        })
      })

      if (!oaiRes.ok) {
        const errTxt = await oaiRes.text()
        console.error('OpenAI Responses error:', errTxt.slice(0, 300))
        return new Response(
          JSON.stringify({ error: 'OpenAI API error: ' + oaiRes.status }),
          { status: oaiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const oai = await oaiRes.json()
      const out = oai.output || []
      const fanout = []
      const citations = []
      let text = ''

      for (const item of out) {
        if (item.type === 'web_search_call') {
          const act = item.action || {}
          if (Array.isArray(act.queries)) {
            for (const q of act.queries) { if (q && fanout.indexOf(q) === -1) fanout.push(q) }
          } else if (act.query && fanout.indexOf(act.query) === -1) {
            fanout.push(act.query)
          }
        }
        if (item.type === 'message' && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === 'output_text') {
              text += c.text || ''
              const anns = c.annotations || []
              for (const an of anns) {
                if (an.type === 'url_citation') citations.push({ url: an.url, title: an.title || '' })
              }
            }
          }
        }
      }

      const responseTimeOai = Date.now() - startTime

      if (profile) {
        await supabase.from('profiles')
          .update({ api_calls_used: profile.api_calls_used + 1, updated_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      return new Response(JSON.stringify({
        id: oai.id,
        model: oaiModel,
        choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
        usage: oai.usage,
        fanout_queries: fanout,
        citations: citations,
        response_time: responseTimeOai
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENROUTER_API_KEY not configured for model: ' + model }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') || 'https://aivisibility.app',
        'X-Title': 'AI Visibility Tracker'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: query }],
        max_tokens: 1500,
        temperature: 0.7
      })
    })

    const responseTime = Date.now() - startTime

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}))
      console.error('OpenRouter error:', errorData)
      return new Response(
        JSON.stringify({ error: errorData.error?.message || `OpenRouter API error: ${aiResponse.status}` }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await aiResponse.json()

    // Increment usage counter
    if (profile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          api_calls_used: profile.api_calls_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update usage:', updateError)
      }
    }

    // Log the request (optional - for analytics)
    console.log({
      user_id: user.id,
      model,
      query_length: query.length,
      response_time: responseTime,
      tokens: data.usage
    })

    // Return the response
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
