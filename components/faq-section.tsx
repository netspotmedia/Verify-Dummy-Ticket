"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is this document real and verifiable?",
    answer: "Yes, all reservations are made through official GDS systems and generate a valid PNR that can be checked on the airline's official website.",
  },
  {
    question: "How long will the reservation stay valid?",
    answer: "Typically, reservations are valid for 7-14 days depending on the airline's policy, which is more than enough for embassy processing.",
  },
  {
    question: "What if my visa gets rejected?",
    answer: "While we cannot guarantee visa approval, we guarantee the authenticity of our documents. If the documents fail our delivery promise, we offer a full refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Credit/Debit cards (Visa, Mastercard, Verve), PayPal (PayPal account or card), and PayStack (Cards, Bank Transfer, USSD, Mobile Money). All payments are secure and encrypted.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12 tracking-tight text-slate-900">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${index}`} className="border-0">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
