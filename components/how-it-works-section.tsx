"use client"

import { Badge } from "@/components/ui/badge"
import { FileText, CreditCard, Mail, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Fill the Form",
    description: "Complete the order form with your travel details and traveler information.",
  },
  {
    icon: CreditCard,
    title: "Make Payment",
    description: "Pay securely via PayPal (USD) or Paystack (NGN). All payments are encrypted.",
  },
  {
    icon: Mail,
    title: "Receive Documents",
    description: "Get your verified travel documents delivered to your email within 24 hours.",
  },
  {
    icon: CheckCircle2,
    title: "Apply for Visa",
    description: "Use your documents for your visa application with confidence.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Simple Process</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Get your travel documents in 4 simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-border hidden lg:block" />
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative z-10 mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
