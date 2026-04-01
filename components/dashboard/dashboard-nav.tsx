"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSiteSettings } from "@/lib/site-settings"
import { Home, ShoppingBag, User, Settings, LogOut, Plus, Headphones } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { toast } from "sonner"

interface DashboardNavProps {
  user: SupabaseUser
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    phone: string | null
  } | null
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/support", label: "Support", icon: Headphones },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { settings } = useSiteSettings()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh()
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user.email?.split("@")[0] || "User"

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ""}`.toUpperCase()
    : user.email?.[0]?.toUpperCase() || "U"

  const logoUrl = settings?.site_logo?.light || settings?.site_logo?.dark
  const siteName = settings?.site_name || "My Travel Services"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo — image only, no icon fallback */}
        <Link href="/dashboard" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-9 w-auto object-contain" />
          ) : (
            <span className="font-bold text-foreground">{siteName}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/order">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
