"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  MoreVertical,
  Check,
  X,
  Eye,
  Upload,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface Order {
  id: string
  order_number: string
  email: string
  status: string
  payment_status: string
  payment_method: string
  currency: string
  total_amount: number
  created_at: string
}

interface AdminOrdersTableProps {
  initialOrders: Order[]
}

export function AdminOrdersTable({ initialOrders }: AdminOrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bulkStatus, setBulkStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id))
    }
  }

  const toggleSelect = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: bulkStatus, updated_at: new Date().toISOString() })
        .in("id", selectedOrders)

      if (error) throw error

      setOrders(orders.map((order) => 
        selectedOrders.includes(order.id) 
          ? { ...order, status: bulkStatus } 
          : order
      ))
      setSelectedOrders([])
      setBulkStatus("")
      toast.success(`Updated ${selectedOrders.length} orders`)
    } catch (error) {
      console.error("Bulk update error:", error)
      toast.error("Failed to update orders")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) throw error

      setOrders(orders.map((order) => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast.success("Order status updated")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update order")
    }
  }

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

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`
    return `₦${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-4">
      {/* Filters & Bulk Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedOrders.length} selected
            </span>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change status to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleBulkStatusUpdate} 
              disabled={!bulkStatus || loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{order.order_number}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{order.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {order.payment_method}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleQuickStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          {getStatusBadge(order.status)}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
