"use client"

import { cn } from "@/lib/utils"
import { Check, Clock, Package, Mail, AlertCircle } from "lucide-react"

interface OrderProgressTrackerProps {
  status: string
  paymentStatus: string
  className?: string
}

const STEPS = [
  { id: "pending", label: "Order Placed", icon: Clock, description: "Awaiting payment" },
  { id: "paid", label: "Payment Received", icon: Check, description: "Payment confirmed" },
  { id: "processing", label: "Processing", icon: AlertCircle, description: "Preparing documents" },
  { id: "completed", label: "Delivered", icon: Mail, description: "Documents sent" },
]

export function OrderProgressTracker({ status, paymentStatus, className }: OrderProgressTrackerProps) {
  const getCurrentStep = () => {
    if (paymentStatus === "unpaid") return 0
    if (paymentStatus === "failed") return 0
    if (status === "pending" && paymentStatus === "paid") return 1
    if (status === "processing") return 2
    if (status === "completed") return 3
    if (status === "cancelled") return -1
    return 0
  }

  const currentStep = getCurrentStep()

  if (status === "cancelled") {
    return (
      <div className={cn("flex items-center justify-center p-4 bg-red-50 rounded-lg", className)}>
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700 font-medium">Order Cancelled</span>
      </div>
    )
  }

  if (paymentStatus === "unpaid") {
    return (
      <div className={cn("flex items-center justify-center p-4 bg-yellow-50 rounded-lg", className)}>
        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
        <span className="text-yellow-700 font-medium">Awaiting Payment</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const Icon = step.icon

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Connector Line */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute top-5 left-0 w-full h-0.5 -z-10",
                    index <= currentStep ? "bg-primary" : "bg-muted"
                  )}
                  style={{ left: `-50%`, width: `calc(100% + 0px)` }}
                />
              )}

              {/* Step Circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-primary border-primary text-primary-foreground animate-pulse",
                  !isCompleted && !isCurrent && "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-sm font-medium",
                  isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Message */}
      {currentStep === 0 && paymentStatus === "paid" && (
        <p className="text-center text-sm text-muted-foreground">
          Your payment has been confirmed. We are preparing your documents.
        </p>
      )}
      {currentStep === 2 && (
        <p className="text-center text-sm text-muted-foreground">
          Your documents are being prepared and will be sent to your email shortly.
        </p>
      )}
      {currentStep === 3 && (
        <p className="text-center text-sm text-green-600 font-medium">
          Your documents have been delivered! Check your email for the download link.
        </p>
      )}
    </div>
  )
}
