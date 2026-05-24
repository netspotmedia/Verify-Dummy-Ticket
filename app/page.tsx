import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { GuaranteeSection } from "@/components/guarantee-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { SiteFooter } from "@/components/site-footer"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Verify Dummy Tickets",
  url: "https://verifydummytickets.com",
  description: "Dummy flight itineraries, hotel confirmations, and travel insurance documents for visa applications.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+27-68-707-6011",
    contactType: "customer service",
    email: "verifydummyticket@gmail.com",
    availableLanguage: "English",
  },
  service: [
    { "@type": "Service", name: "Flight Itinerary", description: "Dummy flight reservation with PNR for visa applications" },
    { "@type": "Service", name: "Hotel Booking", description: "Dummy hotel confirmation letter for visa applications" },
    { "@type": "Service", name: "Travel Insurance", description: "Dummy travel insurance document for visa applications" },
  ],
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <HowItWorksSection />
        <GuaranteeSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}
