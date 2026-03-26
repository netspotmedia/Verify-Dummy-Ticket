"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plane, Hotel, Shield, HelpCircle, FileText, Settings, ArrowRight, Zap, CheckCircle, RefreshCw, Star, Image } from 'lucide-react'

const sections = [
  {
    title: 'Hero Section',
    description: 'Main banner with heading, subheading, and CTAs',
    href: '/admin/landing/hero',
    icon: FileText,
    color: 'bg-red-100 text-red-700',
  },
  {
    title: 'Services',
    description: 'Flight tickets, hotel bookings, insurance',
    href: '/admin/landing/services',
    icon: Plane,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'How It Works',
    description: 'Step-by-step process explanation',
    href: '/admin/landing/how-it-works',
    icon: Zap,
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Guarantees',
    description: 'Trust badges and guarantees section',
    href: '/admin/landing/guarantees',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Testimonials',
    description: 'Customer reviews and feedback',
    href: '/admin/landing/testimonials',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions',
    href: '/admin/landing/faq',
    icon: HelpCircle,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Site Settings',
    description: 'Global site configuration',
    href: '/admin/landing/settings',
    icon: Settings,
    color: 'bg-gray-100 text-gray-700',
  },
]

export default function LandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Landing Page Content</h1>
        <p className="text-muted-foreground">
          Manage the content displayed on your landing page
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-xl ${section.color}`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
