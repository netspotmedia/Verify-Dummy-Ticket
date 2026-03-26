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
  site_name: "VerifyDummyTickets",
  site_tagline: "Flight, Hotel & Travel Insurance for Visa Applications",
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
