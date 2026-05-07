import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Plane, Building2, Shield } from "lucide-react"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      email,
      status,
      payment_status,
      payment_method,
      currency,
      total_amount,
      services,
      created_at
    `)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Paid</Badge>
      case "unpaid":
        return <Badge variant="secondary">Unpaid</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "refunded":
        return <Badge variant="outline">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (!amount && amount !== 0) return "—"
    if (currency === "USD") return `$${Number(amount).toFixed(2)}`
    return `₦${Number(amount).toLocaleString()}`
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <span title="Flight"><Plane className="h-4 w-4" /></span>
      case "hotel":
        return <span title="Hotel"><Building2 className="h-4 w-4" /></span>
      case "insurance":
        return <span title="Insurance"><Shield className="h-4 w-4" /></span>
      default:
        return null
    }
  }

  // Normalise the services field — it may be a jsonb array or text[]
  const getServices = (order: Record<string, unknown>): string[] => {
    const s = order.services
    if (!s) return []
    if (Array.isArray(s)) return s as string[]
    if (typeof s === "string") {
      try { return JSON.parse(s) } catch { return [] }
    }
    return []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage all customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {orders?.length ?? 0} total orders
            {error && (
              <span className="ml-2 text-destructive text-xs">
                (Error loading: {error.message})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium text-xs">
                        {order.order_number
                          ? order.order_number.toString().toUpperCase()
                          : `#${order.id.slice(0, 8).toUpperCase()}`}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getServices(order as Record<string, unknown>).map((s, i) => (
                            <span key={i} className="text-muted-foreground">
                              {getServiceIcon(s)}
                            </span>
                          ))}
                          {getServices(order as Record<string, unknown>).length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total_amount, order.currency)}
                      </TableCell>
                      <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {error ? `Error: ${error.message}` : "No orders yet"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
