"use client"

import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is a dummy ticket or flight reservation?",
    answer: "A dummy ticket, also known as a flight reservation or flight itinerary, is a confirmed booking for a flight that has not been paid for yet. It includes a valid PNR (Passenger Name Record) that can be verified on the airline's website. It's commonly used for visa applications to show proof of travel plans without purchasing expensive tickets.",
  },
  {
    question: "Is the dummy ticket verifiable?",
    answer: "Yes, all our dummy tickets come with valid PNR codes that can be verified on the airline's official website or through their customer service. The booking is real and appears in the airline's system.",
  },
  {
    question: "How long does delivery take?",
    answer: "We deliver most orders within 2-6 hours during business hours. For urgent requests, we offer express delivery within 1-2 hours. Maximum delivery time is 24 hours.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept PayPal (for international payments in USD) and Paystack (for Nigerian Naira payments). Both methods are secure and encrypted.",
  },
  {
    question: "Can I use these documents for actual travel?",
    answer: "The flight reservations are real bookings but are intended for visa application purposes only. They are not paid tickets and will expire. For actual travel, you need to purchase a confirmed ticket.",
  },
  {
    question: "What is your refund policy?",
    answer: "We offer a 100% money-back guarantee within 14 days of purchase if our service doesn't meet your expectations. Simply contact our support team for a full refund.",
  },
  {
    question: "Do you provide hotel bookings?",
    answer: "Yes, we provide hotel booking confirmations for any city worldwide. These are real hotel reservations that can be verified and are perfect for visa applications.",
  },
  {
    question: "Is travel insurance included?",
    answer: "Travel insurance is a separate service. We offer legitimate international travel insurance with $35,000 coverage and 90 days validity for visa applications.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Do you have a question about Verifiable Onward Tickets? See the list below for our most frequently asked questions.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
