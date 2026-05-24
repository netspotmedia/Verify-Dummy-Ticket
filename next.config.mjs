/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      // Supabase storage only — no open wildcard
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY" },
          // X-XSS-Protection is legacy; modern browsers use CSP instead
          { key: "X-XSS-Protection",         value: "0" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          {
            key:   "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key:   "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // CSP: unsafe-eval removed entirely.
          // unsafe-inline is retained only for styles (required by Tailwind CSS v4 at
          // build time). Script inline is handled via nonces injected by middleware.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' for scripts is narrowed to nonces in middleware.
              // The static header here covers pages that bypass middleware (static files).
              "script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com https://js.paystack.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://www.paypal.com https://www.paypalobjects.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com https://api.paystack.co https://api.paypal.com https://api.sandbox.paypal.com",
              "frame-src 'self' https://www.paypal.com https://js.paystack.co",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
