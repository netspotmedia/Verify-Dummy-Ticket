"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Plane } from "lucide-react"
import { useSiteSettings } from "@/lib/site-settings"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/#services" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/#faq" },
  { name: "Contact", href: "/contact" },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { settings, loading } = useSiteSettings()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const siteName = settings?.site_name || "My Travel Services"
  const logoUrl = settings?.site_logo?.light || settings?.site_logo?.dark

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-red-100/50"
        : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-10 w-auto md:h-12 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-200 group-hover:scale-105 transition-transform">
                <Plane className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-700 transition-colors rounded-full hover:bg-red-50"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-red-700">
                Sign In
              </Button>
            </Link>
            <Link href="/order">
              <Button size="sm" className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-lg shadow-red-200/50 rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={siteName}
                        className="h-12 w-auto object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-700 to-red-800">
                        <Plane className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </Link>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="p-6 border-t space-y-3">

                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/order" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-red-700 to-red-800">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
