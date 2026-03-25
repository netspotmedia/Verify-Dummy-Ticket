"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { OrderWizard } from "@/components/order/order-wizard"
import { useOrderStore } from "@/lib/order-store"
import type { ServiceType } from "@/lib/types"

function OrderPageContent() {
  const searchParams = useSearchParams()
  const setServices = useOrderStore((state) => state.setServices)

  useEffect(() => {
    const service = searchParams.get("service") as ServiceType | null
    if (service && ["flight", "hotel", "insurance"].includes(service)) {
      setServices([service])
    }
  }, [searchParams, setServices])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <OrderWizard />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderPageContent />
    </Suspense>
  )
}
