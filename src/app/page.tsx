"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validations";
import { isRateLimited } from "@/lib/security";
import { captureReferral } from "@/lib/referral";
import FieldError from "@/components/FieldError";
import {
  Shield,
  ArrowRight,
  Mail,
  Loader2,
  CheckCircle2,
  Lock,
  TrendingUp,
  Users,
  Bell,
  Landmark,
} from "lucide-react";
import HeroIllustration from "@/components/illustrations/HeroIllustration";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Capture referral code from URL params (e.g., ?ref=CA-MEHTA-XY12)
  useEffect(() => {
    captureReferral();
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched) setEmailError(validateEmail(val));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    // Rate limit: max 5 login attempts per minute
    if (isRateLimited(`login_${email}`, 5, 60_000)) {
      setError("Too many login attempts. Please wait a minute and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">KutumbKosh</span>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> DPDPA</span>
          </div>
        </div>
      </header>

      {/* Main — tight to header */}
      <main className="flex-1 px-6 pt-6 lg:pt-8 pb-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Left: Headline + Illustration + Features */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full text-blue-700 text-xs font-semibold mb-4">
                <Shield className="w-3 h-3" /> For Indian families
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                One vault for{" "}
                <span className="text-blue-600">every financial asset</span>
              </h1>

              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Bank accounts, mutual funds, insurance, EPF, property &mdash; all in one place.
                Map nominees, track gaps, and ensure your family is never left searching.
              </p>

              {/* Illustration */}
              <div className="w-full max-w-sm mb-8 hidden lg:block">
                <HeroIllustration />
              </div>

              {/* Feature row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Landmark, label: "11 asset types", color: "text-blue-600", bg: "bg-blue-50" },
                  { icon: Users, label: "Nominee mapping", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { icon: Bell, label: "Gap alerts", color: "text-amber-600", bg: "bg-amber-50" },
                  { icon: TrendingUp, label: "Value tracking", color: "text-violet-600", bg: "bg-violet-50" },
                ].map((f) => (
                  <div key={f.label} className="text-center">
                    <div className={`w-9 h-9 ${f.bg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                      <f.icon className={`w-4 h-4 ${f.color}`} />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{f.label}</p>
                  </div>
                ))}
              </div>

              {/* Expert Endorsements */}
              <div className="mt-8 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recommended by experts</p>
                {[
                  {
                    quote: "Every family should have a single source of truth for their financial assets. KutumbKosh does exactly this, and it does it with the right level of security.",
                    name: "CA Raghav Mehta",
                    title: "Chartered Accountant, 12+ yrs in family tax planning",
                  },
                  {
                    quote: "I recommend KutumbKosh to all my clients. Nominee gaps are the #1 issue I see in estate disputes — this tool makes those gaps impossible to miss.",
                    name: "Adv. Sneha Iyer",
                    title: "Estate & Succession Planning Lawyer, Mumbai",
                  },
                ].map((t) => (
                  <div key={t.name} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed italic mb-2">&ldquo;{t.quote}&rdquo;</p>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{t.name}</p>
                      <p className="text-[10px] text-gray-400">{t.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              {/* Mobile illustration */}
              <div className="w-full max-w-xs mx-auto mb-6 lg:hidden">
                <HeroIllustration />
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm max-w-md mx-auto lg:mx-0">
                {!sent ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">KutumbKosh</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1 mt-4">
                      Get started &mdash; it&apos;s free
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      No password needed. We&apos;ll send a secure magic link.
                    </p>
                    <form onSubmit={handleLogin} className="space-y-3">
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            onBlur={() => { setTouched(true); setEmailError(validateEmail(email)); }}
                            placeholder="you@example.com"
                            required
                            className={`input-field pl-10 bg-white ${emailError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                            disabled={loading}
                          />
                        </div>
                        <FieldError error={emailError} />
                      </div>

                      {error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
                      )}

                      <button type="submit" disabled={loading || !email} className="btn-primary w-full">
                        {loading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                        ) : (
                          <>Continue with email <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                      </button>
                    </form>
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> End-to-end encrypted</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> DPDPA compliant</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Check your email</p>
                    <p className="text-xs text-gray-500 mb-1">
                      Login link sent to <span className="font-medium text-gray-900">{email}</span>
                    </p>
                    <p className="text-xs text-gray-400 mb-4">Expires in 1 hour</p>
                    <button onClick={() => { setSent(false); setEmail(""); }} className="text-xs text-blue-600 font-medium hover:underline">
                      Use a different email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-xs text-gray-400">&copy; 2026 KutumbKosh. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="/security" className="hover:text-gray-600 transition-colors">Security</a>
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
