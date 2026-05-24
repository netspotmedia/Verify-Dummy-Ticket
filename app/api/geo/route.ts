import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Use Vercel edge geolocation headers — no external HTTP call or user IP forwarding
  const countryCode = request.headers.get("x-vercel-ip-country") ?? ""
  const country = request.headers.get("x-vercel-ip-country-name") ?? ""

  if (!countryCode) {
    // Local development or non-Vercel deployment
    return NextResponse.json({
      country: "United States",
      countryCode: "US",
      isNigeria: false,
      isLocalDev: true,
    })
  }

  return NextResponse.json({
    country: country || countryCode,
    countryCode,
    isNigeria: countryCode === "NG",
    isLocalDev: false,
  })
}
