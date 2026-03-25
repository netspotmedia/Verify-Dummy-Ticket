import { PaymentGatewaySettings } from "@/components/admin/payment-gateway-settings"

export default function PaymentGatewaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Gateways</h1>
        <p className="text-muted-foreground">Configure payment providers and API credentials</p>
      </div>

      <PaymentGatewaySettings />
    </div>
  )
}
