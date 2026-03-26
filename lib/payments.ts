import { createClient } from "@/lib/supabase/server"

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

class PaymentService {
  private supabase = createClient()

  async getPaymentSettings() {
    const { data } = await this.supabase
      .from("site_settings")
      .select("key, value")
      .in("category", ["payment", "general"])

    const settings: Record<string, any> = {}
    data?.forEach((item) => {
      settings[item.key] = item.value
    })

    return {
      paypalMode: process.env.PAYPAL_MODE || settings.paypal_mode || "sandbox",
      paypalClientId: process.env.PAYPAL_CLIENT_ID || settings.paypal_client_id || "",
      paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || settings.paypal_client_secret || "",
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || settings.paystack_public_key || "",
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || settings.paystack_secret_key || "",
      paystackMerchantEmail: process.env.PAYSTACK_MERCHANT_EMAIL || settings.paystack_merchant_email || "",
      paypalEnabled: process.env.PAYPAL_CLIENT_ID ? (settings.paypal_enabled !== false) : false,
      paystackEnabled: process.env.PAYSTACK_SECRET_KEY ? (settings.paystack_enabled !== false) : false,
      currencyRate: parseFloat(settings.currency_conversion_rate || "1650"),
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
              description: `Verify Dummy Ticket Order ${orderId}`,
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
            brand_name: "Verify Dummy Ticket",
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
      console.error("PayPal create order error:", error)
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
      console.error("PayPal capture error:", error)
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
      console.error("PayStack initialize error:", error)
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
      console.error("PayStack verify error:", error)
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
    const { error } = await this.supabase
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
