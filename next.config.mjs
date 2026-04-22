/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable DNS prefetching to prevent leaks
          { key: "X-DNS-Prefetch-Control", value: "off" },
          // Prevent the page from being embedded
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co"} https://*.supabase.co wss://*.supabase.co`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Strict Transport Security (HTTPS only)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Permissions Policy — disable unnecessary browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
