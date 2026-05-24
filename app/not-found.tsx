import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center">
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-6xl font-bold text-primary">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/">
              <Button>Go home</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact support</Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
