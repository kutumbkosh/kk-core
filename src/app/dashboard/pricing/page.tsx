"use client";

import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Shield,
  Zap,
  Users,
  FileText,
  AlertTriangle,
  Download,
  Bell,
  Percent,
  Headphones,
  Infinity,
} from "lucide-react";

const features = [
  { name: "Assets", free: "Up to 3", pro: "Unlimited", icon: FileText },
  { name: "Nominees", free: "Up to 2", pro: "Unlimited", icon: Users },
  { name: "Asset-nominee linking", free: "Basic", pro: "With share %", icon: Percent },
  { name: "Smart reminders", free: "Nominee gaps only", pro: "All types (expiry, maturity, review)", icon: Bell },
  { name: "Emergency access", free: false, pro: true, icon: AlertTriangle },
  { name: "PDF export", free: false, pro: true, icon: Download },
  { name: "Trusted contacts & dossier", free: false, pro: true, icon: Shield },
  { name: "Priority support", free: false, pro: true, icon: Headphones },
];

export default function PricingPage() {
  const router = useRouter();
  const { plan, isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Choose your plan</h1>
            <p className="text-sm text-gray-500">Protect your family&apos;s financial future</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {/* Free plan */}
          <div className={`card p-6 ${plan === "FREE" ? "border-gray-300 ring-1 ring-gray-300" : ""}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Free</h2>
                <p className="text-xs text-gray-500">Get started</p>
              </div>
            </div>
            <div className="mb-5">
              <span className="text-3xl font-extrabold text-gray-900">&#8377;0</span>
              <span className="text-sm text-gray-500 ml-1">forever</span>
            </div>
            {plan === "FREE" ? (
              <div className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm font-semibold text-center mb-5">
                Current plan
              </div>
            ) : (
              <div className="w-full py-2.5 rounded-lg bg-gray-50 text-gray-400 text-sm font-semibold text-center mb-5">
                Free tier
              </div>
            )}
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f.name} className="flex items-start gap-2.5">
                  {f.free === false ? (
                    <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm ${f.free === false ? "text-gray-400" : "text-gray-700"}`}>{f.name}</p>
                    {typeof f.free === "string" && (
                      <p className="text-xs text-gray-400">{f.free}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro plan */}
          <div className={`card p-6 relative ${isPro ? "border-blue-300 ring-2 ring-blue-200" : "border-blue-200 ring-2 ring-blue-100"}`}>
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-vault-accent text-white text-xs font-bold rounded-full shadow-sm">
                MOST POPULAR
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Pro</h2>
                <p className="text-xs text-gray-500">Full protection</p>
              </div>
            </div>
            <div className="mb-1">
              <span className="text-3xl font-extrabold text-gray-900">&#8377;499</span>
              <span className="text-sm text-gray-500 ml-1">/year</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Inclusive of GST</p>

            {isPro ? (
              <div className="w-full py-2.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold text-center mb-5 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Active
              </div>
            ) : (
              <button
                onClick={() => router.push("/dashboard/checkout?plan=PRO&cycle=ANNUAL")}
                className="w-full btn-primary mb-5"
              >
                <Zap className="w-4 h-4 mr-1.5" /> Upgrade to Pro
              </button>
            )}
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f.name} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{f.name}</p>
                    {typeof f.pro === "string" && (
                      <p className="text-xs text-blue-600 font-medium">{f.pro}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Detailed comparison</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {features.map((f) => (
              <div key={f.name} className="grid grid-cols-3 items-center px-5 py-3">
                <div className="flex items-center gap-2">
                  <f.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{f.name}</span>
                </div>
                <div className="text-center">
                  {f.free === false ? (
                    <X className="w-4 h-4 text-gray-300 mx-auto" />
                  ) : f.free === true ? (
                    <Check className="w-4 h-4 text-gray-500 mx-auto" />
                  ) : (
                    <span className="text-xs text-gray-500">{f.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {f.pro === true ? (
                    <Check className="w-4 h-4 text-blue-600 mx-auto" />
                  ) : (
                    <span className="text-xs text-blue-600 font-medium">{f.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 px-5 py-2 bg-gray-50 border-t border-gray-100">
            <div />
            <p className="text-xs font-semibold text-gray-500 text-center">Free</p>
            <p className="text-xs font-semibold text-blue-600 text-center">Pro</p>
          </div>
        </div>

        {/* Expert Endorsements */}
        <div className="mt-10 mb-10">
          <h3 className="text-base font-bold text-gray-900 mb-4 text-center">Trusted by financial professionals</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                quote: "KutumbKosh Pro is something I actively recommend during tax planning sessions. The PDF export alone saves my clients hours when documenting their asset portfolio.",
                name: "CA Raghav Mehta",
                title: "Chartered Accountant",
                specialty: "Family Tax Planning",
              },
              {
                quote: "The nominee gap detection has caught missing nominations for 3 out of 5 clients I've onboarded. At ₹499/year, it pays for itself in avoiding a single legal dispute.",
                name: "Adv. Sneha Iyer",
                title: "Succession Lawyer",
                specialty: "Estate Planning, Mumbai",
              },
              {
                quote: "As a SEBI-registered advisor, I see families struggle to locate assets after a loss. KutumbKosh's emergency dossier feature is exactly what the industry needed.",
                name: "Vikram Desai, CFP",
                title: "Certified Financial Planner",
                specialty: "SEBI RIA, Bengaluru",
              },
            ].map((t) => (
              <div key={t.name} className="card p-4">
                <p className="text-sm text-gray-600 leading-relaxed italic mb-3">&ldquo;{t.quote}&rdquo;</p>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 space-y-4">
          <h3 className="text-base font-bold text-gray-900">Common questions</h3>
          {[
            { q: "Can I try Pro features before paying?", a: "All features are visible in the app. You can see exactly what you\u2019ll get before upgrading. We also offer a full refund within 7 days if you\u2019re not satisfied." },
            { q: "What happens to my data if I cancel?", a: "Your data stays safe. You\u2019ll keep access to your first 3 assets and 2 nominees on the free plan. Nothing is deleted." },
            { q: "Is my payment information secure?", a: "Payments are processed securely through Razorpay, India\u2019s leading payment gateway. We never store your card details." },
            { q: "Is billing annual only?", a: "Yes, KutumbKosh Pro is billed annually at ₹499/year. This keeps things simple and gives your family uninterrupted protection for the whole year." },
          ].map((item) => (
            <div key={item.q} className="card p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{item.q}</p>
              <p className="text-sm text-gray-500">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
