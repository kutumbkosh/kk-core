"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NomineeRelation } from "@/types/database";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import FieldError from "@/components/FieldError";
import { validateFullName, validatePhone, validatePAN, validateDOB, validateRelation } from "@/lib/validations";
import {
  ArrowLeft,
  Check,
  Loader2,
  User,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react";

const RELATION_OPTIONS: { value: NomineeRelation; label: string; desc: string }[] = [
  { value: "SPOUSE", label: "Spouse", desc: "Husband or wife" },
  { value: "CHILD", label: "Child", desc: "Son or daughter" },
  { value: "PARENT", label: "Parent", desc: "Father or mother" },
  { value: "SIBLING", label: "Sibling", desc: "Brother or sister" },
  { value: "OTHER", label: "Other", desc: "Any other relation" },
];

export default function AddNomineePage() {
  const router = useRouter();
  const { isAtNomineeLimit, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [fullName, setFullName] = useState("");
  const [relation, setRelation] = useState<NomineeRelation | "">("");
  const [contactNumber, setContactNumber] = useState("");
  const [dob, setDob] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [nomineeCount, setNomineeCount] = useState(0);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let err: string | null = null;
    switch (field) {
      case "fullName": err = validateFullName(value); break;
      case "relation": err = validateRelation(value); break;
      case "contactNumber": err = validatePhone(value); break;
      case "dob": err = validateDOB(value); break;
      case "panNumber": err = validatePAN(value); break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const checkLimits = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count } = await supabase.from("nominees").select("*", { count: "exact", head: true }).eq("user_id", user.id);
    setNomineeCount(count || 0);
    if (isAtNomineeLimit(count || 0)) setShowUpgrade(true);
  }, [isAtNomineeLimit]);

  useEffect(() => {
    if (!subLoading) checkLimits();
  }, [subLoading, checkLimits]);

  const handleSave = async () => {
    // Check plan limits before allowing save
    if (isAtNomineeLimit(nomineeCount)) {
      setShowUpgrade(true);
      setFormError("You've reached the free plan limit of 2 nominees. Upgrade to Pro to add more.");
      return;
    }

    // Validate all fields
    setTouched({ fullName: true, relation: true, contactNumber: true, dob: true, panNumber: true });
    const nameErr = validateField("fullName", fullName);
    const relErr = validateField("relation", relation);
    const phoneErr = validateField("contactNumber", contactNumber);
    const dobErr = validateField("dob", dob);
    const panErr = validateField("panNumber", panNumber);

    if (nameErr || relErr || phoneErr || dobErr || panErr) {
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
        contact_number: contactNumber.trim() || null,
        dob: dob || null,
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
            <button
              onClick={() => {
                setSuccess(false);
                setFullName("");
                setRelation("");
                setContactNumber("");
                setDob("");
                setPanNumber("");
              }}
              className="btn-primary w-full"
            >
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/nominees")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
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
            <label className="label">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (touched.fullName) validateField("fullName", e.target.value); }}
                onBlur={() => handleBlur("fullName", fullName)}
                placeholder="As per government ID"
                className={`input-field pl-11 ${touched.fullName && errors.fullName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.fullName ? errors.fullName ?? null : null} />
          </div>

          {/* Relation */}
          <div>
            <label className="label">Relationship <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RELATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRelation(relation === opt.value ? "" : opt.value)}
                  className={`px-4 py-3 rounded-xl text-left border-2 transition-all ${
                    relation === opt.value
                      ? "border-vault-dark bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-semibold ${relation === opt.value ? "text-vault-dark" : "text-gray-700"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </button>
              ))}
            </div>
            <FieldError error={touched.relation ? errors.relation ?? null : null} />
          </div>

          {/* Contact Number */}
          <div>
            <label className="label">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => { setContactNumber(e.target.value); if (touched.contactNumber) validateField("contactNumber", e.target.value); }}
                onBlur={() => handleBlur("contactNumber", contactNumber)}
                placeholder="+91 98765 43210"
                className={`input-field pl-11 ${touched.contactNumber && errors.contactNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.contactNumber ? errors.contactNumber ?? null : null} />
            {!errors.contactNumber && <p className="text-xs text-gray-400 mt-1">So your family can reach them if needed</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="label">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dob}
                onChange={(e) => { setDob(e.target.value); if (touched.dob) validateField("dob", e.target.value); }}
                onBlur={() => handleBlur("dob", dob)}
                className={`input-field pl-11 ${touched.dob && errors.dob ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.dob ? errors.dob ?? null : null} />
          </div>

          {/* PAN */}
          <div>
            <label className="label">PAN Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={panNumber}
                onChange={(e) => { const v = e.target.value.toUpperCase().slice(0, 10); setPanNumber(v); if (touched.panNumber) validateField("panNumber", v); }}
                onBlur={() => handleBlur("panNumber", panNumber)}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={`input-field pl-11 ${touched.panNumber && errors.panNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
            </div>
            <FieldError error={touched.panNumber ? errors.panNumber ?? null : null} />
            {!errors.panNumber && <p className="text-xs text-gray-400 mt-1">Helps with faster claims processing</p>}
          </div>

          {/* Save */}
          <div className="border-t border-gray-100 pt-6">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                {formError}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Nominee
            </button>
          </div>

          {/* Privacy note */}
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
