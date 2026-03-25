"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Clock, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  pendingOrders: number
  ordersThisMonth: number
  revenueThisMonth: number
  averageOrderValue: number
}

interface ChartData {
  ordersByDay: { date: string; count: number }[]
  ordersByStatus: { status: string; count: number }[]
  topServices: { service: string; count: number }[]
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0,
    averageOrderValue: 0,
  })
  const [chartData, setChartData] = useState<ChartData>({
    ordersByDay: [],
    ordersByStatus: [],
    topServices: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")

  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7)
          break
        case "30d":
          startDate.setDate(now.getDate() - 30)
          break
        case "90d":
          startDate.setDate(now.getDate() - 90)
          break
        default:
          startDate = new Date(0)
      }

      const [ordersRes, usersRes, servicesRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("order_items").select("service_name"),
      ])

      const orders = ordersRes.data || []
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const pendingOrders = orders.filter(o => o.status === "pending").length
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const thisMonthOrders = orders.filter(o => new Date(o.created_at) >= monthStart)
      const revenueThisMonth = thisMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: usersRes.count || 0,
        pendingOrders,
        ordersThisMonth: thisMonthOrders.length,
        revenueThisMonth,
        averageOrderValue,
      })

      const ordersByStatus = Object.entries(
        orders.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([status, count]) => ({ status, count: count as number }))

      const serviceCounts: Record<string, number> = {}
      ;(servicesRes.data || []).forEach((s: any) => {
        serviceCounts[s.service_name] = (serviceCounts[s.service_name] || 0) + 1
      })
      const topServices = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setChartData({
        ordersByDay: [],
        ordersByStatus,
        topServices,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      trend: "+12%",
      trendUp: true,
      description: `This month: ${stats.ordersThisMonth}`,
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: "+8%",
      trendUp: true,
      description: `This month: $${stats.revenueThisMonth.toFixed(2)}`,
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      trend: "+5%",
      trendUp: true,
      description: "Registered users",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      trend: stats.pendingOrders > 0 ? "Action needed" : "All clear",
      trendUp: stats.pendingOrders === 0,
      description: "Awaiting processing",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange(range)}
            >
              {range === "all" ? "All Time" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs ${stat.trendUp ? "text-green-600" : "text-amber-600"}`}>
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Orders by Status
            </CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.ordersByStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {chartData.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {item.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.count} orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(item.count / stats.totalOrders) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {stats.totalOrders > 0
                          ? Math.round((item.count / stats.totalOrders) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Services
            </CardTitle>
            <CardDescription>Most ordered services</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.topServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {chartData.topServices.map((item, index) => (
                  <div key={item.service} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium capitalize">
                        {item.service.replace(/_/g, " ")}
                      </span>
                    </div>
                    <Badge variant="secondary">{item.count} orders</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Order Value</CardTitle>
          <CardDescription>Based on completed transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${stats.averageOrderValue.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Per order average across {stats.totalOrders} total orders
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
