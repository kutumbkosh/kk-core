"use client";

import { useState, useEffect } from "react";
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
  Lock,
  TrendingUp,
  Users,
  Bell,
  Landmark,
  Inbox,
  RefreshCw,
  ArrowLeft,
  Fingerprint,
} from "lucide-react";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";


export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const TESTIMONIALS = [
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
  ];

  // Capture referral code from URL params (e.g., ?ref=CA-MEHTA-XY12)
  useEffect(() => {
    captureReferral();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [TESTIMONIALS.length]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Check for auth error in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth") {
      setError("Your login link has expired or is invalid. Please request a new one.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched) setEmailError(validateEmail(val));
  };

  const sendMagicLink = async (targetEmail: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    if (isRateLimited(`login_${email}`, 5, 60_000)) {
      setError("Too many login attempts. Please wait a minute and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendMagicLink(email);
      setSent(true);
      setCountdown(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResent(false);
    try {
      await sendMagicLink(email);
      setResent(true);
      setCountdown(30);
      setTimeout(() => setResent(false), 3000);
    } catch {
      setError("Could not resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Detect email provider for "Open inbox" button
  const getEmailProvider = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return null;
    if (domain === "gmail.com") return { name: "Gmail", url: "https://mail.google.com" };
    if (domain === "outlook.com" || domain === "hotmail.com" || domain === "live.com")
      return { name: "Outlook", url: "https://outlook.live.com" };
    if (domain === "yahoo.com" || domain === "ymail.com")
      return { name: "Yahoo Mail", url: "https://mail.yahoo.com" };
    if (domain === "icloud.com" || domain === "me.com")
      return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
    return null;
  };

  const emailProvider = getEmailProvider(email);

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
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Built for Privacy</span>
            <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> No passwords stored</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 pt-6 lg:pt-8 pb-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Left: Headline + Illustration + Features */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full text-blue-700 text-xs font-semibold mb-4">
                <Shield className="w-3 h-3" /> Built for Indian families
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

              {/* Expert Endorsements — auto-rotating slider */}
              <div className="mt-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recommended by experts</p>
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                  >
                    {TESTIMONIALS.map((t) => (
                      <div key={t.name} className="w-full flex-shrink-0 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed italic mb-2">&ldquo;{t.quote}&rdquo;</p>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{t.name}</p>
                          <p className="text-[10px] text-gray-400">{t.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dot navigation */}
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeSlide
                          ? "w-4 h-1.5 bg-blue-500"
                          : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
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
                      We&apos;ll email you a secure login link. No password needed &mdash; ever.
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
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
                      )}

                      <button type="submit" disabled={loading || !email} className="btn-primary w-full">
                        {loading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending secure link...</>
                        ) : (
                          <>Continue with email <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                      </button>
                    </form>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-start gap-2 p-2.5 bg-blue-50/60 rounded-lg">
                        <Fingerprint className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-semibold text-gray-700">Why no password?</span>{" "}
                            Passwords can be stolen. We use one-time secure links sent to your email &mdash; it&apos;s safer and simpler.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> End-to-end encrypted</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Privacy first</span>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    {/* Back button */}
                    <button
                      onClick={() => { setSent(false); setEmail(""); setError(""); setResent(false); setCountdown(0); }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>

                    <div className="text-center">
                      {/* Animated envelope icon */}
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Inbox className="w-8 h-8 text-blue-600" />
                      </div>

                      <h2 className="text-base font-bold text-gray-900 mb-1">Check your inbox</h2>
                      <p className="text-sm text-gray-500 mb-1">
                        We sent a login link to
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mb-4">{email}</p>

                      {/* Open email provider button */}
                      {emailProvider && (
                        <a
                          href={emailProvider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full mb-3"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Open {emailProvider.name}
                        </a>
                      )}

                      {/* Instructions */}
                      <div className="bg-gray-100 rounded-lg p-3.5 mb-4 text-left">
                        <p className="text-xs font-semibold text-gray-700 mb-2">What to look for:</p>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-400 mt-0.5">1.</span>
                            <p className="text-xs text-gray-600">Look for an email from <span className="font-medium">noreply@kutumbkosh.com</span></p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-400 mt-0.5">2.</span>
                            <p className="text-xs text-gray-600">Subject: <span className="font-medium">&ldquo;Your KutumbKosh Login Link&rdquo;</span></p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-400 mt-0.5">3.</span>
                            <p className="text-xs text-gray-600">Click the blue <span className="font-medium">&ldquo;Sign in to KutumbKosh&rdquo;</span> button</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2.5 pt-2 border-t border-gray-200">
                          Can&apos;t find it? Check your spam or promotions folder.
                        </p>
                      </div>

                      {/* Resend */}
                      <div className="flex items-center justify-center gap-1.5">
                        {resent ? (
                          <p className="text-xs text-green-600 font-medium">Link sent again!</p>
                        ) : countdown > 0 ? (
                          <p className="text-xs text-gray-400">Resend in {countdown}s</p>
                        ) : (
                          <button
                            onClick={handleResend}
                            disabled={resending}
                            className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline disabled:opacity-50"
                          >
                            {resending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Resend login link
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Security footer */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure link</span>
                      <span>&middot;</span>
                      <span>Expires in 1 hour</span>
                      <span>&middot;</span>
                      <span>Single use</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>


      <HowItWorks />

      <FAQ />

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:justify-between">
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
>
        </div>
      </footer>
    </div>
  );
}
