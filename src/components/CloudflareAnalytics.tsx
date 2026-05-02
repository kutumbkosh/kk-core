"use client";

/**
 * Cloudflare Web Analytics — free, cookieless, privacy-friendly.
 *
 * Why Cloudflare:
 * - Free forever, no pageview limits.
 * - Cookieless — no consent banner required, DPDPA-friendly.
 * - You already use Cloudflare (landing page on Cloudflare Pages).
 * - No personal data collected — aligns with KutumbKosh privacy values.
 *
 * Setup:
 * 1. Go to Cloudflare Dashboard → Web Analytics → Add a site
 * 2. Enter kutumbkosh.com and copy the beacon token
 * 3. Set NEXT_PUBLIC_CF_BEACON_TOKEN=<your-token> in Vercel production env vars
 *
 * This component is a no-op in development and staging — analytics only
 * fire in production to keep dashboards clean.
 */
import Script from "next/script";

export default function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

  // Only load in production with a token configured.
  if (!isProd || !token) {
    return null;
  }

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
