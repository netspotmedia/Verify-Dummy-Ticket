"use client"

import Link from "next/link"
import { useSiteSettings } from "@/lib/site-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

export function OrderSupportSection() {
  const { settings } = useSiteSettings()
  const sitePhone = settings?.site_phone || "+27 68 707 6011"
  const supportEmail = settings?.support_email || "support@example.com"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Need Help?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Have questions about your order? Our support team is here to help.
        </p>
        <div className="space-y-2">
          <Link href={`https://wa.me/${sitePhone.replace(/\D/g, '')}`} target="_blank">
            <Button variant="outline" className="w-full">
              WhatsApp Support
            </Button>
          </Link>
          <Link href={`mailto:${supportEmail}`}>
            <Button variant="ghost" className="w-full">
              Email Support
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}