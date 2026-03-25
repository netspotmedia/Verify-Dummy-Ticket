"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface OrderStatusActionsProps {
  order: {
    id: string
    status: string
    payment_status: string
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

  const handleUpdateStatus = async () => {
    setIsUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      if (error) throw error

      toast.success("Order updated successfully")
      router.refresh()
    } catch {
      toast.error("Failed to update order")
    } finally {
      setIsUpdating(false)
    }
  }

  const hasChanges = orderStatus !== order.status || paymentStatus !== order.payment_status

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
        <CardDescription>Change the order and payment status</CardDescription>
      </CardHeader>
      <CardContent>
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
            <Button
              onClick={handleUpdateStatus}
              disabled={!hasChanges || isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
