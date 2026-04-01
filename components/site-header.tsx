"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu } from "lucide-react"
import { useSiteSettings } from "@/lib/site-settings"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

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
  const [user, setUser] = useState<User | null>(null)
  const [userInitials, setUserInitials] = useState("U")
  const { settings } = useSiteSettings()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const meta = user.user_metadata
        const first = meta?.first_name?.[0] || meta?.full_name?.[0] || user.email?.[0] || "U"
        const last = meta?.last_name?.[0] || ""
        setUserInitials((first + last).toUpperCase())
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const meta = session.user.user_metadata
        const first = meta?.first_name?.[0] || meta?.full_name?.[0] || session.user.email?.[0] || "U"
        const last = meta?.last_name?.[0] || ""
        setUserInitials((first + last).toUpperCase())
      } else {
        setUser(null)
        setUserInitials("U")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const siteName = settings?.site_name || "My Travel Services"
  const logoUrl = settings?.site_logo?.light || settings?.site_logo?.dark

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-red-100/50" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo — only image, no icon fallback */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto md:h-12 object-contain" />
            ) : (
              <span className="text-lg md:text-xl font-bold text-slate-900">{siteName}</span>
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
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-red-100 text-red-700 font-semibold text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>
                      <p className="text-sm font-medium truncate">{user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim() : user.email?.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/order">
                  <Button size="sm" className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-lg shadow-red-200/50 rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
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
                      <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
                    ) : (
                      <span className="text-lg font-bold text-slate-900">{siteName}</span>
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
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-red-100 text-red-700 font-semibold text-sm">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.user_metadata?.first_name || user.email?.split("@")[0]}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl">Dashboard</Button>
                      </Link>
                      <Button variant="ghost" className="w-full rounded-xl text-destructive" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl">Sign In</Button>
                      </Link>
                      <Link href="/order" onClick={() => setIsOpen(false)}>
                        <Button className="w-full rounded-xl bg-gradient-to-r from-red-700 to-red-800">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
