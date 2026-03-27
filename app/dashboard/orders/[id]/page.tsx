import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OrderSupportSection } from "@/components/order-support-section"
import { OrderDocuments } from "@/components/dashboard/order-documents"
import { OrderProgressTracker } from "@/components/dashboard/order-progress-tracker"
import { ArrowLeft, Plane, Building2, Shield, User, Package } from "lucide-react"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  const { data: travelers } = await supabase
    .from("travelers")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true })

  const { data: documents } = await supabase
    .from("order_documents")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false })

  const services = order.services || []
  const hasFlight = services.includes("flight")
  const hasHotel = services.includes("hotel")
  const hasInsurance = services.includes("insurance")

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`
    return `₦${amount.toLocaleString()}`
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge
            variant={order.status === "completed" ? "default" : "secondary"}
            className={order.status === "completed" ? "bg-green-500" : ""}
          >
            {order.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderProgressTracker status={order.status} paymentStatus={order.payment_status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p className="font-medium capitalize">{order.payment_status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{order.payment_method || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">
                  {formatCurrency(order.total_amount, order.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Method</p>
                <p className="font-medium capitalize">{order.delivery_method || "Email"}</p>
              </div>
              {order.coupon_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Coupon Applied</p>
                  <p className="font-medium font-mono">{order.coupon_code}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Services</p>
              <div className="flex flex-wrap gap-2">
                {hasFlight && (
                  <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
                    <Plane className="h-4 w-4" />
                    Flight Ticket
                  </div>
                )}
                {hasHotel && (
                  <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
                    <Building2 className="h-4 w-4" />
                    Hotel Booking
                  </div>
                )}
                {hasInsurance && (
                  <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
                    <Shield className="h-4 w-4" />
                    Travel Insurance
                  </div>
                )}
              </div>
            </div>

            {travelers && travelers.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Travelers</p>
                  <div className="space-y-2">
                    {travelers.map((traveler) => (
                      <div key={traveler.id} className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {traveler.first_name} {traveler.last_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <OrderDocuments orderId={order.id} documents={documents || []} orderEmail={order.email} />

        <OrderSupportSection />
      </div>
    </div>
  )
}