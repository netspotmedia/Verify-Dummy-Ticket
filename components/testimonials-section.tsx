"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Pam K.",
    location: "New York, US",
    content: "I needed a dummy ticket for my visa application, and VerifyDummyTicket.com came through with flying colors! The service was quick, professional, and affordable. My visa was approved without any issues, thanks to the realistic ticket they provided. Highly recommended!",
    rating: 5,
  },
  {
    name: "Alene M.",
    location: "London, UK",
    content: "As a frequent traveller, I often need dummy tickets for visa applications, and I've tried several services. VerifyDummyTicket.com is by far the best! The process was smooth, and the customer support was very responsive. I got my dummy ticket within minutes. Will definitely use them again!",
    rating: 5,
  },
  {
    name: "Priya K.",
    location: "Mumbai, India",
    content: "I was a bit skeptical at first, but VerifyDummyTicket.com exceeded my expectations. The dummy ticket looked authentic, and it was exactly what I needed for my Schengen visa application. The entire process was hassle-free and quick. Five stars!",
    rating: 5,
  },
  {
    name: "Carlos T.",
    location: "Madrid, Spain",
    content: "VerifyDummyTicket.com saved me a lot of stress and money. The dummy ticket they provided was perfect for my visa application, and I received it almost instantly after placing the order. The site is easy to use, and the service is top-notch. I'll be back for sure!",
    rating: 5,
  },
  {
    name: "Anita B.",
    location: "Dubai, UAE",
    content: "I've used verifydummytickets.com twice now, and both times, the service has been exceptional. The dummy tickets look very real, and I've never had any issues with my visa applications. The prices are reasonable, and the delivery is fast. I highly recommend this service!",
    rating: 5,
  },
  {
    name: "Adejoke B.",
    location: "Lagos, Nigeria",
    content: "I needed a dummy ticket on short notice, and VerifyDummyTicket.com delivered! The ticket looked so real that I had no issues with my visa application. The website is user-friendly, and the customer service team is very helpful. I'll definitely use their services again in the future.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Trusted by Thousands of Nomads
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Based on 5,000+ five-star reviews
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/20" />
                
                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {testimonial.content}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
