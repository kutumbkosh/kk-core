"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/database";
import { validateFullName, validatePhone, validatePAN, validateDOB } from "@/lib/validations";
import FieldError from "@/components/FieldError";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Lock,
  Crown,
  Download,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setDob(data.dob || "");
      setPan(data.pan_number || "");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const validateField = (field: string, value: string) => {
    let err: string | null = null;
    switch (field) {
      case "fullName": err = validateFullName(value); break;
      case "phone": err = validatePhone(value); break;
      case "dob": err = validateDOB(value); break;
      case "pan": err = validatePAN(value); break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate all fields
    setTouched({ fullName: true, phone: true, dob: true, pan: true });
    const nameErr = validateField("fullName", fullName);
    const phoneErr = validateField("phone", phone);
    const dobErr = validateField("dob", dob);
    const panErr = validateField("pan", pan);

    if (nameErr || phoneErr || dobErr || panErr) {
      setFormError("Please fix the errors above before saving.");
      return;
    }

    setFormError("");
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    await supabase.from("profiles").update({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      dob: dob || null,
      pan_number: pan.trim().toUpperCase() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-vault-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and preferences</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Profile section */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-vault-accent" /> Profile
          </h2>

          <div className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{profile?.email}</span>
                <Lock className="w-3 h-3 text-gray-300 ml-auto" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email is linked to your login and cannot be changed here.</p>
            </div>

            {/* Full name */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); if (touched.fullName) validateField("fullName", e.target.value); }}
                  onBlur={() => handleBlur("fullName", fullName)}
                  placeholder="Your full name"
                  className={`input-field pl-10 ${touched.fullName && errors.fullName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <FieldError error={touched.fullName ? errors.fullName ?? null : null} />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); if (touched.phone) validateField("phone", e.target.value); }}
                  onBlur={() => handleBlur("phone", phone)}
                  placeholder="+91 98765 43210"
                  className={`input-field pl-10 ${touched.phone && errors.phone ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <FieldError error={touched.phone ? errors.phone ?? null : null} />
            </div>

            {/* DOB */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={e => { setDob(e.target.value); if (touched.dob) validateField("dob", e.target.value); }}
                  onBlur={() => handleBlur("dob", dob)}
                  className={`input-field pl-10 ${touched.dob && errors.dob ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <FieldError error={touched.dob ? errors.dob ?? null : null} />
            </div>

            {/* PAN */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">PAN Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={pan}
                  onChange={e => { const v = e.target.value.toUpperCase().slice(0, 10); setPan(v); if (touched.pan) validateField("pan", v); }}
                  onBlur={() => handleBlur("pan", pan)}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={`input-field pl-10 uppercase ${touched.pan && errors.pan ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <FieldError error={touched.pan ? errors.pan ?? null : null} />
              {!errors.pan && <p className="text-xs text-gray-400 mt-1">Stored securely. Used for nominee verification only.</p>}
            </div>

            {/* Save */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {formError}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-vault-accent" /> Vault
          </h2>
          <div className="space-y-1">
            {[
              { label: "Subscription & Billing", desc: "Manage your plan and payment history", icon: Crown, color: "text-blue-600", href: "/dashboard/subscription" },
              { label: "Reminders", desc: "Nominee gaps, expiries & review nudges", icon: Bell, color: "text-amber-600", href: "/dashboard/reminders" },
              { label: "Emergency Access", desc: "Manage trusted contacts & dossier", icon: AlertTriangle, color: "text-orange-500", href: "/dashboard/emergency" },
              { label: "Export Vault", desc: "Download PDF summary of all assets", icon: Download, color: "text-violet-600", href: "/dashboard/export" },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => router.push(link.href)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <link.icon className={`w-4 h-4 ${link.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Account actions */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Account</h2>
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sign Out</p>
                <p className="text-xs text-gray-500">Log out of your account on this device</p>
              </div>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-gray-500">Permanently remove your vault and all data</p>
              </div>
            </button>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-sm w-full p-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-2">Delete your account?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This will permanently delete all your assets, nominees, trusted contacts, and emergency instructions. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                  Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Your data is yours.</span> KutumbKosh stores your data securely with encryption at rest.
            We never share your financial information with third parties.
          </p>
        </div>
      </main>
    </div>
  );
}
