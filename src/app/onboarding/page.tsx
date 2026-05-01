"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getReferralCode, getReferralSource, clearReferral } from "@/lib/referral";
import {
  Shield,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function OnboardingProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    dob: "",
    pan_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Upsert profile
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: form.full_name,
        email: user.email,
        phone: form.phone || null,
        dob: form.dob || null,
        pan_number: form.pan_number || null,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      // Attribute referral if a referral code is stored
      const refCode = getReferralCode();
      if (refCode) {
        try {
          // Look up the partner by referral code
          const { data: partner } = await supabase
            .from("channel_partners")
            .select("id, commission_per_signup")
            .eq("referral_code", refCode)
            .eq("status", "ACTIVE")
            .single();

          if (partner) {
            await supabase.from("referrals").upsert({
              user_id: user.id,
              partner_id: partner.id,
              referral_code: refCode,
              source: getReferralSource(),
              signed_up_at: new Date().toISOString(),
              commission_amount: partner.commission_per_signup,
            }, { onConflict: "user_id" });
          }
          clearReferral();
        } catch {
          // Silently fail — referral attribution is non-critical
        }
      }

      router.push("/onboarding/emergency-contact");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-vault-dark text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="text-sm font-medium text-vault-dark">
              Your Profile
            </span>
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-sm text-gray-400">Emergency Contact</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-vault-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Set up your profile
              </h1>
              <p className="text-sm text-gray-500">
                This helps us personalize your vault
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="e.g., Rajesh Kumar"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Mobile Number{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="dob" className="label">
                Date of Birth{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="pan" className="label">
                PAN Number{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="pan"
                type="text"
                value={form.pan_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pan_number: e.target.value.toUpperCase(),
                  })
                }
                placeholder="ABCDE1234F"
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Helps identify your accounts. Stored encrypted.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Shield className="w-4 h-4 text-vault-accent flex-shrink-0" />
              <p className="text-xs text-gray-600">
                All personal data is encrypted and stored securely. Designed
                with India&apos;s DPDPA 2023 in mind.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !form.full_name}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
