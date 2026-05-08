import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plane, Building2, Shield, User, Mail, Globe } from "lucide-react"
import { OrderStatusActions } from "@/components/admin/order-status-actions"
import { OrderDocumentUpload } from "@/components/admin/order-document-upload"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : await createClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Fetch related data with separate queries — errors return empty arrays, never 404
  const [
    { data: flightDetails },
    { data: hotelDetails },
    { data: insuranceDetails },
    { data: travelers },
  ] = await Promise.all([
    supabase.from("flight_details").select("*").eq("order_id", id),
    supabase.from("hotel_details").select("*").eq("order_id", id),
    supabase.from("insurance_details").select("*").eq("order_id", id),
    supabase.from("travelers").select("*").eq("order_id", id),
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="text-base px-3 py-1">Pending</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-base px-3 py-1">Processing</Badge>
      case "completed":
        return <Badge className="bg-accent/10 text-accent border-accent/20 text-base px-3 py-1">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive" className="text-base px-3 py-1">Cancelled</Badge>
      default:
        return <Badge variant="outline" className="text-base px-3 py-1">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number | null | undefined, currency: string) => {
    if (amount == null) return "—"
    if (currency === "USD") return `$${Number(amount).toFixed(2)}`
    return `₦${Number(amount).toLocaleString()}`
  }

  const formatDelivery = (method: string | null | undefined) => {
    switch (method) {
      case "fast": return "Fast (12 hours)"
      case "express": return "Express (6 hours)"
      default: return "Normal (24 hours)"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {order.order_number
                ? order.order_number.toString().toUpperCase()
                : `Order #${order.id.slice(0, 8).toUpperCase()}`}
            </h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Actions */}
          <OrderStatusActions order={order} />

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Services included in this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flight */}
              {flightDetails?.[0] && (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plane className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Flight Itinerary</h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trip Type</span>
                      <span className="capitalize">{flightDetails![0].trip_type?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span>{flightDetails![0].departure_city} → {flightDetails![0].arrival_city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure</span>
                      <span>{new Date(flightDetails![0].departure_date).toLocaleDateString()}</span>
                    </div>
                    {flightDetails![0].return_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return</span>
                        <span>{new Date(flightDetails![0].return_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {flightDetails![0].preferred_airline && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preferred Airline</span>
                        <span>{flightDetails![0].preferred_airline}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hotel */}
              {hotelDetails?.[0] && (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Hotel Booking</h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City</span>
                      <span>{hotelDetails![0].city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in</span>
                      <span>{new Date(hotelDetails![0].check_in_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span>{new Date(hotelDetails![0].check_out_date).toLocaleDateString()}</span>
                    </div>
                    {hotelDetails![0].hotel_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preferred Hotel</span>
                        <span>{hotelDetails![0].hotel_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Insurance */}
              {insuranceDetails?.[0] && (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Travel Insurance</h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage Type</span>
                      <span className="capitalize">{insuranceDetails![0].coverage_type?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage Amount</span>
                      <span>${Number(insuranceDetails![0].coverage_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period</span>
                      <span>
                        {new Date(insuranceDetails![0].start_date).toLocaleDateString()} — {new Date(insuranceDetails![0].end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!flightDetails?.[0] && !hotelDetails?.[0] && !insuranceDetails?.[0] && (
                <p className="text-sm text-muted-foreground">No service details recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Travelers */}
          <Card>
            <CardHeader>
              <CardTitle>Travelers</CardTitle>
              <CardDescription>People included in this booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!travelers || travelers.length === 0) && (
                <p className="text-sm text-muted-foreground">No traveler details recorded yet.</p>
              )}
              {travelers?.map((traveler: {
                id: string
                first_name: string
                last_name: string
                email: string
                phone?: string
                nationality?: string
                passport_number?: string
                date_of_birth?: string
              }, index: number) => (
                <div key={traveler.id} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {traveler.first_name} {traveler.last_name}
                        {index === 0 && <span className="text-muted-foreground ml-2">(Primary)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{traveler.email}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {traveler.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span>{traveler.phone}</span>
                      </div>
                    )}
                    {traveler.nationality && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nationality</span>
                        <span>{traveler.nationality}</span>
                      </div>
                    )}
                    {traveler.date_of_birth && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date of Birth</span>
                        <span>{new Date(traveler.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {traveler.passport_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passport</span>
                        <span className="font-mono">{traveler.passport_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Upload */}
          <OrderDocumentUpload orderId={order.id} />

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">
                  {travelers?.[0]
                    ? `${travelers[0].first_name} ${travelers[0].last_name}`
                    : "Guest Customer"}
                </p>
                {order.user_id && (
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {order.user_id.slice(0, 8)}
                  </p>
                )}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{order.email}</span>
                </div>
                {order.customer_country && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_country}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total_amount, order.currency)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="capitalize">
                    {order.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{order.payment_method || "—"}</span>
                </div>
                {order.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs truncate ml-2">{order.payment_reference}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="text-sm">
                <span className="text-muted-foreground">Delivery: </span>
                <span>{formatDelivery(order.delivery_method)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
