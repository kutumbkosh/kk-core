"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getReferralCode, getReferralSource, clearReferral } from "@/lib/referral";
import { validateFullName, validatePhone, validateDOB, validatePAN, type ValidationError } from "@/lib/validations";
import FieldError from "@/components/FieldError";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, ValidationError>>({
    full_name: null, phone: null, dob: null, pan_number: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): ValidationError => {
    switch (name) {
      case "full_name": return validateFullName(value);
      case "phone": return validatePhone(value);
      case "dob": return validateDOB(value);
      case "pan_number": return validatePAN(value);
      default: return null;
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, form[name as keyof typeof form]) }));
  };

  const handleChange = (name: string, value: string) => {
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    const allTouched = { full_name: true, phone: true, dob: true, pan_number: true };
    setTouched(allTouched);
    const errors = {
      full_name: validateField("full_name", form.full_name),
      phone: validateField("phone", form.phone),
      dob: validateField("dob", form.dob),
      pan_number: validateField("pan_number", form.pan_number),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(e => e !== null)) return;

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
                onChange={(e) => handleChange("full_name", e.target.value)}
                onBlur={() => handleBlur("full_name")}
                placeholder="e.g., Rajesh Kumar"
                className="input-field"
              />
              <FieldError error={fieldErrors.full_name} />
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
                onChange={(e) => handleChange("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder="+91 98765 43210"
                className="input-field"
              />
              <FieldError error={fieldErrors.phone} />
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
                onChange={(e) => handleChange("dob", e.target.value)}
                onBlur={() => handleBlur("dob")}
                className="input-field min-w-0 w-full"
              />
              <FieldError error={fieldErrors.dob} />
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
                onChange={(e) => handleChange("pan_number", e.target.value.toUpperCase())}
                onBlur={() => handleBlur("pan_number")}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="input-field"
              />
              <FieldError error={fieldErrors.pan_number} />
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
