import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plane, Building2, Shield, User, Mail, Phone, Download } from "lucide-react"

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

  // Get order with all related data
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_services (
        *,
        flight_details (*),
        hotel_details (*),
        insurance_details (*)
      ),
      travelers (*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !order) {
    notFound()
  }

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

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`
    return `₦${amount.toLocaleString()}`
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-5 w-5" />
      case "hotel":
        return <Building2 className="h-5 w-5" />
      case "insurance":
        return <Shield className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Services included in this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_services?.map((service: {
                id: string
                service_type: string
                price: number
                status: string
                document_url?: string
                flight_details?: Array<{
                  trip_type: string
                  departure_city: string
                  arrival_city: string
                  departure_date: string
                  return_date?: string
                  preferred_airline?: string
                }>
                hotel_details?: Array<{
                  city: string
                  check_in_date: string
                  check_out_date: string
                  hotel_name?: string
                }>
                insurance_details?: Array<{
                  destination: string
                  start_date: string
                  end_date: string
                  coverage_amount: number
                }>
              }) => (
                <div key={service.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getServiceIcon(service.service_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{service.service_type} Itinerary</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(service.price, order.currency)}
                        </p>
                      </div>
                    </div>
                    {service.document_url && (
                      <a href={service.document_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Flight Details */}
                  {service.service_type === "flight" && service.flight_details?.[0] && (
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trip Type</span>
                        <span className="capitalize">{service.flight_details[0].trip_type.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route</span>
                        <span>{service.flight_details[0].departure_city} → {service.flight_details[0].arrival_city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departure</span>
                        <span>{new Date(service.flight_details[0].departure_date).toLocaleDateString()}</span>
                      </div>
                      {service.flight_details[0].return_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Return</span>
                          <span>{new Date(service.flight_details[0].return_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hotel Details */}
                  {service.service_type === "hotel" && service.hotel_details?.[0] && (
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">City</span>
                        <span>{service.hotel_details[0].city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-in</span>
                        <span>{new Date(service.hotel_details[0].check_in_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-out</span>
                        <span>{new Date(service.hotel_details[0].check_out_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Insurance Details */}
                  {service.service_type === "insurance" && service.insurance_details?.[0] && (
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination</span>
                        <span>{service.insurance_details[0].destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage</span>
                        <span>${service.insurance_details[0].coverage_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Period</span>
                        <span>
                          {new Date(service.insurance_details[0].start_date).toLocaleDateString()} - {new Date(service.insurance_details[0].end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Travelers */}
          <Card>
            <CardHeader>
              <CardTitle>Travelers</CardTitle>
              <CardDescription>People included in this booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.travelers?.map((traveler: {
                id: string
                first_name: string
                last_name: string
                email: string
                nationality?: string
              }, index: number) => (
                <div key={traveler.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {traveler.first_name} {traveler.last_name}
                      {index === 0 && <span className="text-muted-foreground ml-2">(Primary)</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{traveler.email}</p>
                    {traveler.nationality && (
                      <p className="text-sm text-muted-foreground">{traveler.nationality}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount, order.currency)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total, order.currency)}</span>
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
                  <span className="capitalize">{order.payment_method}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.contact_email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.contact_phone}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Delivery Method: </span>
                <span className="capitalize">{order.delivery_method}</span>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Have questions about your order? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <Link href="https://wa.me/2348070076011" target="_blank">
                  <Button variant="outline" className="w-full">
                    WhatsApp Support
                  </Button>
                </Link>
                <Link href="mailto:support@verifydummytickets.com">
                  <Button variant="ghost" className="w-full">
                    Email Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
