import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle2, XCircle, ArrowRight, Plus } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [
    { data: orders },
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["pending", "processing"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
  ])

  const stats = [
    { label: "Total Orders", value: totalOrders || 0, icon: ShoppingBag },
    { label: "Pending", value: pendingOrders || 0, icon: Clock },
    { label: "Completed", value: completedOrders || 0, icon: CheckCircle2 },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Processing</Badge>
      case "completed":
        return <Badge className="bg-accent/10 text-accent border-accent/20">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`
    return `₦${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! {"Here's"} an overview of your orders.</p>
        </div>
        <Link href="/order">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent orders</CardDescription>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.order_number
                          ? order.order_number.toString().toUpperCase()
                          : `#${order.id.slice(0, 8).toUpperCase()}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(order.services || []).map((service: string) => service.charAt(0).toUpperCase() + service.slice(1)).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(order.total_amount || 0, order.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {"You haven't placed any orders yet. Start by creating your first order."}
              </p>
              <Link href="/order">
                <Button>Create Your First Order</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
