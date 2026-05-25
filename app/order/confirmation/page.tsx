"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useSiteSettings } from "@/lib/site-settings"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
} from "lucide-react"

type PaymentStatus = "success" | "failed" | "cancelled" | "error" | null

function StatusIcon({ status }: { status: PaymentStatus }) {
  if (status === "success")
    return <CheckCircle2 className="h-10 w-10 text-green-500" />
  if (status === "cancelled")
    return <XCircle className="h-10 w-10 text-yellow-500" />
  if (status === "failed" || status === "error")
    return <XCircle className="h-10 w-10 text-destructive" />
  // No payment param — came from non-payment flow
  return <CheckCircle2 className="h-10 w-10 text-primary" />
}

function StatusContent({
  status,
  orderId,
  supportEmail,
  sitePhone,
}: {
  status: PaymentStatus
  orderId: string | null
  supportEmail: string
  sitePhone: string
}) {
  if (status === "failed") {
    return {
      iconBg: "bg-destructive/10",
      title: "Payment Failed",
      description: "Your payment could not be processed. Your order has been saved — you can retry payment from your dashboard.",
      steps: null,
      cta: (
        <div className="flex flex-col sm:flex-row gap-3">
          {orderId && (
            <Link href={`/dashboard/orders/${orderId}`} className="flex-1">
              <Button className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Payment
              </Button>
            </Link>
          )}
          <Link href="/order" className="flex-1">
            <Button variant="outline" className="w-full">Start New Order</Button>
          </Link>
        </div>
      ),
    }
  }

  if (status === "cancelled") {
    return {
      iconBg: "bg-yellow-100",
      title: "Payment Cancelled",
      description: "You cancelled the payment. Your order has been saved — retry from your dashboard whenever you're ready.",
      steps: null,
      cta: (
        <div className="flex flex-col sm:flex-row gap-3">
          {orderId && (
            <Link href={`/dashboard/orders/${orderId}`} className="flex-1">
              <Button className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Payment
              </Button>
            </Link>
          )}
          <Link href="/order" className="flex-1">
            <Button variant="outline" className="w-full">Start New Order</Button>
          </Link>
        </div>
      ),
    }
  }

  if (status === "error") {
    return {
      iconBg: "bg-destructive/10",
      title: "Something Went Wrong",
      description:
        "We couldn't verify your payment. If money was deducted, please contact support immediately with your order reference.",
      steps: null,
      cta: (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`mailto:${supportEmail}`} className="flex-1">
            <Button className="w-full gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">Back to Home</Button>
          </Link>
        </div>
      ),
    }
  }

  // success or no payment param (non-payment flow)
  return {
    iconBg: "bg-green-100",
    title: "Order Received!",
    description: "Thank you for your order. We’re processing it now.",
    steps: (
      <div className="text-left space-y-4">
        <h3 className="font-semibold">What happens next?</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
              1
            </span>
            <span>We’ll review your order and start preparing your documents.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
              2
            </span>
            <span>You will receive your documents via email within 24 hours.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
              3
            </span>
            <span>If you have any questions, our support team is available 24/7.</span>
          </li>
        </ol>
      </div>
    ),
    cta: (
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full gap-2">
            View My Orders
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">Back to Home</Button>
        </Link>
      </div>
    ),
  }
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const { settings } = useSiteSettings()
  const sitePhone = settings?.site_phone || "+27 68 707 6011"
  const supportEmail = settings?.support_email || "support@example.com"
  const orderId = searchParams.get("id")
  const paymentParam = searchParams.get("payment") as PaymentStatus

  const content = StatusContent({ status: paymentParam, orderId, supportEmail, sitePhone })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="text-center">
            <CardHeader>
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${content.iconBg}`}>
                <StatusIcon status={paymentParam} />
              </div>
              <CardTitle className="text-2xl">{content.title}</CardTitle>
              <CardDescription className="text-base">{content.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {orderId && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Order Reference</p>
                  <p className="font-mono font-semibold text-lg">{orderId.slice(0, 8).toUpperCase()}</p>
                </div>
              )}

              {content.steps}
              {content.cta}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">Need help?</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {supportEmail}
                  </Link>
                  <Link
                    href={`https://wa.me/${sitePhone.replace(/\D/g, "")}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp Support
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-2xl px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmationContent />
    </Suspense>
  )
}
