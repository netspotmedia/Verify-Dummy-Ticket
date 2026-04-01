import { ServicesManagement } from "@/components/admin/services-management"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services Management</h1>
        <p className="text-muted-foreground">Manage service types and their base prices</p>
      </div>

      {/* Explanation banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex gap-3 pt-4 pb-4">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-semibold">What does this page do?</p>
            <p>
              This page manages the <strong>service catalogue</strong> stored in the database —
              things like &quot;Flight Reservation&quot;, &quot;Hotel Booking&quot;, and &quot;Travel Insurance&quot;.
              Each entry has a name, description, USD price, and NGN price.
            </p>
            <p>
              These records are used for <strong>analytics and reporting</strong> (e.g. &quot;Top Services&quot; in the Analytics tab).
              The actual prices customers pay during checkout are configured in{" "}
              <strong>lib/types.ts</strong> (the PRICING_USD constant).
            </p>
            <p className="text-blue-700">
              💡 To change what services appear on the landing page, go to{" "}
              <strong>Landing Page → Services</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      <ServicesManagement />
    </div>
  )
}
