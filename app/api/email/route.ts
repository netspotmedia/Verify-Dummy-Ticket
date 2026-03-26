import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface EmailRequest {
  to: string
  subject: string
  type: 'welcome' | 'password_reset' | 'order_confirmation'
  data?: {
    name?: string
    orderId?: string
    resetLink?: string
  }
}

const getEmailSettings = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['support_email', 'site_name'])

  const settings: Record<string, string> = {}
  data?.forEach((item: { key: string; value: string }) => {
    settings[item.key] = item.value
  })

  return {
    fromEmail: settings.support_email || 'noreply@example.com',
    siteName: settings.site_name || 'My Travel Services',
  }
}

const getWelcomeEmailHtml = (name: string, siteName: string) => `
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
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #c8143d 0%, #d94a6d 100%); padding: 40px 40px 30px; border-radius: 16px 16px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </div>
                      <h1 style="color: white; margin: 20px 0 0; font-size: 28px; font-weight: 700;">Welcome to ${siteName}!</h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px;">
                  Thank you for choosing <strong>${siteName}</strong>! We're thrilled to have you on board and we're committed to making your visa application journey as smooth as possible.
                </p>
                
                <!-- Features Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3f4; border-radius: 12px; margin: 25px 0;">
                  <tr>
                    <td style="padding: 24px;">
                      <p style="color: #c8143d; font-size: 14px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 0.5px;">What you can do now:</p>
                      <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                        <li>Track your order status in real-time</li>
                        <li>View and download your travel documents</li>
                        <li>Access exclusive offers and discounts</li>
                        <li>Get 24/7 support for any queries</li>
                      </ul>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c8143d 0%, #d94a6d 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px;">
                        Explore Your Dashboard
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 25px 0 0;">
                  Having trouble? Our support team is here to help. Just reply to this email or reach out anytime.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} ${siteName}. All rights reserved.
                </p>
                <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 8px 0 0;">
                  This email was sent because you created an account with us.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

const getPasswordResetHtml = (name: string, siteName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #c8143d 0%, #d94a6d 100%); padding: 40px 40px 30px; border-radius: 16px 16px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <h1 style="color: white; margin: 20px 0 0; font-size: 26px; font-weight: 700;">Reset Your Password</h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px;">
                  We received a request to reset your password. Click the button below to create a new password for your account.
                </p>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #c8143d 0%, #d94a6d 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 25px 0 0;">
                  This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} ${siteName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

const getOrderConfirmationHtml = (name: string, siteName: string, orderId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 40px 40px 30px; border-radius: 16px 16px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <h1 style="color: white; margin: 20px 0 0; font-size: 26px; font-weight: 700;">Order Confirmed!</h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px;">
                  Your order has been successfully placed! 🎉 We're now processing your request and will deliver your documents within 24 hours.
                </p>
                
                <div style="background: #fef3f4; border-radius: 12px; padding: 20px; margin: 25px 0;">
                  <p style="color: #c8143d; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Order Reference</p>
                  <p style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0; font-family: monospace;">${orderId.slice(0, 8).toUpperCase()}</p>
                </div>
                
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 25px 0 0;">
                  You can track your order status and download your documents from your dashboard.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} ${siteName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

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

    const { fromEmail, siteName } = await getEmailSettings()

    let html = ''
    switch (type) {
      case 'welcome':
        html = getWelcomeEmailHtml(data?.name || 'Customer', siteName)
        break
      case 'password_reset':
        html = getPasswordResetHtml(data?.name || 'Customer', siteName, data?.resetLink || '')
        break
      case 'order_confirmation':
        html = getOrderConfirmationHtml(data?.name || 'Customer', siteName, data?.orderId || '')
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    // Log email for now - in production integrate with Resend/SendGrid
    console.log('📧 Email queued:', { to, subject, type, fromEmail })

    return NextResponse.json({
      success: true,
      message: 'Email queued for delivery'
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}