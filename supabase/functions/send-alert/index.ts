// supabase/functions/send-alert/index.ts
// Sends email alerts when visibility drops
// Uses Resend (free tier: 3,000 emails/month)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const { email, brandName, oldScore, newScore, details } = await req.json()

    if (!email || !brandName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const drop = (oldScore - newScore).toFixed(1)
    const appUrl = Deno.env.get('APP_URL') || 'https://brandaura.bigboost.agency'

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'BrandAura AI <alerts@brandaura.bigboost.agency>',
        to: [email],
        subject: `⚠️ Visibility Alert: ${brandName} dropped ${drop}%`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Visibility Alert</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #16161c 0%, #101014 100%); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px;">◈</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Alert Badge -->
                    <tr>
                      <td style="padding: 0 40px;">
                        <div style="display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 100px; padding: 8px 20px; font-size: 13px; color: #f87171; font-weight: 600;">
                          ⚠️ Visibility Drop Detected
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 30px 40px;">
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.5px;">
                          ${brandName} visibility dropped
                        </h1>
                        <p style="color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                          Your brand's AI visibility has decreased significantly. Here's what changed:
                        </p>
                        
                        <!-- Score Comparison -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 16px; overflow: hidden;">
                          <tr>
                            <td width="50%" style="padding: 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.05);">
                              <div style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Previous Score</div>
                              <div style="color: rgba(255,255,255,0.6); font-size: 42px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">${oldScore?.toFixed(0) || '--'}%</div>
                            </td>
                            <td width="50%" style="padding: 24px; text-align: center;">
                              <div style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Current Score</div>
                              <div style="color: #f87171; font-size: 42px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">${newScore?.toFixed(0) || '--'}%</div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Drop Indicator -->
                        <div style="text-align: center; margin: 24px 0;">
                          <span style="display: inline-block; background: rgba(239, 68, 68, 0.15); border-radius: 12px; padding: 12px 24px; color: #f87171; font-size: 20px; font-weight: 700;">
                            ↓ ${drop}% decrease
                          </span>
                        </div>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-size: 16px; font-weight: 700;">
                                View Full Report →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Tips Section -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px;">
                          <div style="color: #818cf8; font-size: 14px; font-weight: 600; margin-bottom: 12px;">💡 Quick Tips to Improve Visibility</div>
                          <ul style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Update your content with recent information</li>
                            <li>Add structured data to your key pages</li>
                            <li>Get mentioned in reputable publications</li>
                            <li>Monitor competitor strategies</li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
                                You're receiving this because you enabled visibility alerts for ${brandName}.
                                <br>
                                <a href="${appUrl}/dashboard?tab=settings" style="color: #818cf8; text-decoration: none;">Manage alert settings</a>
                              </p>
                            </td>
                            <td align="right">
                              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">
                                BrandAura AI
                              </p>
                            </td>
                          </tr>
                        </table>
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
Visibility Alert: ${brandName}

Your brand's AI visibility has dropped from ${oldScore?.toFixed(0)}% to ${newScore?.toFixed(0)}% (${drop}% decrease).

View your dashboard: ${appUrl}/dashboard

Tips to improve:
- Update your content with recent information
- Add structured data to your key pages
- Get mentioned in reputable publications
- Monitor competitor strategies

---
BrandAura AI
Manage alerts: ${appUrl}/dashboard?tab=settings
        `
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    const result = await response.json()

    // Log the alert
    console.log({
      event: 'alert_sent',
      email,
      brandName,
      drop,
      emailId: result.id
    })

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Send alert error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
