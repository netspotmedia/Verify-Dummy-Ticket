import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { SiteSettingsProvider } from '@/lib/site-settings'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'VerifyDummyTickets - Flight, Hotel & Travel Insurance for Visa Applications',
    template: '%s | VerifyDummyTickets'
  },
  description: 'Get verified flight reservations, hotel bookings, and travel insurance for your visa applications. Trusted by 100K+ travelers worldwide. Fast delivery within 24 hours.',
  keywords: ['visa application', 'flight reservation', 'hotel booking', 'travel insurance', 'dummy ticket', 'visa documents', 'travel documents'],
  authors: [{ name: 'VerifyDummyTickets' }],
  creator: 'VerifyDummyTickets',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://verifydummytickets.com',
    siteName: 'VerifyDummyTickets',
    title: 'VerifyDummyTickets - Flight, Hotel & Travel Insurance for Visa Applications',
    description: 'Get verified flight reservations, hotel bookings, and travel insurance for your visa applications. Trusted by 100K+ travelers worldwide.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VerifyDummyTickets - Your Travel Document Solution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VerifyDummyTickets - Flight, Hotel & Travel Insurance',
    description: 'Get verified travel documents for your visa applications. Fast, reliable, and trusted.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SiteSettingsProvider>
          {children}
        </SiteSettingsProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
