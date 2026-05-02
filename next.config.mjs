// @ts-check
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for Sentry's server-side instrumentation in Next.js 14.
    instrumentationHook: true,
  },
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
          // NOTE: Sentry events are tunnelled through /monitoring (same-origin) —
          // no *.sentry.io entry needed in connect-src.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Cloudflare Analytics beacon script; Razorpay checkout script.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // Cloudflare Analytics beacon endpoint; Supabase; Razorpay.
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co"} https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://*.razorpay.com https://cloudflareinsights.com`,
              "frame-src 'self' https://api.razorpay.com https://*.razorpay.com",
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

/**
 * Sentry build-time configuration.
 * All options here are build-time only — they never appear in the browser bundle.
 * Requires SENTRY_AUTH_TOKEN set in Vercel environment variables for source map upload.
 */
const sentryBuildConfig = {
  // Sentry organisation slug — set in Vercel env vars.
  org: process.env.SENTRY_ORG || "kutumbkosh",
  // Sentry project slug — set in Vercel env vars.
  project: process.env.SENTRY_PROJECT || "kutumbkosh-web",

  // Suppress Sentry CLI output unless running in CI.
  silent: !process.env.CI,

  // Upload wider set of source maps for better stack trace coverage.
  widenClientFileUpload: true,

  // Tunnel Sentry events through /monitoring on the app's own domain.
  // This means: (1) ad-blockers don't block Sentry, (2) no *.sentry.io
  // needed in CSP connect-src, (3) events appear to come from kutumbkosh.com.
  tunnelRoute: "/monitoring",

  // Don't expose source maps in the deployed bundle.
  hideSourceMaps: true,

  // Tree-shake Sentry logger statements to reduce bundle size.
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryBuildConfig);
