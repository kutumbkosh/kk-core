"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import FieldError from "@/components/FieldError";
import {
  validateFullName,
  validateMobileOptional,
  validateEmail,
  validateDOB,
  validatePAN,
  validateRelationshipDropdown,
  calculateAge,
  type ValidationError,
} from "@/lib/validations";
import {
  ArrowLeft,
  Check,
  Loader2,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Users,
  ShieldAlert,
} from "lucide-react";

import { RELATIONSHIP_OPTIONS } from "@/lib/relationship-options";

export default function AddNomineePage() {
  const router = useRouter();
  const { isAtNomineeLimit, loading: subLoading } = useSubscription();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [nomineeCount, setNomineeCount] = useState(0);

  // Form fields
  const [fullName, setFullName]             = useState("");
  const [relation, setRelation]             = useState("");
  const [mobileNumber, setMobileNumber]     = useState("");
  const [email, setEmail]                   = useState("");
  const [dob, setDob]                       = useState("");
  const [guardianName, setGuardianName]     = useState("");
  const [guardianMobile, setGuardianMobile] = useState("");
  const [panNumber, setPanNumber]           = useState("");

  const [otherRelation, setOtherRelation] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors]   = useState<Record<string, ValidationError>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Derived: is nominee a minor?
  const nomineeAge = calculateAge(dob);
  const isMinor = nomineeAge !== null && nomineeAge < 18;

  const validateField = (field: string, value: string): ValidationError => {
    switch (field) {
      case "fullName":      return validateFullName(value);
      case "relation":      return validateRelationshipDropdown(value);
      case "mobileNumber":  return validateMobileOptional(value);
      case "email":         return value.trim() ? validateEmail(value) : null;
      case "dob":           return validateDOB(value);
      case "panNumber":     return validatePAN(value);
      case "guardianName":
        if (isMinor && !value.trim()) return "Guardian name is required for a minor nominee";
        if (value.trim() && value.trim().length < 2) return "Name must be at least 2 characters";
        return null;
      case "guardianMobile":
        if (isMinor && !value.trim()) return "Guardian mobile is required for a minor nominee";
        return validateMobileOptional(value);
      case "otherRelation":
        if (!value.trim()) return "Please specify the relationship";
        return null;
      default: return null;
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const checkLimits = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count } = await supabase
      .from("nominees")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setNomineeCount(count || 0);
    if (isAtNomineeLimit(count || 0)) setShowUpgrade(true);
  }, [isAtNomineeLimit]);

  useEffect(() => {
    if (!subLoading) checkLimits();
  }, [subLoading, checkLimits]);

  const handleSave = async () => {
    if (isAtNomineeLimit(nomineeCount)) {
      setShowUpgrade(true);
      setFormError("You've reached the free plan limit. Upgrade to Pro to add more nominees.");
      return;
    }

    // Touch all fields
    const fieldsToTouch: Record<string, boolean> = {
      fullName: true, relation: true, mobileNumber: true,
      email: true, dob: true, panNumber: true,
    };
    if (relation === "other") fieldsToTouch.otherRelation = true;
    if (isMinor) {
      fieldsToTouch.guardianName   = true;
      fieldsToTouch.guardianMobile = true;
    }
    setTouched(fieldsToTouch);

    const newErrors: Record<string, ValidationError> = {
      fullName:      validateField("fullName", fullName),
      relation:      validateField("relation", relation),
      mobileNumber:  validateField("mobileNumber", mobileNumber),
      email:         validateField("email", email),
      dob:           validateField("dob", dob),
      panNumber:     validateField("panNumber", panNumber),
    };
    if (relation === "other") {
      newErrors.otherRelation = validateField("otherRelation", otherRelation);
    }
    if (isMinor) {
      newErrors.guardianName   = validateField("guardianName", guardianName);
      newErrors.guardianMobile = validateField("guardianMobile", guardianMobile);
    }
    setErrors(newErrors);

    // At-least-one contact method
    if (!mobileNumber.trim() && !email.trim()) {
      setFormError("Please provide at least one contact method (mobile or email) for this nominee.");
      return;
    }

    if (Object.values(newErrors).some((e) => e !== null)) {
      setFormError("Please fix the errors above before saving.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const { error } = await supabase.from("nominees").insert({
        user_id: user.id,
        full_name: fullName.trim(),
        relation,
        relation_other: relation === "other" ? otherRelation.trim() || null : null,
        contact_number: mobileNumber.trim() || null,
        email: email.trim() || null,
        dob: dob || null,
        guardian_name: isMinor ? guardianName.trim() || null : null,
        guardian_mobile: isMinor ? guardianMobile.trim() || null : null,
        pan_number: panNumber.trim().toUpperCase() || null,
      });

      if (error) throw error;
      setSavedName(fullName.trim());
      setSuccess(true);
    } catch (err) {
      console.error("Failed to save nominee:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFullName(""); setRelation(""); setOtherRelation(""); setMobileNumber(""); setEmail("");
    setDob(""); setGuardianName(""); setGuardianMobile(""); setPanNumber("");
    setErrors({}); setTouched({}); setFormError("");
    setSuccess(false);
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nominee Added</h2>
          <p className="text-gray-500 mb-8">
            {savedName} has been added as your nominee. You can now link them to your assets.
          </p>
          <div className="space-y-3">
            <button onClick={resetForm} className="btn-primary w-full">
              Add Another Nominee
            </button>
            <button onClick={() => router.push("/dashboard/nominees")} className="btn-secondary w-full">
              View All Nominees
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/nominees")}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Add Nominee</h1>
            <p className="text-sm text-gray-500">Someone your assets should go to</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {showUpgrade && (
          <div className="mb-6">
            <UpgradePrompt feature="nominee_limit" variant="banner" onClose={() => setShowUpgrade(false)} />
          </div>
        )}

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (touched.fullName) setErrors((p) => ({ ...p, fullName: validateField("fullName", e.target.value) })); setFormError(""); }}
                onBlur={() => handleBlur("fullName", fullName)}
                placeholder="As per government ID"
                className={`input-field pl-11 ${touched.fullName && errors.fullName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.fullName ? errors.fullName ?? null : null} />
          </div>

          {/* Relationship */}
          <div>
            <label className="label">
              Relationship <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const newVal = relation === opt.value ? "" : opt.value;
                    setRelation(newVal);
                    if (newVal !== "other") { setOtherRelation(""); setErrors((p) => ({ ...p, otherRelation: null })); }
                    setTouched((p) => ({ ...p, relation: true }));
                    setErrors((p) => ({ ...p, relation: null }));
                    setFormError("");
                  }}
                  className={`px-3 py-2.5 rounded-xl text-left border-2 transition-all ${
                    relation === opt.value
                      ? "border-vault-dark bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-semibold leading-tight ${relation === opt.value ? "text-vault-dark" : "text-gray-700"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
            <FieldError error={touched.relation ? errors.relation ?? null : null} />

            {/* "Other" specify input */}
            {relation === "other" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={otherRelation}
                  onChange={(e) => { setOtherRelation(e.target.value); if (touched.otherRelation) setErrors((p) => ({ ...p, otherRelation: validateField("otherRelation", e.target.value) })); setFormError(""); }}
                  onBlur={() => { setTouched((p) => ({ ...p, otherRelation: true })); setErrors((p) => ({ ...p, otherRelation: validateField("otherRelation", otherRelation) })); }}
                  placeholder="e.g. Cousin, Uncle, Friend"
                  className={`input-field ${touched.otherRelation && errors.otherRelation ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
                <FieldError error={touched.otherRelation ? errors.otherRelation ?? null : null} />
              </div>
            )}
          </div>

          {/* Contact — mobile + email (at least one required) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Contact Details{" "}
                <span className="text-xs font-normal text-gray-400">(at least one required)</span>
              </span>
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={(e) => { setMobileNumber(e.target.value); if (touched.mobileNumber) setErrors((p) => ({ ...p, mobileNumber: validateField("mobileNumber", e.target.value) })); setFormError(""); }}
                  onBlur={() => handleBlur("mobileNumber", mobileNumber)}
                  placeholder="98765 43210"
                  className={`input-field pl-11 ${touched.mobileNumber && errors.mobileNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <FieldError error={touched.mobileNumber ? errors.mobileNumber ?? null : null} />
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (touched.email) setErrors((p) => ({ ...p, email: validateField("email", e.target.value) })); setFormError(""); }}
                  onBlur={() => handleBlur("email", email)}
                  placeholder="name@example.com"
                  className={`input-field pl-11 ${touched.email && errors.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <FieldError error={touched.email ? errors.email ?? null : null} />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="label">
              Date of Birth{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dob}
                onChange={(e) => { setDob(e.target.value); if (touched.dob) setErrors((p) => ({ ...p, dob: validateField("dob", e.target.value) })); }}
                onBlur={() => handleBlur("dob", dob)}
                className={`input-field pl-11 ${touched.dob && errors.dob ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.dob ? errors.dob ?? null : null} />
          </div>

          {/* Minor guardian fields — shown dynamically */}
          {isMinor && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  This nominee is a minor. Guardian details are required.
                </p>
              </div>

              <div>
                <label className="label">
                  Guardian Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => { setGuardianName(e.target.value); if (touched.guardianName) setErrors((p) => ({ ...p, guardianName: validateField("guardianName", e.target.value) })); }}
                  onBlur={() => handleBlur("guardianName", guardianName)}
                  placeholder="Legal guardian's full name"
                  className={`input-field ${touched.guardianName && errors.guardianName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
                <FieldError error={touched.guardianName ? errors.guardianName ?? null : null} />
              </div>

              <div>
                <label className="label">
                  Guardian Mobile <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={guardianMobile}
                    onChange={(e) => { setGuardianMobile(e.target.value); if (touched.guardianMobile) setErrors((p) => ({ ...p, guardianMobile: validateField("guardianMobile", e.target.value) })); }}
                    onBlur={() => handleBlur("guardianMobile", guardianMobile)}
                    placeholder="98765 43210"
                    className={`input-field pl-11 ${touched.guardianMobile && errors.guardianMobile ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
                <FieldError error={touched.guardianMobile ? errors.guardianMobile ?? null : null} />
              </div>
            </div>
          )}

          {/* PAN */}
          <div>
            <label className="label">
              PAN Number{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={panNumber}
                onChange={(e) => { const v = e.target.value.toUpperCase().slice(0, 10); setPanNumber(v); if (touched.panNumber) setErrors((p) => ({ ...p, panNumber: validateField("panNumber", v) })); }}
                onBlur={() => handleBlur("panNumber", panNumber)}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={`input-field pl-11 ${touched.panNumber && errors.panNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.panNumber ? errors.panNumber ?? null : null} />
            {!errors.panNumber && (
              <p className="text-xs text-gray-400 mt-1">Helps with faster claims processing</p>
            )}
          </div>

          {/* Save */}
          <div className="border-t border-gray-100 pt-6">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                {formError}
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Save Nominee</>
              )}
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-gray-600">
              Nominee information is encrypted and only visible to you. It helps your family identify and claim your assets.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
