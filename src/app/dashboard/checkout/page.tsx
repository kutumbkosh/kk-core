"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import {
  ArrowLeft,
  Crown,
  Shield,
  Check,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles,
} from "lucide-react";

const PLANS = {
  PRO: {
    ANNUAL: { price: 499, label: "Pro Annual", perMonth: 42, saving: "Save 49% vs monthly" },
    MONTHLY: { price: 79, label: "Pro Monthly", perMonth: 79, saving: null },
  },
};

type PaymentMethod = "upi" | "card" | "netbanking";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPro, refresh } = useSubscription();

  const rawCycle = searchParams.get("cycle") || "ANNUAL";
  const cycleKey = (rawCycle === "ANNUAL" || rawCycle === "MONTHLY" ? rawCycle : "ANNUAL") as "ANNUAL" | "MONTHLY";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cycle, setCycle] = useState(cycleKey);

  const currentPlan = PLANS.PRO[cycle] || PLANS.PRO.ANNUAL;

  // If already pro, redirect
  useEffect(() => {
    if (isPro) {
      router.replace("/dashboard/subscription");
    }
  }, [isPro, router]);

  const handlePayment = async () => {
    setProcessing(true);

    // Mock: simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create subscription in database
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

    // Mark referral as converted (if this user was referred by a channel partner)
    await supabase
      .from("referrals")
      .update({ converted_at: now.toISOString() })
      .eq("user_id", user.id)
      .is("converted_at", null);

    await refresh();
    setProcessing(false);
    setSuccess(true);
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
              <span className="text-xs text-gray-500">Next billing</span>
              <span className="text-sm text-gray-600">
                {cycle === "ANNUAL" ? "March 2027" : "April 2026"}
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

        {/* Payment method */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment method</h2>
          <div className="space-y-2">
            {([
              { id: "upi" as const, label: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: Smartphone },
              { id: "card" as const, label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
              { id: "netbanking" as const, label: "Net Banking", desc: "All major banks", icon: Building2 },
            ]).map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === method.id
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  paymentMethod === method.id ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <method.icon className={`w-4.5 h-4.5 ${paymentMethod === method.id ? "text-blue-600" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id ? "border-blue-500" : "border-gray-300"
                }`}>
                  {paymentMethod === method.id && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  )}
                </div>
              </button>
            ))}
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

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-3.5 rounded-xl bg-vault-accent text-white font-bold text-base hover:bg-blue-700 active:bg-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing payment...</>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Pay &#8377;{currentPlan.price}
            </>
          )}
        </button>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pb-4">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 256-bit SSL</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Razorpay secured</span>
          <span>7-day money-back guarantee</span>
        </div>
      </main>
    </div>
  );
}
