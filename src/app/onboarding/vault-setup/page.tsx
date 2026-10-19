"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Check,
  Loader2,
  Shield,
} from "lucide-react";

// ─── i18n-ready copy constants ───────────────────────────────────────────────
const WIZARD_COPY = {
  welcome_heading: "Let's set up your vault",
  welcome_subtext: "Help your family find what matters most if something happens to you.",
  welcome_time_hint: "Takes about 3 minutes",
  welcome_cta: "Let's start",
  welcome_skip: "Skip for now",

  asset_select_heading: "What does your family have?",
  asset_select_subtext: "Select everything that applies — you can add more later.",

  asset_detail_heading_prefix: "Let's add your",
  asset_detail_institution_skip: "Add this later →",
  asset_detail_cta: "Continue",
  asset_no_nominee_checkbox: "I haven't registered a nominee yet",
  asset_no_nominee_note: "You can add a nominee later in the asset details",
  nominee_section_heading_prefix: "Who is the nominee for this",

  trusted_contact_heading: "One last thing",
  trusted_contact_subtext: "Who should help your family if they need to access this vault?",
  trusted_contact_info: "A trusted contact can see a summary of your vault in an emergency. They cannot claim your assets — only help your family know what exists.",
  trusted_contact_cta: "Add trusted contact",
  trusted_contact_skip: "Skip — I'll add this later",

  complete_heading: "Your vault is ready",
  complete_subtext: "If something happened today, your family would know exactly what you have and who to contact.",
  complete_cta: "Go to my vault",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type AssetType =
  | "bank"
  | "insurance"
  | "fd"
  | "property"
  | "mf_stocks"
  | "ppf_nps"
  | "vehicle";

type AssetDraft = {
  type: AssetType;
  institution_name: string;
  nominee_name: string;
  nominee_relationship: string;
  no_nominee: boolean;
  skipped: boolean;
};

type TrustedContactDraft = {
  name: string;
  phone: string;
  email: string;
  relationship: string;
};

type WizardStep =
  | "welcome"
  | "asset-select"
  | "asset-detail"
  | "trusted-contact"
  | "complete";

type WizardState = {
  step: WizardStep;
  assetDetailIndex: number;
  selectedTypes: AssetType[];
  assetDrafts: AssetDraft[];
  trustedContact: TrustedContactDraft | null;
  trustedContactSkipped: boolean;
};

// ─── Static data ─────────────────────────────────────────────────────────────
const ASSET_TILES: { type: AssetType; emoji: string; label: string }[] = [
  { type: "bank", emoji: "🏦", label: "Bank account" },
  { type: "insurance", emoji: "🛡️", label: "Life insurance" },
  { type: "fd", emoji: "💰", label: "Fixed Deposit" },
  { type: "property", emoji: "🏠", label: "Property" },
  { type: "mf_stocks", emoji: "📈", label: "Mutual Funds / Stocks" },
  { type: "ppf_nps", emoji: "🏛️", label: "PPF / NPS" },
  { type: "vehicle", emoji: "🚗", label: "Vehicle" },
];

const FRIENDLY_LABELS: Record<AssetType, string> = {
  bank: "bank account",
  insurance: "life insurance policy",
  fd: "fixed deposit",
  property: "property",
  mf_stocks: "mutual funds & stocks",
  ppf_nps: "PPF / NPS account",
  vehicle: "vehicle",
};

// DB asset_type values mapped from wizard types
const DB_ASSET_TYPE: Record<AssetType, string> = {
  bank: "BANK_ACCOUNT",
  insurance: "INSURANCE",
  fd: "FIXED_DEPOSIT",
  property: "REAL_ESTATE",
  mf_stocks: "MUTUAL_FUND",
  ppf_nps: "PPF_NPS",
  vehicle: "VEHICLE",
};

// Institution dropdown options per asset type
const INSTITUTION_OPTIONS: Record<AssetType, string[]> = {
  bank: [
    "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB",
    "Bank of Baroda", "Kotak Mahindra Bank", "Canara Bank",
    "Union Bank of India", "IndusInd Bank", "Yes Bank",
    "IDFC First Bank", "Other (enter below)",
  ],
  insurance: [
    "LIC", "SBI Life", "HDFC Life", "ICICI Prudential Life",
    "Max Life", "Bajaj Allianz Life", "Tata AIA Life",
    "Kotak Life", "Other (enter below)",
  ],
  fd: [
    "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB",
    "Bank of Baroda", "Kotak Mahindra Bank", "Canara Bank",
    "Union Bank of India", "IndusInd Bank", "Yes Bank",
    "IDFC First Bank", "Post Office", "Other (enter below)",
  ],
  property: [], // text input
  mf_stocks: [
    "Zerodha", "Groww", "Upstox", "Angel One", "HDFC Mutual Fund",
    "SBI Mutual Fund", "ICICI Prudential MF", "Axis Mutual Fund",
    "Mirae Asset", "Other (enter below)",
  ],
  ppf_nps: [
    "Post Office", "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank",
    "PNB", "Other (enter below)",
  ],
  vehicle: [], // text input
};

const INSTITUTION_LABEL: Record<AssetType, string> = {
  bank: "Which bank?",
  insurance: "Which insurance company?",
  fd: "Which bank or institution?",
  property: "Describe this property briefly",
  mf_stocks: "Which platform or fund house?",
  ppf_nps: "Where is your PPF / NPS held?",
  vehicle: "Describe this vehicle briefly",
};

const INSTITUTION_PLACEHOLDER: Record<AssetType, string> = {
  bank: "Select bank",
  insurance: "Select insurance company",
  fd: "Select bank or institution",
  property: "e.g. 2BHK flat in Pune, Agricultural land in Nashik",
  mf_stocks: "Select platform or fund house",
  ppf_nps: "Select institution",
  vehicle: "e.g. Maruti Swift 2020, Hero Splendor",
};

const NOMINEE_RELATIONSHIPS = [
  "Spouse", "Child", "Parent", "Sibling", "Grandchild", "Friend", "Other",
];

const INITIAL_STATE: WizardState = {
  step: "welcome",
  assetDetailIndex: 0,
  selectedTypes: [],
  assetDrafts: [],
  trustedContact: null,
  trustedContactSkipped: false,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function VaultSetupWizard() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [guardLoading, setGuardLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Per-step local input state (reset on step transition)
  const [institutionValue, setInstitutionValue] = useState("");
  const [institutionOther, setInstitutionOther] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelationship, setNomineeRelationship] = useState("");
  const [noNominee, setNoNominee] = useState(false);
  const [tcName, setTcName] = useState("");
  const [tcPhone, setTcPhone] = useState("");
  const [tcEmail, setTcEmail] = useState("");
  const [tcRelationship, setTcRelationship] = useState("");
  const [tcError, setTcError] = useState("");
  const [somethingElseSelected, setSomethingElseSelected] = useState(false);

  // Guard: redirect if wizard already done or user has assets
  const runGuard = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [profileRes, assetCountRes] = await Promise.all([
      supabase.from("profiles").select("onboarding_wizard_status").eq("id", user.id).single(),
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    const status = profileRes.data?.onboarding_wizard_status;
    const count = assetCountRes.count ?? 0;

    if (status === "completed" || status === "skipped" || count > 0) {
      router.push("/dashboard");
      return;
    }
    setGuardLoading(false);
  }, [router]);

  useEffect(() => { runGuard(); }, [runGuard]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const resetAssetInputs = () => {
    setInstitutionValue("");
    setInstitutionOther("");
    setShowOther(false);
    setNomineeName("");
    setNomineeRelationship("");
    setNoNominee(false);
  };

  const totalSteps = state.selectedTypes.length + 2; // asset-select + each asset + trusted-contact
  const currentStep = state.step === "asset-select"
    ? 1
    : state.step === "asset-detail"
      ? 2 + state.assetDetailIndex
      : state.step === "trusted-contact"
        ? totalSteps
        : 0;

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSkip = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ onboarding_wizard_status: "skipped" }).eq("id", user.id);
    }
    router.push("/dashboard");
  };

  const handleAssetDetailContinue = (skipped: boolean) => {
    const currentType = state.selectedTypes[state.assetDetailIndex];
    const instName = showOther ? institutionOther.trim() : institutionValue;

    const draft: AssetDraft = {
      type: currentType,
      institution_name: instName,
      nominee_name: nomineeName.trim(),
      nominee_relationship: nomineeRelationship,
      no_nominee: noNominee,
      skipped,
    };

    const updatedDrafts = [...state.assetDrafts, draft];
    const nextIndex = state.assetDetailIndex + 1;
    const hasMoreAssets = nextIndex < state.selectedTypes.length;

    resetAssetInputs();

    if (hasMoreAssets) {
      setState((s) => ({
        ...s,
        assetDrafts: updatedDrafts,
        assetDetailIndex: nextIndex,
      }));
    } else {
      // All asset steps done — bulk save, then go to trusted-contact
      bulkSaveAssets(updatedDrafts);
    }
  };

  const bulkSaveAssets = async (drafts: AssetDraft[]) => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const toSave = drafts.filter((d) => !d.skipped && d.institution_name);

    await Promise.all(
      toSave.map(async (draft) => {
        try {
          const { data: assetData } = await supabase.from("assets").insert({
            user_id: user.id,
            asset_type: DB_ASSET_TYPE[draft.type],
            institution_name: draft.institution_name,
            is_draft: false,
          }).select("id").single();

          if (assetData?.id && draft.nominee_name && !draft.no_nominee) {
            const { data: nomineeData } = await supabase.from("nominees").insert({
              user_id: user.id,
              full_name: draft.nominee_name,
              relation: draft.nominee_relationship.toLowerCase(),
            }).select("id").single();

            if (nomineeData?.id) {
              await supabase.from("asset_nominee_mappings").insert({
                asset_id: assetData.id,
                nominee_id: nomineeData.id,
              });
            }
          }
        } catch (err) {
          console.error("Asset insert failed (non-blocking):", err);
        }
      })
    );

    setSaving(false);
    setState((s) => ({
      ...s,
      assetDrafts: drafts,
      step: "trusted-contact",
    }));
  };

  const handleTrustedContactSubmit = async () => {
    setTcError("");
    if (!tcName.trim()) { setTcError("Name is required."); return; }
    if (!/^\d{10}$/.test(tcPhone.trim())) { setTcError("Enter a valid 10-digit mobile number."); return; }
    if (tcEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tcEmail.trim())) { setTcError("Enter a valid email address."); return; }
    if (!tcRelationship) { setTcError("Relationship is required."); return; }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    try {
      await supabase.from("trusted_contacts").insert({
        user_id: user.id,
        contact_name: tcName.trim(),
        contact_phone: tcPhone.trim(),
        contact_email: tcEmail.trim() || null,
        relation: tcRelationship.toLowerCase(),
        access_status: "PENDING",
      });
    } catch (err) {
      console.error("Trusted contact insert failed (non-blocking):", err);
    }

    setState((s) => ({
      ...s,
      trustedContact: { name: tcName.trim(), phone: tcPhone.trim(), email: tcEmail.trim(), relationship: tcRelationship },
      step: "complete",
    }));
    setSaving(false);
  };

  const handleComplete = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ onboarding_wizard_status: "completed" }).eq("id", user.id);
    }
    router.push("/dashboard");
  };

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (guardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Progress bar ─────────────────────────────────────────────────────────
  const ProgressBar = ({ current, total }: { current: number; total: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
      <div
        className="bg-vault-accent h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
      />
    </div>
  );

  // ─── SCREEN 0 — WELCOME ───────────────────────────────────────────────────
  if (state.step === "welcome") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="card text-center p-8">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Shield className="w-7 h-7 text-vault-accent" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{WIZARD_COPY.welcome_heading}</h1>
            <p className="text-sm text-gray-500 mb-2">{WIZARD_COPY.welcome_subtext}</p>
            <p className="text-xs text-gray-400 mb-8">{WIZARD_COPY.welcome_time_hint}</p>
            <button
              onClick={() => setState((s) => ({ ...s, step: "asset-select" }))}
              className="btn-primary w-full mb-3"
            >
              {WIZARD_COPY.welcome_cta} <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {WIZARD_COPY.welcome_skip}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN 1 — ASSET TYPE SELECTION ─────────────────────────────────────
  if (state.step === "asset-select") {
    const toggleType = (type: AssetType) => {
      setState((s) => {
        const already = s.selectedTypes.includes(type);
        return {
          ...s,
          selectedTypes: already
            ? s.selectedTypes.filter((t) => t !== type)
            : [...s.selectedTypes, type],
        };
      });
    };

    const handleContinue = () => {
      if (state.selectedTypes.length === 0 && !somethingElseSelected) return;

      // "Something else" selected alone → go to full add asset form
      if (somethingElseSelected && state.selectedTypes.length === 0) {
        router.push("/dashboard/assets/add");
        return;
      }

      // Otherwise start asset detail screens for selected types
      setState((s) => ({
        ...s,
        step: "asset-detail",
        assetDetailIndex: 0,
        assetDrafts: [],
      }));
    };

    const hasSelection = state.selectedTypes.length > 0 || somethingElseSelected;

    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-lg mx-auto">
          <ProgressBar current={1} total={totalSteps || 3} />
          <h1 className="text-xl font-bold text-gray-900 mb-1">{WIZARD_COPY.asset_select_heading}</h1>
          <p className="text-sm text-gray-500 mb-6">{WIZARD_COPY.asset_select_subtext}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {ASSET_TILES.map(({ type, emoji, label }) => {
              const selected = state.selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                    selected
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setSomethingElseSelected((v) => !v)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                somethingElseSelected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">➕</span>
              <span className="text-xs font-medium leading-tight">Something else</span>
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={!hasSelection}
            className="btn-primary w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button onClick={handleSkip} className="w-full text-sm text-gray-500 hover:text-gray-700 underline">
            {WIZARD_COPY.welcome_skip}
          </button>
        </div>
      </div>
    );
  }

  // ─── SCREENS 2–N — PER-ASSET DETAIL ──────────────────────────────────────
  if (state.step === "asset-detail") {
    const currentType = state.selectedTypes[state.assetDetailIndex];
    const friendlyLabel = FRIENDLY_LABELS[currentType];
    const options = INSTITUTION_OPTIONS[currentType];
    const isTextInput = options.length === 0;
    const isOtherSelected = institutionValue === "Other (enter below)";
    const effectiveInstitution = isTextInput
      ? institutionValue
      : isOtherSelected
        ? institutionOther
        : institutionValue;
    const canContinue = !!effectiveInstitution.trim();

    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-lg mx-auto">
          <ProgressBar current={currentStep} total={totalSteps} />

          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-400">Step {currentStep} of {totalSteps}</p>
            {state.selectedTypes.length > 1 && (
              <div className="flex gap-1">
                {state.selectedTypes.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < state.assetDetailIndex ? "bg-emerald-400" : i === state.assetDetailIndex ? "bg-vault-accent" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {WIZARD_COPY.asset_detail_heading_prefix} {friendlyLabel}
          </h1>

          <div className="space-y-5">
            {/* Institution field */}
            <div>
              <label className="label">{INSTITUTION_LABEL[currentType]}</label>
              {isTextInput ? (
                <input
                  type="text"
                  value={institutionValue}
                  onChange={(e) => setInstitutionValue(e.target.value)}
                  placeholder={INSTITUTION_PLACEHOLDER[currentType]}
                  className="input-field"
                />
              ) : (
                <>
                  <select
                    value={institutionValue}
                    onChange={(e) => {
                      setInstitutionValue(e.target.value);
                      setShowOther(e.target.value === "Other (enter below)");
                    }}
                    className="input-field"
                  >
                    <option value="">{INSTITUTION_PLACEHOLDER[currentType]}</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {showOther && (
                    <input
                      type="text"
                      value={institutionOther}
                      onChange={(e) => setInstitutionOther(e.target.value)}
                      placeholder="Enter institution name"
                      className="input-field mt-2"
                    />
                  )}
                </>
              )}
            </div>

            {/* Nominee section */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {WIZARD_COPY.nominee_section_heading_prefix} {friendlyLabel}?
              </p>

              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noNominee}
                  onChange={(e) => setNoNominee(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-vault-accent"
                />
                <span className="text-sm text-gray-600">{WIZARD_COPY.asset_no_nominee_checkbox}</span>
              </label>

              {noNominee ? (
                <p className="text-xs text-gray-400">{WIZARD_COPY.asset_no_nominee_note}</p>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="input-field"
                  />
                  <select
                    value={nomineeRelationship}
                    onChange={(e) => setNomineeRelationship(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select relationship</option>
                    {NOMINEE_RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => handleAssetDetailContinue(false)}
              disabled={!canContinue || saving}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {WIZARD_COPY.asset_detail_cta} <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => handleAssetDetailContinue(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {WIZARD_COPY.asset_detail_institution_skip}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN N+1 — TRUSTED CONTACT ────────────────────────────────────────
  if (state.step === "trusted-contact") {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-lg mx-auto">
          <ProgressBar current={totalSteps} total={totalSteps} />

          <h1 className="text-xl font-bold text-gray-900 mb-1">{WIZARD_COPY.trusted_contact_heading}</h1>
          <p className="text-sm text-gray-500 mb-4">{WIZARD_COPY.trusted_contact_subtext}</p>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
            <p className="text-xs text-gray-600">{WIZARD_COPY.trusted_contact_info}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={tcName}
                onChange={(e) => setTcName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Mobile Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={tcPhone}
                onChange={(e) => setTcPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={tcEmail}
                onChange={(e) => setTcEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Relationship <span className="text-red-500">*</span></label>
              <select
                value={tcRelationship}
                onChange={(e) => setTcRelationship(e.target.value)}
                className="input-field"
              >
                <option value="">Select relationship</option>
                {NOMINEE_RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {tcError && (
              <p className="text-sm text-red-600">{tcError}</p>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleTrustedContactSubmit}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {WIZARD_COPY.trusted_contact_cta}
            </button>
            <button
              onClick={() => setState((s) => ({ ...s, trustedContactSkipped: true, step: "complete" }))}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {WIZARD_COPY.trusted_contact_skip}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN N+2 — COMPLETE ───────────────────────────────────────────────
  const savedDrafts = state.assetDrafts.filter((d) => !d.skipped);
  const linkedNominees = savedDrafts.filter((d) => d.nominee_name && !d.no_nominee);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{WIZARD_COPY.complete_heading}</h1>

          {/* Summary card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                {savedDrafts.length} asset{savedDrafts.length !== 1 ? "s" : ""} added
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                {linkedNominees.length} nominee{linkedNominees.length !== 1 ? "s" : ""} linked
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                {state.trustedContactSkipped
                  ? "None added — add from your dashboard"
                  : `Trusted contact: ${state.trustedContact?.name ?? ""}`}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-8">{WIZARD_COPY.complete_subtext}</p>

          <button onClick={handleComplete} className="btn-primary w-full">
            {WIZARD_COPY.complete_cta} <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

