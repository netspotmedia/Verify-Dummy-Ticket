"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle2, Clock, XCircle, RefreshCw, Send, Mail } from "lucide-react"
import { toast } from "sonner"

interface OrderStatusActionsProps {
  order: {
    id: string
    status: string
    payment_status: string
    email?: string
  }
}

const orderStatuses = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "processing", label: "Processing", icon: RefreshCw },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
]

const paymentStatuses = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
]

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const router = useRouter()
  const [orderStatus, setOrderStatus] = useState(order.status)
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)

  const patchOrder = async (status: string, pmtStatus: string) => {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus: pmtStatus }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to update order")
    }
    return res.json()
  }

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    try {
      await patchOrder(orderStatus, paymentStatus)
      toast.success("Order updated successfully")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeliverOrder = async () => {
    if (!confirm("This will mark the order as completed and send a delivery email to the customer. Continue?")) return
    setIsDelivering(true)
    try {
      await patchOrder("completed", "paid")
      setOrderStatus("completed")
      setPaymentStatus("paid")
      toast.success("Order marked as delivered — customer notified via email")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deliver order")
    } finally {
      setIsDelivering(false)
    }
  }

  const hasChanges = orderStatus !== order.status || paymentStatus !== order.payment_status
  const canDeliver = order.status !== "completed" && order.payment_status === "paid"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Actions</CardTitle>
            <CardDescription>Update status or mark documents as delivered</CardDescription>
          </div>
          {order.status === "completed" && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Delivered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Deliver CTA — only shown when paid and not yet completed */}
        {canDeliver && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <Mail className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Documents ready to deliver?</p>
              <p className="text-xs text-green-600 mt-0.5">
                Clicking below will mark the order completed and email the customer their documents are ready.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-1 shrink-0"
              onClick={handleDeliverOrder}
              disabled={isDelivering}
            >
              {isDelivering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isDelivering ? "Sending…" : "Deliver & Notify"}
            </Button>
          </div>
        )}

        {/* Manual status controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Order Status</label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <status.icon className="h-4 w-4" />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Payment Status</label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleUpdateStatus} disabled={!hasChanges || isUpdating} variant="outline">
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
