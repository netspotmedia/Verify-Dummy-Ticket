"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, Clock, RefreshCw, XCircle, Loader2, AlertCircle,
  Plane, Hotel, Shield, ArrowRight
} from "lucide-react"

type OrderStatus = "pending" | "processing" | "completed" | "cancelled"
type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed"

interface PublicOrder {
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  services: string[]
  currency: string
  total_amount: number
  created_at: string
}

function statusConfig(status: OrderStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock }
    case "processing":
      return { label: "Processing", color: "bg-blue-100 text-blue-800 border-blue-200", icon: RefreshCw }
    case "completed":
      return { label: "Completed", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 }
    case "cancelled":
      return { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
  }
}

function paymentConfig(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return { label: "Paid", color: "bg-green-100 text-green-800 border-green-200" }
    case "unpaid":
      return { label: "Awaiting Payment", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    case "failed":
      return { label: "Payment Failed", color: "bg-red-100 text-red-800 border-red-200" }
    case "refunded":
      return { label: "Refunded", color: "bg-gray-100 text-gray-700 border-gray-200" }
  }
}

function serviceIcon(service: string) {
  if (service === "flight") return <Plane className="h-4 w-4" />
  if (service === "hotel") return <Hotel className="h-4 w-4" />
  return <Shield className="h-4 w-4" />
}

function serviceLabel(service: string) {
  if (service === "flight") return "Flight Reservation"
  if (service === "hotel") return "Hotel Booking"
  return "Travel Insurance"
}

function OrderStatusContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ref) {
      setError("No order reference provided.")
      setLoading(false)
      return
    }

    fetch(`/api/orders/status?ref=${encodeURIComponent(ref)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setOrder(data)
      })
      .catch(() => setError("Could not load order details."))
      .finally(() => setLoading(false))
  }, [ref])

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (error || !order) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">{error || "Order not found."}</p>
            <Link href="/order">
              <Button variant="outline">Place a New Order</Button>
            </Link>
          </CardContent>
        </Card>
      )
    }

    const sc = statusConfig(order.status)
    const pc = paymentConfig(order.payment_status)
    const StatusIcon = sc.icon
    const formatted = new Date(order.created_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    })
    const amount = order.currency === "NGN"
      ? `₦${Math.round(order.total_amount).toLocaleString()}`
      : `$${order.total_amount.toFixed(2)}`

    return (
      <Card>
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <StatusIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Order {order.order_number}</CardTitle>
          <CardDescription>Placed on {formatted}</CardDescription>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge className={`border text-xs ${sc.color}`}>{sc.label}</Badge>
            <Badge className={`border text-xs ${pc.color}`}>{pc.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Services</p>
            <ul className="space-y-2">
              {(order.services || []).map(s => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span className="text-primary">{serviceIcon(s)}</span>
                  {serviceLabel(s)}
                </li>
              ))}
            </ul>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold text-lg">{amount}</span>
          </div>

          {/* Progress timeline */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Progress</p>
            {(["pending", "processing", "completed"] as OrderStatus[]).map((step, i) => {
              const passed = ["pending", "processing", "completed"].indexOf(order.status) >= i
              const isCurrent = order.status === step
              return (
                <div key={step} className="flex items-start gap-3 mb-3">
                  <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    passed ? "border-primary bg-primary" : "border-muted-foreground/30 bg-transparent"
                  }`}>
                    {passed && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium capitalize ${isCurrent ? "text-primary" : passed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step === "pending" ? "Order Received" : step === "processing" ? "Documents Being Prepared" : "Documents Delivered"}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step === "pending" ? "Your order is queued for processing." : step === "processing" ? "Our team is working on your documents." : "Check your email for download links."}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {order.payment_status === "unpaid" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              Your payment is pending. If you need to retry, please log into your{" "}
              <Link href="/dashboard" className="font-medium underline">dashboard</Link>.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
            <Link href="/order" className="flex-1">
              <Button className="w-full gap-2">
                New Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-xl px-4">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground mt-1 text-sm">Real-time status for your travel documents</p>
          </div>
          {renderBody()}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <SiteFooter />
      </div>
    }>
      <OrderStatusContent />
    </Suspense>
  )
}
