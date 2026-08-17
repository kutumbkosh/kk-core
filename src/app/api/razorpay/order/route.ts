import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-enforced pricing — never trust client-provided amount.
 * Decisions locked: DECISIONS.md 2026-05-07 | Finance (annual)
 *                   DECISIONS.md 2026-05-21 | Finance (monthly — HANDOFFS.md ID 55)
 * ₹499/year GST-inclusive → 49900 paise
 * ₹49/month  GST-inclusive →  4900 paise
 *
 * NOTE: Razorpay subscription plans must be pre-created in the Razorpay dashboard.
 * Set RAZORPAY_ANNUAL_PLAN_ID and RAZORPAY_MONTHLY_PLAN_ID in Vercel env vars
 * once Shubham completes Razorpay KYC (HANDOFFS.md ID 9).
 */
const PLAN_PRICES: Record<string, number> = {
  ANNUAL:  49900, // paise — ₹499 GST-inclusive (DECISIONS.md 2026-05-07)
  MONTHLY:  4900, // paise — ₹49  GST-inclusive (DECISIONS.md 2026-05-21)
};

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
    }

    // Only accept cycle from client — amount is always server-enforced
    const { cycle } = await request.json();

    if (!cycle || !["ANNUAL", "MONTHLY"].includes(cycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    // Server-enforced amount — ignores any amount sent by client
    const amountPaise = PLAN_PRICES[cycle as string];

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // Create Razorpay order via their REST API
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `kk_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: user.id,
          user_email: user.email,
          plan: "PRO",
          cycle,
        },
      }),
    });

    if (!orderRes.ok) {
      const errData = await orderRes.json();
      console.error("[Razorpay] Order creation failed:", errData);
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
    }

    const order = await orderRes.json();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,   // echo Razorpay's confirmed amount (paise)
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("[Razorpay] Order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
