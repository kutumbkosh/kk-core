import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { amount, cycle } = await request.json();

    if (!amount || !cycle || !["ANNUAL", "MONTHLY"].includes(cycle)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // Create Razorpay order via their API
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects paise
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
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("[Razorpay] Order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
