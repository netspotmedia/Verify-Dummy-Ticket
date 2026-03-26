import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono, Outfit } from 'next/font/google'
import { Open_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
  weight: ['600']
})

const openSans = Open_Sans({ 
  subsets: ["latin"],
  variable: '--font-open-sans',
  weight: ['700'],
  style: ['italic', 'normal']
})

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
      <body className={`${inter.variable} ${geistMono.variable} ${outfit.variable} ${openSans.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
