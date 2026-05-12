"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import {
  ArrowLeft,
  Crown,
  Shield,
  Check,
  Loader2,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const PLANS = {
  PRO: {
    ANNUAL: { price: 499, label: "Pro Annual", perMonth: 42, saving: "Save 49% vs monthly" },
    MONTHLY: { price: 79, label: "Pro Monthly", perMonth: 79, saving: null },
  },
};

const isMockPayments = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === "true";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPro, refresh } = useSubscription();

  const rawCycle = searchParams.get("cycle") || "ANNUAL";
  const cycleKey = (rawCycle === "ANNUAL" || rawCycle === "MONTHLY" ? rawCycle : "ANNUAL") as "ANNUAL" | "MONTHLY";

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cycle, setCycle] = useState(cycleKey);
  const [scriptLoaded, setScriptLoaded] = useState(isMockPayments);

  const currentPlan = PLANS.PRO[cycle] || PLANS.PRO.ANNUAL;

  // If already pro, redirect
  useEffect(() => {
    if (isPro) {
      router.replace("/dashboard/subscription");
    }
  }, [isPro, router]);

  // Load Razorpay script
  useEffect(() => {
    if (isMockPayments) return;

    // Already loaded from a previous render
    if (typeof window.Razorpay === "function") {
      setScriptLoaded(true);
      return;
    }

    // Script tag already exists — wait for it
    if (document.getElementById("razorpay-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Failed to load payment gateway. Please refresh and try again.");
    document.body.appendChild(script);
  }, []);

  const handleMockPayment = async () => {
    setProcessing(true);
    setError("");

    await new Promise(resolve => setTimeout(resolve, 2000));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const periodEnd = new Date(now);
    if (cycle === "ANNUAL") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan: "PRO",
      status: "ACTIVE",
      billing_cycle: cycle,
      amount_paid: currentPlan.price,
      razorpay_subscription_id: `mock_sub_${Date.now()}`,
      razorpay_payment_id: `mock_pay_${Date.now()}`,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    await supabase
      .from("referrals")
      .update({ converted_at: now.toISOString() })
      .eq("user_id", user.id)
      .is("converted_at", null);

    await refresh();
    setProcessing(false);
    setSuccess(true);
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    setError("");

    try {
      // Step 1: Create order on server
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }), // amount is server-enforced — never send from client
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const { orderId, amount, currency, keyId } = await orderRes.json();

      // Step 2: Get user email for prefill
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Step 3: Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: "KutumbKosh",
        description: `${currentPlan.label} Subscription`,
        order_id: orderId,
        prefill: {
          email: user.email || "",
        },
        theme: {
          color: "#2563EB",
        },
        handler: async (response: RazorpayResponse) => {
          // Step 4: Verify payment on server
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cycle, // amount is server-enforced — never send from client
              }),
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json();
              throw new Error(errData.error || "Payment verification failed");
            }

            await refresh();
            setProcessing(false);
            setSuccess(true);
          } catch (err) {
            setProcessing(false);
            setError(err instanceof Error ? err.message : "Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      if (typeof window.Razorpay !== "function") {
        throw new Error("Payment gateway not ready. Please refresh the page and try again.");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handlePayment = () => {
    if (isMockPayments) {
      handleMockPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Welcome to KutumbKosh Pro!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Your subscription is active. All Pro features are now unlocked &mdash; unlimited assets, emergency access, PDF export, and more.
          </p>
          <div className="card p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Plan</span>
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-blue-600" /> {currentPlan.label}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Amount</span>
              <span className="text-sm font-semibold text-gray-900">&#8377;{currentPlan.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Billing</span>
              <span className="text-sm text-gray-600">
                {cycle === "ANNUAL" ? "Yearly" : "Monthly"}
              </span>
            </div>
          </div>
          <button onClick={() => router.push("/dashboard")} className="btn-primary w-full">
            Go to Dashboard
          </button>
          <button onClick={() => router.push("/dashboard/subscription")} className="btn-ghost w-full mt-2">
            Manage Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/pricing")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500">Complete your upgrade to KutumbKosh Pro</p>
          </div>
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {/* Mock payments badge */}
        {isMockPayments && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">Test Mode — no real charges will be made</p>
          </div>
        )}

        {/* Order summary */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> Order Summary
          </h2>

          {/* Cycle toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setCycle("ANNUAL")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                cycle === "ANNUAL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Annual
              {cycle === "ANNUAL" && <span className="ml-1 text-xs text-green-600">(Best value)</span>}
            </button>
            <button
              onClick={() => setCycle("MONTHLY")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                cycle === "MONTHLY" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">KutumbKosh Pro</p>
                <p className="text-xs text-gray-500">{cycle === "ANNUAL" ? "Annual subscription" : "Monthly subscription"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">&#8377;{currentPlan.price}</p>
              <p className="text-xs text-gray-500">/{cycle === "ANNUAL" ? "year" : "month"}</p>
            </div>
          </div>

          {currentPlan.saving && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg">
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-medium">{currentPlan.saving} &mdash; just &#8377;{currentPlan.perMonth}/month</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">&#8377;{currentPlan.price}</span>
          </div>
        </div>

        {/* What you get */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-800 mb-2">What you&apos;ll unlock:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {["Unlimited assets", "Unlimited nominees", "Emergency access", "PDF export", "All reminders", "Priority support"].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-700">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={processing || !scriptLoaded}
          className="w-full py-3.5 rounded-xl bg-vault-accent text-white font-bold text-base hover:bg-blue-700 active:bg-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : !scriptLoaded ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Loading payment gateway...</>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Pay &#8377;{currentPlan.price}
            </>
          )}
        </button>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pb-4">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Razorpay secured</span>
        </div>
      </main>
    </div>
  );
}
