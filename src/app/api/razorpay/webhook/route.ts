import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, templates } from "@/lib/resend";
import { calculateGst } from "@/lib/gst";

/**
 * Razorpay Webhook Handler — HANDOFFS.md ID 11
 *
 * Security: HMAC-SHA256 signature verification via timingSafeEqual().
 * Without this, a malicious actor can fake payment events and get Pro for free.
 *
 * Idempotency: every event is logged to razorpay_events BEFORE processing.
 * Unique constraint on razorpay_event_id prevents double-processing on retries.
 *
 * Events handled:
 *   payment.captured      → activate Pro subscription + GST invoice email
 *   subscription.activated → store subscription_id, confirm ACTIVE (Subscriptions API)
 *   subscription.charged   → extend period_end + GST invoice email (Subscriptions API)
 *   subscription.cancelled → retain access to period end, no immediate downgrade
 *   payment.failed        → 7-day grace period, send retry email
 *   subscription.completed → downgrade to Free (period has naturally ended)
 *
 * NOTE: subscription.* events only fire when Razorpay Subscriptions API is used
 * (monthly recurring). Currently we use Orders API (one-time). These handlers
 * are ready for when Subscriptions API is enabled (HANDOFFS.md ID 55 + ID 9).
 *
 * Env vars required:
 *   RAZORPAY_WEBHOOK_SECRET   — set in Razorpay dashboard when creating the webhook
 *   SUPABASE_SERVICE_ROLE_KEY — bypasses RLS; never exposed to client
 */

// Node.js runtime required — crypto.timingSafeEqual is not available on Edge
export const runtime = "nodejs";

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

interface RazorpayPaymentEntity {
  id: string;
  order_id?: string;
  amount: number; // paise
  currency: string;
  notes?: {
    user_id?: string;
    plan?: string;
    cycle?: string;
  };
  error_description?: string;
}

interface RazorpaySubscriptionEntity {
  id: string;
  plan_id?: string;
  status?: string;
  current_start?: number; // unix timestamp
  current_end?: number;   // unix timestamp
  notes?: {
    user_id?: string;
    plan?: string;
    cycle?: string;
  };
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    subscription?: { entity: RazorpaySubscriptionEntity };
  };
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

/** Derive a deterministic idempotency key from the event. */
function idempotencyKey(event: RazorpayWebhookPayload): string {
  const payment = event.payload.payment?.entity;
  const subscription = event.payload.subscription?.entity;
  const entityId = payment?.id ?? subscription?.id ?? "unknown";
  return `${entityId}:${event.event}`;
}

/** Convert a Unix timestamp (seconds) to ISO string. */
function unixToIso(unix: number): string {
  return new Date(unix * 1000).toISOString();
}

// -------------------------------------------------------------------------
// POST /api/razorpay/webhook
// -------------------------------------------------------------------------

export async function POST(request: Request) {
  // 1. Read raw body BEFORE any JSON parsing — required for HMAC verification
  const rawBody = await request.text();

  // 2. Verify signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  // timingSafeEqual prevents timing attacks
  const sigBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSig, "utf8");

  const signaturesMatch =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!signaturesMatch) {
    console.error("[Webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Parse event
  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventKey = idempotencyKey(event);
  const supabase = createServiceClient();

  // 4. Log event — idempotency via UNIQUE constraint on razorpay_event_id
  const { error: logError } = await supabase.from("razorpay_events").insert({
    razorpay_event_id: eventKey,
    event_type: event.event,
    payload: event,
    processing_status: "success", // updated to 'failed' on error below
  });

  if (logError) {
    // Unique violation (code 23505) = already processed this event → acknowledge
    if (logError.code === "23505") {
      return NextResponse.json({ received: true, note: "duplicate" });
    }
    console.error("[Webhook] Failed to log event:", logError);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }

  // 5. Dispatch to handler
  try {
    await handleEvent(event, supabase);
  } catch (err) {
    console.error(`[Webhook] Handler error for ${event.event}:`, err);
    // Update log to reflect failure — but still return 200 so Razorpay doesn't retry
    await supabase
      .from("razorpay_events")
      .update({ processing_status: "failed", error_message: String(err) })
      .eq("razorpay_event_id", eventKey);
  }

  // Always return 200 — non-200 causes Razorpay to retry
  return NextResponse.json({ received: true });
}

// -------------------------------------------------------------------------
// Event handlers
// -------------------------------------------------------------------------

type ServiceClient = ReturnType<typeof createServiceClient>;

async function handleEvent(event: RazorpayWebhookPayload, supabase: ServiceClient) {
  switch (event.event) {
    case "payment.captured":
      return handlePaymentCaptured(event.payload.payment!.entity, supabase);
    case "subscription.activated":
      return handleSubscriptionActivated(event.payload.subscription!.entity, supabase);
    case "subscription.charged":
      return handleSubscriptionCharged(event.payload, supabase);
    case "subscription.cancelled":
      return handleSubscriptionCancelled(event.payload.subscription!.entity, supabase);
    case "payment.failed":
      return handlePaymentFailed(event.payload.payment!.entity, supabase);
    case "subscription.completed":
      return handleSubscriptionCompleted(event.payload.subscription!.entity, supabase);
    default:
      console.log(`[Webhook] Unhandled event type: ${event.event}`);
  }
}

// -------------------------------------------------------------------------
// payment.captured
// Fires when a one-time Razorpay Order payment is captured.
// This is the server-side backup to verify/route.ts (which the client calls).
// Both paths must be idempotent: check razorpay_payment_id before inserting.
// -------------------------------------------------------------------------
async function handlePaymentCaptured(payment: RazorpayPaymentEntity, supabase: ServiceClient) {
  const userId = payment.notes?.user_id;
  const cycle = (payment.notes?.cycle ?? "ANNUAL") as "ANNUAL" | "MONTHLY";
  const amountPaise = payment.amount;
  const amountInr = Math.round(amountPaise / 100);

  if (!userId) {
    throw new Error(`payment.captured: no user_id in notes for payment ${payment.id}`);
  }

  // Idempotency: check if subscription already exists for this payment
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("razorpay_payment_id", payment.id)
    .single();

  if (existing) {
    console.log(`[Webhook] payment.captured: subscription already exists for ${payment.id} — skipping`);
    return;
  }

  // Calculate period end
  const now = new Date();
  const periodEnd = new Date(now);
  if (cycle === "ANNUAL") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Create subscription
  const { error: insertError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan: "PRO",
    status: "ACTIVE",
    billing_cycle: cycle,
    amount_paid: amountInr,
    razorpay_subscription_id: payment.order_id ?? null,
    razorpay_payment_id: payment.id,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    updated_at: now.toISOString(),
  });

  if (insertError) throw new Error(`Subscription insert failed: ${insertError.message}`);

  // Send GST invoice + confirmation emails — awaited so Vercel doesn't kill them before they fire
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  const userEmail = profile?.email ?? null;
  if (userEmail) {
    const gst = calculateGst(amountInr);
    const { data: invoiceNum } = await supabase.rpc("get_next_invoice_number");

    await sendEmail({
      to: userEmail,
      ...templates.invoiceConfirmation({
        invoiceNumber: invoiceNum ?? `KK-${new Date().getFullYear()}-XXXX`,
        cycle,
        collectedInr: gst.collected,
        baseInr: gst.base,
        gstInr: gst.gstTotal,
        taxType: gst.taxType,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        paymentId: payment.id,
        periodEnd: periodEnd.toISOString(),
      }),
    });

    await sendEmail({
      to: userEmail,
      ...templates.subscriptionConfirmation({
        plan: "PRO",
        cycle,
        amount: amountInr,
        periodEnd: periodEnd.toISOString(),
      }),
    });
  }

  console.log(`[Webhook] payment.captured: Pro activated for user ${userId}, payment ${payment.id}`);
}

// -------------------------------------------------------------------------
// subscription.activated
// Fires when a Razorpay Subscription is created and first payment is made.
// Only fires when using Razorpay Subscriptions API (monthly recurring — ID 55).
// Updates existing subscription (created by verify/route.ts) with subscription_id.
// -------------------------------------------------------------------------
async function handleSubscriptionActivated(sub: RazorpaySubscriptionEntity, supabase: ServiceClient) {
  const userId = sub.notes?.user_id;
  if (!userId) {
    throw new Error(`subscription.activated: no user_id in notes for subscription ${sub.id}`);
  }

  const now = new Date();
  const periodStart = sub.current_start ? unixToIso(sub.current_start) : now.toISOString();
  const periodEnd = sub.current_end ? unixToIso(sub.current_end) : null;

  // Update the most recent PRO subscription for this user with the subscription ID
  const { error } = await supabase
    .from("subscriptions")
    .update({
      razorpay_subscription_id: sub.id,
      status: "ACTIVE",
      current_period_start: periodStart,
      ...(periodEnd ? { current_period_end: periodEnd } : {}),
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId)
    .eq("plan", "PRO")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(`subscription.activated update failed: ${error.message}`);

  console.log(`[Webhook] subscription.activated: updated sub ${sub.id} for user ${userId}`);
}

// -------------------------------------------------------------------------
// subscription.charged
// Fires each billing cycle for recurring subscriptions.
// Extends current_period_end and emails a GST invoice.
// -------------------------------------------------------------------------
async function handleSubscriptionCharged(
  payload: RazorpayWebhookPayload["payload"],
  supabase: ServiceClient
) {
  const sub = payload.subscription!.entity;
  const payment = payload.payment?.entity;

  const periodEnd = sub.current_end ? unixToIso(sub.current_end) : null;
  const amountPaise = payment?.amount ?? 0;
  const amountInr = Math.round(amountPaise / 100);
  const now = new Date();

  // Find subscription by razorpay_subscription_id
  const { data: dbSub } = await supabase
    .from("subscriptions")
    .select("id, user_id, billing_cycle")
    .eq("razorpay_subscription_id", sub.id)
    .single();

  if (!dbSub) {
    throw new Error(`subscription.charged: no subscription found for ${sub.id}`);
  }

  // Extend period and clear any grace period
  const updates: Record<string, unknown> = {
    status: "ACTIVE",
    grace_period_ends_at: null,
    updated_at: now.toISOString(),
  };
  if (periodEnd) updates.current_period_end = periodEnd;
  if (amountInr > 0) updates.amount_paid = amountInr;

  const { error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", dbSub.id);

  if (error) throw new Error(`subscription.charged update failed: ${error.message}`);

  // Send GST invoice — awaited so Vercel doesn't kill it before it fires
  if (amountInr > 0 && payment?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", dbSub.user_id)
      .single();

    if (profile?.email) {
      const gst = calculateGst(amountInr);
      const { data: invoiceNum } = await supabase.rpc("get_next_invoice_number");

      await sendEmail({
        to: profile.email,
        ...templates.invoiceConfirmation({
          invoiceNumber: invoiceNum ?? `KK-${new Date().getFullYear()}-XXXX`,
          cycle: dbSub.billing_cycle as "ANNUAL" | "MONTHLY",
          collectedInr: gst.collected,
          baseInr: gst.base,
          gstInr: gst.gstTotal,
          taxType: gst.taxType,
          cgst: gst.cgst,
          sgst: gst.sgst,
          igst: gst.igst,
          paymentId: payment.id,
          periodEnd: periodEnd ?? now.toISOString(),
        }),
      });
    }
  }

  console.log(`[Webhook] subscription.charged: renewed sub ${sub.id}, period end ${periodEnd}`);
}

// -------------------------------------------------------------------------
// subscription.cancelled
// User or admin cancelled in Razorpay. Access is retained until period_end.
// Does NOT downgrade immediately — useSubscription hook checks period_end.
// -------------------------------------------------------------------------
async function handleSubscriptionCancelled(sub: RazorpaySubscriptionEntity, supabase: ServiceClient) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "CANCELLED",
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_subscription_id", sub.id);

  if (error) throw new Error(`subscription.cancelled update failed: ${error.message}`);

  console.log(`[Webhook] subscription.cancelled: sub ${sub.id} marked CANCELLED (access until period end)`);
}

// -------------------------------------------------------------------------
// payment.failed
// A payment attempt failed. Do NOT downgrade immediately.
// Start 7-day grace period: set status=PAST_DUE, grace_period_ends_at=now+7d.
// HANDOFFS.md ID 11: "Do NOT downgrade immediately on payment.failed."
// -------------------------------------------------------------------------
async function handlePaymentFailed(payment: RazorpayPaymentEntity, supabase: ServiceClient) {
  const userId = payment.notes?.user_id;
  if (!userId) {
    // payment.failed for a new (never-Pro) user — no subscription to update
    console.log(`[Webhook] payment.failed: no user_id in notes for ${payment.id} — ignoring`);
    return;
  }

  const graceEnds = new Date();
  graceEnds.setDate(graceEnds.getDate() + 7);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "PAST_DUE",
      grace_period_ends_at: graceEnds.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("plan", "PRO")
    .in("status", ["ACTIVE", "PAST_DUE"]); // only update active subs, not already-cancelled ones

  if (error) throw new Error(`payment.failed update failed: ${error.message}`);

  // Send retry email (fire-and-forget)
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  const amountInr = Math.round(payment.amount / 100);
  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      ...templates.failedPayment({
        amount: amountInr,
        orderId: payment.order_id,
      }),
    });
  }

  console.log(`[Webhook] payment.failed: PAST_DUE set for user ${userId}, grace until ${graceEnds.toISOString()}`);
}

// -------------------------------------------------------------------------
// subscription.completed
// Subscription period has ended and was not renewed. Downgrade to Free.
// Assets become read-only (useSubscription hook enforces this, no DB asset change).
// -------------------------------------------------------------------------
async function handleSubscriptionCompleted(sub: RazorpaySubscriptionEntity, supabase: ServiceClient) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "EXPIRED",
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_subscription_id", sub.id);

  if (error) throw new Error(`subscription.completed update failed: ${error.message}`);

  console.log(`[Webhook] subscription.completed: sub ${sub.id} expired — user downgraded to Free`);
}
