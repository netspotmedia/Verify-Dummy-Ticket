"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { OrderWizard } from "@/components/order/order-wizard"
import { useOrderStore } from "@/lib/order-store"
import { useSiteSettings } from "@/lib/site-settings"
import type { ServiceType } from "@/lib/types"

function OrderPageContent() {
  const searchParams = useSearchParams()
  const setServices = useOrderStore((state) => state.setServices)
  const { settings } = useSiteSettings()

  useEffect(() => {
    const service = searchParams.get("service") as ServiceType | null
    if (service && ["flight", "hotel", "insurance"].includes(service)) {
      setServices([service])
    }
  }, [searchParams, setServices])

  const orderImage = settings?.order_page_image || ""

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      <SiteHeader />
      <main className="flex-1 pt-24 md:pt-28 pb-10">
        <div className="container mx-auto px-4 xl:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
            <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <OrderWizard />
            </div>
            <div className="hidden lg:block w-full lg:w-[400px] xl:w-[500px]">
              <div className="sticky top-32">
                <img
                  src={orderImage}
                  alt="Order Illustration"
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>
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
