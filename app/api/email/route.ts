import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function sanitizeInput(input: string | undefined, maxLength: number = 200): string {
  if (!input) return ''
  return input
    .toString()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .slice(0, maxLength)
}

function sanitizeForHtml(input: string | undefined): string {
  if (!input) return ''
  return input
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface EmailRequest {
  to: string
  subject: string
  type: 'welcome' | 'password_reset' | 'order_placed' | 'order_delivered' | 'order_processing'
  data?: {
    name?: string
    orderId?: string
    resetLink?: string
    services?: string[]
    deliveryDate?: string
    trackingUrl?: string
  }
}

const getSiteSettings = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['support_email', 'site_name', 'site_logo', 'resend_api_key'])

  const settings: Record<string, string> = {}
  data?.forEach((item: { key: string; value: string }) => {
    settings[item.key] = item.value
  })

  return {
    fromEmail: settings.support_email || 'noreply@example.com',
    fromName: settings.site_name || 'My Travel Services',
    siteName: settings.site_name || 'My Travel Services',
    siteLogo: settings.site_logo || '',
    resendApiKey: settings.resend_api_key || '',
  }
}

const sendViaResend = async (to: string, subject: string, html: string, fromName: string, apiKey: string) => {
  
  if (!apiKey) {
    console.log('⚠️ RESEND_API_KEY not set - email logged only')
    console.log(`📧 Email to ${to}: ${subject}`)
    return { success: true, mock: true }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const response = await resend.emails.send({
      from: `${fromName} <noreply@resend.dev>`,
      to: [to],
      subject: subject,
      html: html,
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Resend error:', error)
    return { success: false, error }
  }
}

const getBranding = (siteName: string, siteLogo: string) => {
  const logoHtml = siteLogo 
    ? `<img src="${siteLogo}" alt="${siteName}" style="height: 40px; width: auto;">`
    : `<div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: linear-gradient(135deg, #c8143d 0%, #d94a6d 100%); border-radius: 10px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
        </svg>
      </div>`

  return { logoHtml, brandColor: '#c8143d', brandGradient: 'linear-gradient(135deg, #c8143d 0%, #d94a6d 100%)' }
}

const getWelcomeEmailHtml = (name: string, siteName: string, siteLogo: string) => {
  const { logoHtml, brandGradient } = getBranding(siteName, siteLogo)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.08);">
            <!-- Header with Logo -->
            <tr>
              <td style="background: ${brandGradient}; padding: 35px 40px 25px; border-radius: 20px 20px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      ${logoHtml}
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <h1 style="color: white; margin: 18px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to ${siteName}!</h1>
                      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Your journey starts here ✈️</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 36px 40px 30px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                  🎉 <strong>Congratulations!</strong> Your account has been successfully created. We're absolutely thrilled to have you on board!
                </p>
                
                <!-- Features Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3f4 0%, #fff5f6 100%); border-radius: 14px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <p style="color: #c8143d; font-size: 13px; font-weight: 700; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.8px;">✨ What Awaits You</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #c8143d; border-radius: 8px; margin-right: 12px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </span>
                            <span style="color: #4b5563; font-size: 14px;">Track your order status in real-time</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #c8143d; border-radius: 8px; margin-right: 12px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </span>
                            <span style="color: #4b5563; font-size: 14px;">Download & manage your travel documents</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #c8143d; border-radius: 8px; margin-right: 12px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </span>
                            <span style="color: #4b5563; font-size: 14px;">Get exclusive offers & discounts</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 24px 0 16px;">
                      <a href="#" style="display: inline-block; background: ${brandGradient}; color: white; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(200,20,61,0.3);">
                        Go to My Dashboard
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
                  Need help? Reply to this email or <a href="#" style="color: #c8143d; text-decoration: underline;">contact support</a>
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 20px 20px; border-top: 1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      ${logoHtml}
                      <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
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
`
}

const getOrderPlacedEmailHtml = (name: string, siteName: string, siteLogo: string, orderId: string, services: string[]) => {
  const { logoHtml, brandGradient } = getBranding(siteName, siteLogo)
  const servicesList = services?.map(s => {
    const icon = s === 'flight' ? '✈️' : s === 'hotel' ? '🏨' : '🛡️'
    const label = s === 'flight' ? 'Flight Reservation' : s === 'hotel' ? 'Hotel Booking' : 'Travel Insurance'
    return `<tr><td style="padding: 8px 0;"><span style="margin-right: 10px;">${icon}</span><span style="color: #4b5563; font-size: 14px;">${label}</span></td></tr>`
  }).join('') || '<tr><td style="padding: 8px 0; color: #4b5563; font-size: 14px;">Your order</td></tr>'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order Confirmed - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: ${brandGradient}; padding: 35px 40px 25px; border-radius: 20px 20px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <h1 style="color: white; margin: 18px 0 0; font-size: 24px; font-weight: 700;">Order Confirmed! 🎉</h1>
                      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Thank you for your trust</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 36px 40px 30px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                  Your order has been <strong style="color: #059669;">successfully placed!</strong> 🎊 We're now processing your request and will deliver your documents within 24 hours.
                </p>
                
                <!-- Order Details -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3f4 0%, #fff5f6 100%); border-radius: 14px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom: 16px; border-bottom: 1px solid #fecdd3;">
                            <p style="color: #c8143d; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.8px;">Order Reference</p>
                            <p style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 2px;">${orderId.slice(0, 8).toUpperCase()}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 16px;">
                            <p style="color: #c8143d; font-size: 12px; font-weight: 700; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.8px;">Services Ordered</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              ${servicesList}
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Timeline -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                  <tr>
                    <td style="padding: 0 0 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px;">
                            <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></div>
                          </td>
                          <td>
                            <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0;">Order Received</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0;">Just now</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px; border-left: 2px dashed #e5e7eb; padding-left: 5px; vertical-align: top;">
                            <div style="width: 12px; height: 12px; background: #fbbf24; border-radius: 50%;"></div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0;">Processing</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0;">Within 12 hours</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px; border-left: 2px dashed #e5e7eb; padding-left: 5px; vertical-align: top;">
                            <div style="width: 12px; height: 12px; background: #d1d5db; border-radius: 50%;"></div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0;">Documents Delivered</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0;">Within 24 hours</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
                  Track your order in your <a href="#" style="color: #c8143d; text-decoration: underline;">dashboard</a>
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 20px 20px; border-top: 1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      ${logoHtml}
                      <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
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
`
}

const getOrderDeliveredEmailHtml = (name: string, siteName: string, siteLogo: string, orderId: string, trackingUrl: string) => {
  const { logoHtml, brandGradient } = getBranding(siteName, siteLogo)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Documents Delivered - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 35px 40px 25px; border-radius: 20px 20px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </div>
                      <h1 style="color: white; margin: 18px 0 0; font-size: 24px; font-weight: 700;">Documents Delivered! 📥</h1>
                      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Your documents are ready</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 36px 40px 30px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                  🎉 <strong>Great news!</strong> Your travel documents have been successfully delivered to your email and are ready for download.
                </p>
                
                <!-- Order Details -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-radius: 14px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <p style="color: #059669; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.8px;">Order Reference</p>
                      <p style="color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px; font-family: monospace; letter-spacing: 2px;">${orderId.slice(0, 8).toUpperCase()}</p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 14px; background: white; border-radius: 10px;">
                            <p style="color: #059669; font-size: 13px; font-weight: 600; margin: 0;">✓ Documents Ready for Download</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 24px 0 16px;">
                      <a href="${trackingUrl || '#'}" style="display: inline-block; background: ${brandGradient}; color: white; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(200,20,61,0.3);">
                        Download Documents
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
                  💡 <strong>Pro tip:</strong> Keep a digital copy on your phone and print a hard copy for your visa application.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 20px 20px; border-top: 1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      ${logoHtml}
                      <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
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
`
}

const getOrderProcessingEmailHtml = (name: string, siteName: string, siteLogo: string, orderId: string) => {
  const { logoHtml, brandGradient } = getBranding(siteName, siteLogo)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order Processing - ${siteName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 35px 40px 25px; border-radius: 20px 20px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <h1 style="color: white; margin: 18px 0 0; font-size: 24px; font-weight: 700;">Order Being Processed ⏳</h1>
                      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">We're working on your documents</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 36px 40px 30px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                  🔄 Your order is currently being processed by our team. We're generating your travel documents with valid PNR codes.
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #fffbeb; border-radius: 14px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <p style="color: #d97706; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.8px;">Order Reference</p>
                      <p style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0;">${orderId.slice(0, 8).toUpperCase()}</p>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
                  📧 You'll receive another email once your documents are ready for download.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 20px 20px; border-top: 1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      ${logoHtml}
                      <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
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
`
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { to, subject, type, data } = body

    if (!to || !subject || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, type' },
        { status: 400 }
      )
    }

    const { siteName, siteLogo, fromName, resendApiKey } = await getSiteSettings()

    const sanitizedName = sanitizeInput(data?.name, 100)
    const sanitizedOrderId = sanitizeInput(data?.orderId, 50)

    let html = ''
    switch (type) {
      case 'welcome':
        html = getWelcomeEmailHtml(sanitizedName || 'Customer', siteName, siteLogo)
        break
      case 'order_placed':
        html = getOrderPlacedEmailHtml(sanitizedName || 'Customer', siteName, siteLogo, sanitizedOrderId || '', data?.services || [])
        break
      case 'order_delivered':
        html = getOrderDeliveredEmailHtml(sanitizedName || 'Customer', siteName, siteLogo, sanitizedOrderId || '', data?.trackingUrl || '')
        break
      case 'order_processing':
        html = getOrderProcessingEmailHtml(sanitizedName || 'Customer', siteName, siteLogo, sanitizedOrderId || '')
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const result = await sendViaResend(to, subject, html, fromName, resendApiKey)

    return NextResponse.json({
      success: result.success,
      message: result.mock ? 'Email logged (configure RESEND_API_KEY)' : 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}