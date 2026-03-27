import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

export interface PayStackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PayStackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    currency: string
    customer: {
      email: string
    }
  }
}

interface PaymentSettings {
  paypalMode: "sandbox" | "live"
  paypalClientId: string
  paypalClientSecret: string
  paystackPublicKey: string
  paystackSecretKey: string
  paystackMerchantEmail: string
  paypalEnabled: boolean
  paystackEnabled: boolean
  cardEnabled: boolean
  currencyRate: number
  brandName: string
}

class PaymentService {
  private async getSupabase() {
    return createClient()
  }

  private async getSiteName(): Promise<string> {
    try {
      const supabase = await this.getSupabase()
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_name")
        .single()
      
      if (data?.value) {
        const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value
        return parsed.replace(/"/g, "") || "Verify Dummy Ticket"
      }
    } catch (error) {
      logger.error("Failed to fetch site name", error as Error)
    }
    return "Verify Dummy Ticket"
  }

  private async getPaymentFlags(): Promise<{ paypal: boolean; paystack: boolean; card: boolean; paypalMode: string }> {
    try {
      const supabase = await this.getSupabase()
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["paypal_enabled", "paystack_enabled", "card_enabled", "paypal_mode"])

      const flags: Record<string, any> = {}
      data?.forEach((item: { key: string; value: any }) => {
        flags[item.key] = item.value
      })

      return {
        paypal: flags.paypal_enabled !== false && flags.paypal_enabled !== "false",
        paystack: flags.paystack_enabled !== false && flags.paystack_enabled !== "false",
        card: flags.card_enabled !== false && flags.card_enabled !== "false",
        paypalMode: flags.paypal_mode || "sandbox",
      }
    } catch (error) {
      logger.error("Failed to fetch payment flags", error as Error)
      return { paypal: true, paystack: true, card: true, paypalMode: "sandbox" }
    }
  }

  async getPaymentSettings(): Promise<PaymentSettings> {
    const supabase = await this.getSupabase()
    const flags = await this.getPaymentFlags()
    const siteName = await this.getSiteName()

    const paypalClientId = process.env.PAYPAL_CLIENT_ID || ""
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || ""
    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY || ""
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || ""
    const paystackMerchantEmail = process.env.PAYSTACK_MERCHANT_EMAIL || ""

    const hasPayPalSecrets = !!(paypalClientId && paypalClientSecret)
    const hasPayStackSecrets = !!(paystackPublicKey && paystackSecretKey)

    return {
      paypalMode: (process.env.PAYPAL_MODE as "sandbox" | "live") || flags.paypalMode as "sandbox" | "live",
      paypalClientId,
      paypalClientSecret,
      paystackPublicKey,
      paystackSecretKey,
      paystackMerchantEmail,
      paypalEnabled: hasPayPalSecrets && flags.paypal,
      paystackEnabled: hasPayStackSecrets && flags.paystack,
      cardEnabled: flags.card,
      currencyRate: 1650,
      brandName: siteName,
    }
  }

  // PayPal Methods
  async createPayPalOrder(
    amount: number,
    currency: string,
    orderId: string,
    customerEmail: string
  ): Promise<{ success: boolean; approvalUrl?: string; orderId?: string; error?: string }> {
    const settings = await this.getPaymentSettings()

    if (!settings.paypalEnabled) {
      return { success: false, error: "PayPal is not enabled" }
    }

    const baseUrl = settings.paypalMode === "sandbox"
      ? "https://api.sandbox.paypal.com"
      : "https://api.paypal.com"

    try {
      // Get access token
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${settings.paypalClientId}:${settings.paypalClientSecret}`
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        return { success: false, error: `Failed to get PayPal token: ${error}` }
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Create order
      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
              {
                reference_id: orderId,
                description: `${settings.brandName} Order ${orderId}`,
                amount: {
                  currency_code: currency,
                  value: amount.toFixed(2),
                },
                payer: {
                  email_address: customerEmail,
                },
              },
            ],
            application_context: {
              brand_name: settings.brandName,
              landing_page: "BILLING",
              user_action: "PAY_NOW",
              return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/confirmation?id=${orderId}`,
              cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order?cancelled=true`,
            },
          }),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.text()
        return { success: false, error: `Failed to create PayPal order: ${error}` }
      }

      const orderData: PayPalOrderResponse = await orderResponse.json()
      const approvalUrl = orderData.links.find((link) => link.rel === "approve")?.href

      if (!approvalUrl) {
        return { success: false, error: "No approval URL found" }
      }

      return { success: true, approvalUrl, orderId: orderData.id }
    } catch (error) {
      logger.error("PayPal create order error", error as Error)
      return { success: false, error: "Failed to create PayPal order" }
    }
  }

  async capturePayPalOrder(paypalOrderId: string): Promise<{ success: boolean; error?: string }> {
    const settings = await this.getPaymentSettings()

    const baseUrl = settings.paypalMode === "sandbox"
      ? "https://api.sandbox.paypal.com"
      : "https://api.paypal.com"

    try {
      // Get access token
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${settings.paypalClientId}:${settings.paypalClientSecret}`
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      })

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Capture order
      const captureResponse = await fetch(
        `${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!captureResponse.ok) {
        const error = await captureResponse.text()
        return { success: false, error: `Failed to capture PayPal order: ${error}` }
      }

      return { success: true }
    } catch (error) {
      logger.error("PayPal capture error", error as Error)
      return { success: false, error: "Failed to capture PayPal order" }
    }
  }

  // PayStack Methods
  async initializePaystack(
    amount: number,
    email: string,
    orderId: string,
    currency: string = "NGN"
  ): Promise<{ success: boolean; authorizationUrl?: string; reference?: string; error?: string }> {
    const settings = await this.getPaymentSettings()

    if (!settings.paystackEnabled) {
      return { success: false, error: "PayStack is not enabled" }
    }

    if (!settings.paystackSecretKey) {
      return { success: false, error: "PayStack secret key not configured" }
    }

    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.paystackSecretKey}`,
        },
        body: JSON.stringify({
          email,
          amount: currency === "NGN" ? Math.round(amount * 100) : Math.round(amount * 100), // PayStack uses kobo/cents
          currency,
          reference: `VDT_${orderId}_${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/confirmation?id=${orderId}`,
          metadata: {
            order_id: orderId,
          },
        }),
      })

      const data: PayStackInitializeResponse = await response.json()

      if (!data.status) {
        return { success: false, error: data.message }
      }

      return {
        success: true,
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
      }
    } catch (error) {
      logger.error("PayStack initialize error", error as Error)
      return { success: false, error: "Failed to initialize PayStack payment" }
    }
  }

  async verifyPaystack(reference: string): Promise<PayStackVerifyResponse> {
    const settings = await this.getPaymentSettings()

    if (!settings.paystackSecretKey) {
      return {
        status: false,
        message: "PayStack secret key not configured",
        data: {} as any,
      }
    }

    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${settings.paystackSecretKey}`,
          },
        }
      )

      const data: PayStackVerifyResponse = await response.json()
      return data
    } catch (error) {
      logger.error("PayStack verify error", error as Error)
      return {
        status: false,
        message: "Failed to verify payment",
        data: {} as any,
      }
    }
  }

  // Update order payment status
  async updateOrderPayment(
    orderId: string,
    paymentStatus: "paid" | "failed" | "unpaid",
    paymentMethod: string,
    paymentReference?: string
  ) {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        status: paymentStatus === "paid" ? "processing" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    return { error }
  }
}

export const paymentService = new PaymentService()
