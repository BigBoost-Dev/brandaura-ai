// supabase/functions/send-digest/index.ts
// Sends weekly/daily email digests with visibility summary
// Called by cron or after scheduled tests

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const APP_URL = Deno.env.get('APP_URL') || 'https://brandaura.bigboost.agency'
    
    if (!RESEND_API_KEY || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_KEY)

    // Get request body (can specify brand_id or send to all)
    const body = await req.json().catch(() => ({}))
    const specificBrandId = body.brand_id
    const digestType = body.type || 'weekly' // daily, weekly, monthly

    // Get brands with digest enabled
    let query = supabase
      .from('brands')
      .select('*')
      .not('settings->digest->enabled', 'is', null)
    
    if (specificBrandId) {
      query = query.eq('id', specificBrandId)
    }

    const { data: brands, error: brandError } = await query

    if (brandError) throw brandError

    const brandsToEmail = (brands || []).filter((b: any) => {
      const digest = b.settings?.digest
      return digest?.enabled && digest?.email && (digest?.frequency === digestType || specificBrandId)
    })

    console.log(`Sending ${digestType} digest to ${brandsToEmail.length} brands`)

    const results = []

    for (const brand of brandsToEmail) {
      const email = brand.settings.digest.email

      // Get results from the last period
      const daysBack = digestType === 'daily' ? 1 : digestType === 'weekly' ? 7 : 30
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()

      const { data: recentResults } = await supabase
        .from('test_results')
        .select('*')
        .eq('brand_id', brand.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      if (!recentResults || recentResults.length === 0) {
        console.log(`No results for ${brand.name} in last ${daysBack} days`)
        continue
      }

      // Calculate metrics
      const scoreMap: Record<string, number> = {
        leader: 100, recommended: 75, mentioned: 50, alternative: 30, notMentioned: 0, negative: -20
      }
      
      const scores = recentResults.map((r: any) => scoreMap[r.brand_mention] || 0)
      const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      
      const mentionCounts = {
        leader: recentResults.filter((r: any) => r.brand_mention === 'leader').length,
        recommended: recentResults.filter((r: any) => r.brand_mention === 'recommended').length,
        mentioned: recentResults.filter((r: any) => r.brand_mention === 'mentioned').length,
        notMentioned: recentResults.filter((r: any) => r.brand_mention === 'notMentioned').length,
      }
      
      const totalMentioned = mentionCounts.leader + mentionCounts.recommended + mentionCounts.mentioned
      const mentionRate = Math.round((totalMentioned / recentResults.length) * 100)

      // Get previous period for comparison
      const prevSince = new Date(Date.now() - daysBack * 2 * 24 * 60 * 60 * 1000).toISOString()
      const { data: prevResults } = await supabase
        .from('test_results')
        .select('brand_mention')
        .eq('brand_id', brand.id)
        .gte('created_at', prevSince)
        .lt('created_at', since)

      let trend = 0
      if (prevResults && prevResults.length > 0) {
        const prevScores = prevResults.map((r: any) => scoreMap[r.brand_mention] || 0)
        const prevAvg = prevScores.reduce((a: number, b: number) => a + b, 0) / prevScores.length
        trend = avgScore - prevAvg
      }

      const trendEmoji = trend > 5 ? '📈' : trend < -5 ? '📉' : '➡️'
      const trendText = trend > 0 ? `+${trend.toFixed(0)}%` : `${trend.toFixed(0)}%`

      // Send email
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'BrandAura AI <reports@brandaura.bigboost.agency>',
          to: [email],
          subject: `${trendEmoji} ${brand.name} ${digestType.charAt(0).toUpperCase() + digestType.slice(1)} AI Visibility Report`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #16161c 0%, #101014 100%); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px;">
                          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; font-weight: bold; color: white;">B</div>
                        </td>
                      </tr>
                      
                      <!-- Title -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 8px;">
                            ${digestType.charAt(0).toUpperCase() + digestType.slice(1)} Visibility Report
                          </h1>
                          <p style="color: rgba(255,255,255,0.5); font-size: 16px; margin: 0;">
                            ${brand.name} • ${new Date().toLocaleDateString()}
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Score Card -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px;">
                            <tr>
                              <td width="50%" style="padding: 30px; text-align: center;">
                                <div style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 8px;">VISIBILITY SCORE</div>
                                <div style="color: #818cf8; font-size: 56px; font-weight: 800;">${avgScore}</div>
                              </td>
                              <td width="50%" style="padding: 30px; text-align: center; border-left: 1px solid rgba(99, 102, 241, 0.2);">
                                <div style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 8px;">TREND</div>
                                <div style="font-size: 36px;">${trendEmoji}</div>
                                <div style="color: ${trend >= 0 ? '#10b981' : '#ef4444'}; font-size: 20px; font-weight: 700;">${trendText}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Stats Grid -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <table width="100%" cellpadding="0" cellspacing="8">
                            <tr>
                              <td width="50%" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: center;">
                                <div style="color: #10b981; font-size: 32px; font-weight: 800;">${mentionRate}%</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 13px;">Mention Rate</div>
                              </td>
                              <td width="50%" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; text-align: center;">
                                <div style="color: #f59e0b; font-size: 32px; font-weight: 800;">${recentResults.length}</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 13px;">Total Queries</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Mention Breakdown -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <div style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 12px;">MENTION BREAKDOWN</div>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px 8px 0 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <span style="color: #10b981;">🏆</span>
                                <span style="color: rgba(255,255,255,0.8); margin-left: 8px;">Leader/Top Pick</span>
                                <span style="float: right; color: #10b981; font-weight: 700;">${mentionCounts.leader}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; background: rgba(59, 130, 246, 0.1); border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <span style="color: #3b82f6;">✓</span>
                                <span style="color: rgba(255,255,255,0.8); margin-left: 8px;">Recommended</span>
                                <span style="float: right; color: #3b82f6; font-weight: 700;">${mentionCounts.recommended}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; background: rgba(245, 158, 11, 0.1); border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <span style="color: #f59e0b;">•</span>
                                <span style="color: rgba(255,255,255,0.8); margin-left: 8px;">Mentioned</span>
                                <span style="float: right; color: #f59e0b; font-weight: 700;">${mentionCounts.mentioned}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 0 0 8px 8px;">
                                <span style="color: #ef4444;">✗</span>
                                <span style="color: rgba(255,255,255,0.8); margin-left: 8px;">Not Mentioned</span>
                                <span style="float: right; color: #ef4444; font-weight: 700;">${mentionCounts.notMentioned}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- CTA -->
                      <tr>
                        <td align="center" style="padding: 0 40px 40px;">
                          <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-size: 16px; font-weight: 700;">
                            View Full Dashboard →
                          </a>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.05);">
                          <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
                            You're receiving this ${digestType} report because you enabled email digests for ${brand.name}.
                            <br>
                            <a href="${APP_URL}/dashboard?tab=tracking-settings" style="color: #818cf8; text-decoration: none;">Manage email settings</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
          text: `
${brand.name} ${digestType.charAt(0).toUpperCase() + digestType.slice(1)} AI Visibility Report

Visibility Score: ${avgScore}
Trend: ${trendText}
Mention Rate: ${mentionRate}%

Breakdown:
- Leader: ${mentionCounts.leader}
- Recommended: ${mentionCounts.recommended}
- Mentioned: ${mentionCounts.mentioned}
- Not Mentioned: ${mentionCounts.notMentioned}

View dashboard: ${APP_URL}/dashboard
          `
        })
      })

      if (response.ok) {
        const emailResult = await response.json()
        results.push({ brand: brand.name, email, success: true, id: emailResult.id })
        console.log(`Sent digest to ${email} for ${brand.name}`)
      } else {
        const error = await response.json()
        results.push({ brand: brand.name, email, success: false, error: error.message })
        console.error(`Failed to send digest to ${email}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Send digest error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
