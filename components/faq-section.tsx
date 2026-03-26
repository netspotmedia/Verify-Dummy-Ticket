"use client"

import { useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqItem } from "@/lib/supabase"

const defaultFaqs: FaqItem[] = [
  {
    id: '1',
    question: 'Is this document real and verifiable?',
    answer: 'Yes, all reservations are made through official GDS systems and generate a valid PNR that can be checked on the airline\'s official website.',
    sort_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    question: 'How long will the reservation stay valid?',
    answer: 'Typically, reservations are valid for 7-14 days depending on the airline\'s policy, which is more than enough for embassy processing.',
    sort_order: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    question: 'What if my visa gets rejected?',
    answer: 'While we cannot guarantee visa approval, we guarantee the authenticity of our documents. If the documents fail our delivery promise, we offer a full refund.',
    sort_order: 3,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept Credit/Debit cards (Visa, Mastercard, Verve), PayPal (PayPal account or card), and PayStack (Cards, Bank Transfer, USSD, Mobile Money). All payments are secure and encrypted.',
    sort_order: 4,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
]

export function FAQSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/landing/faq')
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setFaqs(data)
        } else {
          setFaqs(defaultFaqs)
        }
      } else {
        setFaqs(defaultFaqs)
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
      setFaqs(defaultFaqs)
    } finally {
      setLoading(false)
    }
  }

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs

  return (
    <section id="faq" className="py-20 md:py-32 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12 tracking-tight text-slate-900">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {displayFaqs.map((faq, index) => (
            <div key={faq.id} className="bg-white rounded-2xl p-6 shadow-sm">
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
