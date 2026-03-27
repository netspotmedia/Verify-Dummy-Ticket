"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SiteLogo {
  light?: string
  dark?: string
  favicon?: string
}

interface SiteSettings {
  site_logo?: SiteLogo
  site_name?: string
  site_tagline?: string
  site_phone?: string
  support_email?: string
  order_page_image?: string
  footer_company_name?: string
  footer_copyright?: string
  footer_facebook?: string
  footer_instagram?: string
  footer_twitter?: string
}

interface SiteSettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  error: string | null
}

const defaultSettings: SiteSettings = {
  site_logo: {
    light: undefined,
    dark: undefined,
    favicon: undefined,
  },
  site_name: "My Travel Services",
  site_tagline: "Flight, Hotel & Travel Insurance for Visa Applications",
  site_phone: "+234 800 123 4567",
  support_email: "support@example.com",
  order_page_image: "",
  footer_company_name: "My Travel Services",
  footer_copyright: `© ${new Date().getFullYear()} My Travel Services. All rights reserved.`,
  footer_facebook: "https://facebook.com",
  footer_instagram: "https://instagram.com",
  footer_twitter: "https://twitter.com",
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  loading: true,
  error: null,
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/landing/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings({
            site_logo: data.site_logo || defaultSettings.site_logo,
            site_name: data.site_name || defaultSettings.site_name,
            site_tagline: data.site_tagline || defaultSettings.site_tagline,
            site_phone: data.site_phone || defaultSettings.site_phone,
            support_email: data.support_email || defaultSettings.support_email,
            order_page_image: data.order_page_image || defaultSettings.order_page_image,
            footer_company_name: data.footer_company_name || defaultSettings.footer_company_name,
            footer_copyright: data.footer_copyright?.replace('{year}', new Date().getFullYear().toString()) || defaultSettings.footer_copyright,
            footer_facebook: data.footer_facebook || defaultSettings.footer_facebook,
            footer_instagram: data.footer_instagram || defaultSettings.footer_instagram,
            footer_twitter: data.footer_twitter || defaultSettings.footer_twitter,
          })
        } else {
          setSettings(defaultSettings)
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err)
        setError('Failed to load settings')
        setSettings(defaultSettings)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return context
}
