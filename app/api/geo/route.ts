import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    
    let ip = forwardedFor?.split(",")[0]?.trim() || realIp || ""
    
    // If no valid IP detected (local development), return US as default
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
      return NextResponse.json({
        country: "United States",
        countryCode: "US",
        isNigeria: false,
        isLocalDev: true
      })
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      signal: AbortSignal.timeout(5000)
    })
    const data = await response.json()

    if (data.status === "success") {
      return NextResponse.json({
        country: data.country,
        countryCode: data.countryCode,
        isNigeria: data.countryCode === "NG",
        isLocalDev: false
      })
    }

    return NextResponse.json({
      country: "Unknown",
      countryCode: "US",
      isNigeria: false,
      isLocalDev: false
    })
  } catch (error) {
    console.error("Geo detection error:", error)
    return NextResponse.json({
      country: "Unknown",
      countryCode: "US",
      isNigeria: false,
      isLocalDev: false
    })
  }
}
