import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { sendEmail, templates } from "@/lib/resend";

/** Server-enforced plan prices in INR (rupees) — matches order/route.ts paise values. */
const PLAN_PRICE_INR: Record<string, number> = {
  ANNUAL: 499,
  MONTHLY: 49, // DECISIONS.md 2026-05-21 | Finance — ₹49/month GST-inclusive
};

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cycle,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    if (!cycle || !["ANNUAL", "MONTHLY"].includes(cycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // Verify payment signature
    // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("[Razorpay] Signature verification failed");
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Server-enforced amount — never trust amount from client
    const amountPaidInr = PLAN_PRICE_INR[cycle as string];

    // Payment verified — create subscription
    const now = new Date();
    const periodEnd = new Date(now);
    if (cycle === "ANNUAL") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan: "PRO",
      status: "ACTIVE",
      billing_cycle: cycle,
      amount_paid: amountPaidInr,         // server-enforced ₹499, never client value
      razorpay_subscription_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    if (insertError) {
      console.error("[Razorpay] Subscription insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
    }

    // Mark referral as converted (if this user was referred by a channel partner)
    await supabase
      .from("referrals")
      .update({ converted_at: now.toISOString() })
      .eq("user_id", user.id)
      .is("converted_at", null);

    // Send subscription confirmation email — fire-and-forget, never blocks response
    if (user.email) {
      sendEmail({
        to: user.email,
        ...templates.subscriptionConfirmation({
          plan: "PRO",
          cycle: cycle === "ANNUAL" ? "ANNUAL" : "MONTHLY",
          amount: amountPaidInr,
          periodEnd: periodEnd.toISOString(),
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Razorpay] Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
