import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/vitals
 * Receives Core Web Vitals metrics from the WebVitals client component and
 * logs them server-side. Vercel captures these in function logs automatically.
 *
 * Payload shape:
 *   { name, value, rating, id, navigationType }
 *
 * Ratings:  "good" | "needs-improvement" | "poor"
 * Target thresholds (Google CWV 2024):
 *   LCP  < 2500ms   CLS < 0.1 (×1000)   INP < 200ms
 *   FCP  < 1800ms   TTFB < 800ms
 */
export async function POST(req: NextRequest) {
  try {
    const metric = await req.json() as {
      name: string;
      value: number;
      rating: "good" | "needs-improvement" | "poor";
      id: string;
      navigationType?: string;
    };

    const prefix = metric.rating === "good" ? "✅" : metric.rating === "needs-improvement" ? "⚠️" : "❌";
    console.log(
      `[web-vital] ${prefix} ${metric.name} ${metric.value}${metric.name === "CLS" ? " (×0.001)" : "ms"} [${metric.rating}] nav=${metric.navigationType ?? "unknown"} id=${metric.id}`
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
