import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, templates } from "@/lib/resend";

/**
 * Renewal Reminder Cron — HANDOFFS.md ID 11
 *
 * Finds Pro subscriptions expiring in ~14 days and sends reminder emails.
 * Uses a 13–15 day window to tolerate cron timing drift.
 *
 * HANDOFFS.md ID 11: "14-day renewal reminder email"
 * HANDOFFS.md ID 32: Cron scheduling decision pending from Shubham
 *   (Vercel Cron vs Supabase Edge Functions vs external scheduler).
 *   Once decided, configure to call GET /api/cron/renewal-reminder daily.
 *
 * Security: Protected by CRON_SECRET environment variable.
 * Set CRON_SECRET in Vercel and pass as: Authorization: Bearer <secret>
 *
 * If using Vercel Cron (vercel.json):
 *   { "crons": [{ "path": "/api/cron/renewal-reminder", "schedule": "0 9 * * *" }] }
 *   Vercel automatically sets CRON_SECRET and sends it in Authorization header.
 */

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Verify caller is the configured cron scheduler
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient();
  const now = new Date();

  // 14-day window with ±1 day tolerance for cron drift
  const windowStart = new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  // Find active Pro subscriptions expiring in the 13–15 day window
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, billing_cycle, current_period_end")
    .eq("plan", "PRO")
    .eq("status", "ACTIVE")
    .gte("current_period_end", windowStart.toISOString())
    .lte("current_period_end", windowEnd.toISOString());

  if (error) {
    console.error("[Cron] renewal-reminder: query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: "No subscriptions in 14-day window" });
  }

  // Fetch user emails and send reminders
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", sub.user_id)
      .single();

    if (!profile?.email) continue;

    const daysLeft = Math.round(
      (new Date(sub.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const result = await sendEmail({
      to: profile.email,
      ...templates.renewalReminder({
        plan: "PRO",
        daysLeft,
        periodEnd: sub.current_period_end,
      }),
    });

    if (result.ok) {
      sent++;
    } else {
      failed++;
      console.error(`[Cron] renewal-reminder: failed for user ${sub.user_id}:`, result.error);
    }
  }

  console.log(`[Cron] renewal-reminder: sent=${sent}, failed=${failed}, total=${subscriptions.length}`);
  return NextResponse.json({ sent, failed, total: subscriptions.length });
}
