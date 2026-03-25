"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, RefreshCcw, Clock, HeadphonesIcon } from "lucide-react"

const guarantees = [
  {
    icon: Shield,
    title: "100% Money Back",
    description: "If VerifyDummyTickets isn't the best fit, simply reach out! We'll happily refund 100% of your money.",
  },
  {
    icon: RefreshCcw,
    title: "Free Revisions",
    description: "Need changes to your documents? We offer free revisions to ensure everything is perfect.",
  },
  {
    icon: Clock,
    title: "24-Hour Delivery",
    description: "We deliver all documents within 24 hours. Rush delivery available for urgent requests.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our support team is available around the clock via WhatsApp, email, or phone.",
  },
]

export function GuaranteeSection() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
            Our Promise
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Our 100% No-Risk Money Back Guarantee
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/80">
            {"We're excited to have you experience VerifyDummyTickets. Within 14 days after your purchase, if VerifyDummyTickets isn't the best fit, simply reach out! We'll happily refund 100% of your money."}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10 mb-4">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
            <Shield className="h-5 w-5" />
            <span className="font-medium">PayPal Buyer Protection</span>
          </div>
        </div>
      </div>
    </section>
  )
}
