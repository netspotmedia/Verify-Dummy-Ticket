"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSiteSettings } from "@/lib/site-settings"

export default function ContactPage() {
  const { settings } = useSiteSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })

      if (error) throw error
      setIsSubmitted(true)
    } catch (error) {
      console.error("Contact form error:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
              Have questions? We&apos;re here to help. Reach out to us anytime.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {settings?.support_email || "support@example.com"}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {settings?.site_phone || "+234 800 123 4567"}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">WhatsApp</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {settings?.site_phone || "+234 800 123 4567"}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Response Time</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Within 2-4 hours
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Message Sent!</h3>
                      <p className="mt-2 text-muted-foreground">
                        Thank you for reaching out. We&apos;ll respond within 2-4 hours.
                      </p>
                      <Button
                        className="mt-6"
                        onClick={() => {
                          setIsSubmitted(false)
                          setFormData({ name: "", email: "", subject: "", message: "" })
                        }}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="How can we help you?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold">Looking for Quick Answers?</h2>
            <p className="mt-2 text-muted-foreground">
              Check out our FAQ section for answers to common questions.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <a href="/#faq">View FAQ</a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
