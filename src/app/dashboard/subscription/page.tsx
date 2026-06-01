"use client";

import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import {
  ArrowLeft,
  Crown,
  Shield,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Check,
  Zap,
  Clock,
  ChevronRight,
  Download,
  Users,
  FileText,
  Bell,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SubscriptionPage() {
  const router = useRouter();
  const { plan, subscription, isPro, daysRemaining, loading, refresh } = useSubscription();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    setCancelError("");

    const supabase = createClient();
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
      .eq("id", subscription.id);

    if (error) {
      setCancelling(false);
      setCancelError("Unable to cancel your subscription. Please try again or contact care@kutumbkosh.com");
      return;
    }

    await refresh();
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin" />
      </div>
    );
  }

  const proFeatures = [
    { label: "Unlimited assets", icon: FileText },
    { label: "Unlimited nominees", icon: Users },
    { label: "Emergency access & dossier", icon: AlertTriangle },
    { label: "PDF vault export", icon: Download },
    { label: "All smart reminders", icon: Bell },
    { label: "Priority support", icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/settings")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Subscription</h1>
            <p className="text-sm text-gray-500">Manage your KutumbKosh plan</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Current plan card */}
        <div className={`card p-5 ${isPro ? "border-blue-200 bg-gradient-to-br from-white to-blue-50/30" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isPro ? "bg-blue-100" : "bg-gray-100"}`}>
              {isPro ? <Crown className="w-6 h-6 text-blue-600" /> : <Shield className="w-6 h-6 text-gray-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">KutumbKosh {plan === "PRO" ? "Pro" : "Free"}</h2>
                {isPro && subscription?.status === "ACTIVE" && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">ACTIVE</span>
                )}
                {isPro && subscription?.status === "CANCELLED" && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">CANCELLING</span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isPro ? `${subscription?.billing_cycle === "MONTHLY" ? "Monthly" : "Annual"} subscription` : "Free tier"}
              </p>
            </div>
            {isPro && subscription && (
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">&#8377;{subscription.amount_paid}</p>
                <p className="text-xs text-gray-500">/{subscription.billing_cycle === "MONTHLY" ? "mo" : "yr"}</p>
              </div>
            )}
          </div>

          {isPro && subscription && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Current period</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(subscription.current_period_start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" \u2014 "}
                  {new Date(subscription.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{subscription?.status === "CANCELLED" ? "Expires in" : "Renews in"}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {daysRemaining !== null ? `${daysRemaining} days` : "\u2014"}
                </p>
              </div>
            </div>
          )}

          {!isPro && (
            <button onClick={() => router.push("/dashboard/pricing")} className="btn-primary w-full mt-2">
              <Zap className="w-4 h-4 mr-1.5" /> Upgrade to Pro &mdash; from &#8377;49/month or &#8377;499/year
            </button>
          )}
        </div>

        {/* Pro features / what you have */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {isPro ? "Your Pro features" : "Upgrade to unlock"}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {proFeatures.map((f) => (
              <div key={f.label} className={`flex items-center gap-2 p-2.5 rounded-lg ${isPro ? "bg-blue-50/50" : "bg-gray-50"}`}>
                {isPro ? (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <f.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-sm ${isPro ? "text-gray-700" : "text-gray-500"}`}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment history */}
        {isPro && subscription && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment history</h3>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">KutumbKosh Pro &mdash; {subscription.billing_cycle === "ANNUAL" ? "Annual" : "Monthly"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(subscription.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">&#8377;{subscription.amount_paid}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isPro && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Manage</h3>
            <div className="space-y-1">
              <button
                onClick={() => router.push("/dashboard/pricing")}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Change plan</p>
                  <p className="text-xs text-gray-500">Switch between monthly and annual billing</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
              {subscription?.status === "CANCELLED" ? (
                <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-left">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700">Subscription cancelled</p>
                    <p className="text-xs text-gray-500">
                      You&apos;ll keep Pro features until {subscription.current_period_end
                        ? new Date(subscription.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                        : "the end of your billing period"}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">Cancel subscription</p>
                    <p className="text-xs text-gray-500">You&apos;ll keep Pro until the end of your billing period</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cancel confirmation modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-sm w-full p-6">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-2">Cancel your subscription?</h3>
              <p className="text-sm text-gray-500 text-center mb-2">
                You&apos;ll lose access to Pro features at the end of your current billing period.
              </p>
              <div className="text-sm text-gray-500 text-center mb-6">
                Your data is safe &mdash; you&apos;ll keep your first 3 assets and 2 nominees on the free plan.
              </div>
              {cancelError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                  {cancelError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCancelConfirm(false); setCancelError(""); }}
                  className="flex-1 py-2.5 px-4 bg-vault-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Keep Pro
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel anyway"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
