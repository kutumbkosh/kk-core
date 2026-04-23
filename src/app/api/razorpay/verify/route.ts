import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

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
      amount,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
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
      amount_paid: amount,
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Razorpay] Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
