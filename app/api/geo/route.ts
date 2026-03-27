import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    
    let ip = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1"
    
    if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
      ip = "102.89.33.49"
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`)
    const data = await response.json()

    if (data.status === "success") {
      return NextResponse.json({
        country: data.country,
        countryCode: data.countryCode,
        isNigeria: data.countryCode === "NG"
      })
    }

    return NextResponse.json({
      country: "Unknown",
      countryCode: "US",
      isNigeria: false
    })
  } catch (error) {
    console.error("Geo detection error:", error)
    return NextResponse.json({
      country: "Unknown",
      countryCode: "US",
      isNigeria: false
    })
  }
}
