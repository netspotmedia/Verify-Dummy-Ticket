"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useSiteSettings } from "@/lib/site-settings"
import { CheckCircle2, ArrowRight, Mail, Phone } from "lucide-react"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const { settings } = useSiteSettings()
  const sitePhone = settings?.site_phone || "+234 800 123 4567"
  const supportEmail = settings?.support_email || "support@example.com"
  const orderId = searchParams.get("id")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl">Order Received!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your order. {"We're"} processing it now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderId && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Order Reference</p>
                  <p className="font-mono font-semibold text-lg">{orderId.slice(0, 8).toUpperCase()}</p>
                </div>
              )}

              <div className="text-left space-y-4">
                <h3 className="font-semibold">What happens next?</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
                    <span>{"We'll review your order and start preparing your documents."}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
                    <span>You will receive your documents via your selected delivery method within 24 hours.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
                    <span>If you have any questions, our support team is available 24/7.</span>
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full gap-2">
                    View My Orders
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">Need help?</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`mailto:${supportEmail}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    {supportEmail}
                  </Link>
                  <Link href={`https://wa.me/${sitePhone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Phone className="h-4 w-4" />
                    WhatsApp Support
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}