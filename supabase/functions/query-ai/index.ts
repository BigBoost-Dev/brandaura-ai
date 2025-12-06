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
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured')
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
