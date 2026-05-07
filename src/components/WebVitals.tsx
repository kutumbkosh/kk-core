"use client";

/**
 * WebVitals — collects Core Web Vitals and reports them to /api/vitals.
 *
 * Metrics reported:
 *   CLS  — Cumulative Layout Shift      (target < 0.1)
 *   FCP  — First Contentful Paint       (target < 1.8s)
 *   INP  — Interaction to Next Paint    (target < 200ms, replaces FID in 2024)
 *   LCP  — Largest Contentful Paint     (target < 2.5s)
 *   TTFB — Time to First Byte           (target < 800ms)
 *
 * Only active in production (NEXT_PUBLIC_APP_ENV === "production").
 * Reports are logged server-side via Vercel function logs.
 * Requires: npm install web-vitals (already in package.json)
 */

import { useEffect } from "react";

const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

// Inline type to avoid static import of web-vitals before npm install
type VitalMetric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
  navigationType?: string;
};

function sendToLoggingEndpoint(metric: VitalMetric) {
  if (!isProd) return;
  const body = JSON.stringify({
    name: metric.name,
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  });
  // Use sendBeacon where available (non-blocking, survives page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/vitals", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  }
}

export default function WebVitals() {
  useEffect(() => {
    // Dynamic import keeps web-vitals out of the main bundle
    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(sendToLoggingEndpoint);
      onFCP(sendToLoggingEndpoint);
      onINP(sendToLoggingEndpoint);
      onLCP(sendToLoggingEndpoint);
      onTTFB(sendToLoggingEndpoint);
    });
  }, []);

  return null;
}
