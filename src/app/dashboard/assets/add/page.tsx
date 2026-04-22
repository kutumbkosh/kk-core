"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AssetType, ValueBand } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import {
  ASSET_TYPE_FIELDS,
  INSTITUTION_SUGGESTIONS,
  VALUE_BAND_OPTIONS,
} from "@/lib/asset-fields";
import { validateInstitution, validateAccountId, validateNotes, validateMetadataText, validateMetadataSelect, validateMetadataTextarea, validateMetadataDate } from "@/lib/validations";
import FieldError from "@/components/FieldError";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Landmark,
  PiggyBank,
  TrendingUp,
  Shield,
  BarChart3,
  Building2,
  Wallet,
  HandCoins,
  CreditCard,
  Lock,
  Home,
  Save,
  Check,
  Loader2,
  HelpCircle,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Landmark, PiggyBank, TrendingUp, Shield, BarChart3,
  Building2, Wallet, HandCoins, CreditCard, Lock, Home,
};

type Step = "select-type" | "fill-details" | "success";

export default function AddAssetPage() {
  const router = useRouter();
  const { isAtAssetLimit, loading: subLoading } = useSubscription();
  const [assetCount, setAssetCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [step, setStep] = useState<Step>("select-type");

  // Check asset count on mount
  const checkLimits = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count } = await supabase.from("assets").select("*", { count: "exact", head: true }).eq("user_id", user.id);
    setAssetCount(count || 0);
    if (isAtAssetLimit(count || 0)) {
      setShowUpgrade(true);
    }
  }, [isAtAssetLimit]);

  useEffect(() => {
    if (!subLoading) checkLimits();
  }, [subLoading, checkLimits]);
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [valueBand, setValueBand] = useState<ValueBand | "">("");
  const [notes, setNotes] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [savedAssetName, setSavedAssetName] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Filter asset types by search
  const filteredTypes = useMemo(() => {
    const entries = Object.entries(ASSET_TYPE_CONFIG) as [AssetType, typeof ASSET_TYPE_CONFIG[AssetType]][];
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(([, config]) => config.label.toLowerCase().includes(q));
  }, [searchQuery]);

  // Institution suggestions filtered
  const filteredInstitutions = useMemo(() => {
    if (!selectedType || !institutionSearch) return [];
    const suggestions = INSTITUTION_SUGGESTIONS[selectedType] || [];
    return suggestions.filter((s) =>
      s.toLowerCase().includes(institutionSearch.toLowerCase())
    );
  }, [selectedType, institutionSearch]);

  const handleSelectType = (type: AssetType) => {
    setSelectedType(type);
    setStep("fill-details");
    setMetadata({});
    setInstitutionName("");
    setAccountIdentifier("");
    setValueBand("");
    setNotes("");
  };

  const validateField = (field: string, value: string) => {
    let err: string | null = null;
    switch (field) {
      case "institutionName": err = validateInstitution(value); break;
      case "accountIdentifier": err = validateAccountId(value); break;
      case "notes": err = validateNotes(value); break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleMetadataChange = (fieldName: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [fieldName]: value }));
    if (touched[`meta_${fieldName}`]) {
      validateMetaField(fieldName, value);
    }
  };

  const handleMetaBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [`meta_${fieldName}`]: true }));
    validateMetaField(fieldName, value);
  };

  const validateMetaField = (fieldName: string, value: string) => {
    const field = typeFields.find((f) => f.name === fieldName);
    if (!field) return null;
    let err: string | null = null;
    if (field.type === "select") {
      err = validateMetadataSelect(value, field.label, !!field.required);
    } else if (field.type === "textarea") {
      err = validateMetadataTextarea(value, field.label, 1000);
    } else if (field.type === "date") {
      err = validateMetadataDate(value, field.label, true);
    } else {
      err = validateMetadataText(value, field.label, !!field.required);
    }
    setErrors((prev) => ({ ...prev, [`meta_${fieldName}`]: err }));
    return err;
  };

  const handleSave = async (draft: boolean) => {
    if (!selectedType) return;

    // Check plan limits before allowing save
    if (isAtAssetLimit(assetCount)) {
      setShowUpgrade(true);
      setFormError("You've reached the free plan limit of 3 assets. Upgrade to Pro to add more.");
      return;
    }

    // Validate all fields
    const touchAll: Record<string, boolean> = { institutionName: true, accountIdentifier: true, notes: true };
    typeFields.forEach((f) => { touchAll[`meta_${f.name}`] = true; });
    setTouched(touchAll);

    const instErr = validateField("institutionName", institutionName);
    const acctErr = validateField("accountIdentifier", accountIdentifier);
    const notesErr = validateField("notes", notes);

    // Validate metadata fields
    let hasMetaErr = false;
    typeFields.forEach((f) => {
      const err = validateMetaField(f.name, metadata[f.name] || "");
      if (err) hasMetaErr = true;
    });

    if (instErr || acctErr || notesErr || hasMetaErr) {
      setFormError("Please fix the errors above before saving.");
      return;
    }

    setFormError("");
    setSaving(true);
    setSaveAsDraft(draft);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      // Trim all metadata values
      const trimmedMeta: Record<string, string> = {};
      Object.entries(metadata).forEach(([k, v]) => { if (v.trim()) trimmedMeta[k] = v.trim(); });

      const { error } = await supabase.from("assets").insert({
        user_id: user.id,
        asset_type: selectedType,
        institution_name: institutionName.trim(),
        account_identifier: accountIdentifier.trim() || null,
        metadata: trimmedMeta,
        approx_value_band: valueBand || null,
        notes: notes.trim() || null,
        is_draft: draft,
      });

      if (error) throw error;

      setSavedAssetName(institutionName.trim());
      setStep("success");
    } catch (err) {
      console.error("Failed to save asset:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Step 1: Select Asset Type ───
  if (step === "select-type") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Add an Asset</h1>
              <p className="text-sm text-gray-500">What would you like to add to your vault?</p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-6">
          {/* Upgrade prompt if at limit */}
          {showUpgrade && (
            <div className="mb-6">
              <UpgradePrompt feature="asset_limit" variant="banner" onClose={() => setShowUpgrade(false)} />
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search asset types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          {/* Asset Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTypes.map(([type, config]) => {
              const IconComp = iconMap[config.icon] || Shield;
              return (
                <button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  className="card flex items-center gap-4 text-left hover:border-blue-300 hover:shadow-md transition-all group p-5"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <IconComp className="w-6 h-6" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{config.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getTypeDescription(type)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              );
            })}
          </div>

          {filteredTypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No asset types match your search.</p>
              <button onClick={() => setSearchQuery("")} className="text-vault-accent text-sm font-medium mt-2 hover:underline">
                Clear search
              </button>
            </div>
          )}

          {/* Encouragement */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-700 font-medium">
              Every asset you add is one more thing your family won&apos;t have to search for.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              We only store identifiers (last 4 digits) — never full account numbers. Your data is encrypted and only you can see it.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ─── Step 3: Success ───
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {saveAsDraft ? "Draft Saved!" : "Asset Added!"}
          </h2>
          <p className="text-gray-500 mb-8">
            {saveAsDraft
              ? `"${savedAssetName}" has been saved as a draft. You can complete it later.`
              : `"${savedAssetName}" has been added to your vault. Your family is now better protected.`
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setStep("select-type");
                setSelectedType(null);
                setSearchQuery("");
              }}
              className="btn-primary w-full"
            >
              Add Another Asset
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-secondary w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Fill Details ───
  const typeConfig = selectedType ? ASSET_TYPE_CONFIG[selectedType] : null;
  const TypeIcon = typeConfig ? (iconMap[typeConfig.icon] || Shield) : Shield;
  const typeFields = selectedType ? ASSET_TYPE_FIELDS[selectedType] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => { setStep("select-type"); setSelectedType(null); }}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${typeConfig?.color}15` }}
            >
              <TypeIcon className="w-5 h-5" style={{ color: typeConfig?.color }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Add {typeConfig?.label}
              </h1>
              <p className="text-xs text-gray-500">Fill in what you know — you can update later</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Institution Name — with autosuggest */}
          <div>
            <label className="label">
              {getInstitutionLabel(selectedType!)} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={institutionName}
                onChange={(e) => {
                  setInstitutionName(e.target.value);
                  setInstitutionSearch(e.target.value);
                  setShowInstitutionDropdown(true);
                  if (touched.institutionName) validateField("institutionName", e.target.value);
                }}
                onFocus={() => {
                  if (institutionName) setShowInstitutionDropdown(true);
                }}
                onBlur={() => { setTimeout(() => setShowInstitutionDropdown(false), 200); handleBlur("institutionName", institutionName); }}
                placeholder={getInstitutionPlaceholder(selectedType!)}
                className={`input-field ${touched.institutionName && errors.institutionName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
              />
              {showInstitutionDropdown && filteredInstitutions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredInstitutions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={() => {
                        setInstitutionName(name);
                        setShowInstitutionDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <FieldError error={touched.institutionName ? errors.institutionName ?? null : null} />
          </div>

          {/* Account Identifier */}
          <div>
            <label className="label">
              {getIdentifierLabel(selectedType!)}
            </label>
            <input
              type="text"
              value={accountIdentifier}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setAccountIdentifier(v); if (touched.accountIdentifier) validateField("accountIdentifier", v); }}
              onBlur={() => handleBlur("accountIdentifier", accountIdentifier)}
              placeholder="Last 4 digits only"
              maxLength={4}
              className={`input-field ${touched.accountIdentifier && errors.accountIdentifier ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
            />
            <FieldError error={touched.accountIdentifier ? errors.accountIdentifier ?? null : null} />
            {!errors.accountIdentifier && <p className="text-xs text-gray-400 mt-1">
              We only store the last 4 digits for identification — never the full number.
            </p>}
          </div>

          {/* Type-specific fields */}
          {typeFields.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                Details
              </h3>
              <div className="space-y-4">
                {typeFields.map((field) => {
                  const metaKey = `meta_${field.name}`;
                  const metaErr = touched[metaKey] ? errors[metaKey] ?? null : null;
                  const errClass = metaErr ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
                  return (
                  <div key={field.name}>
                    <label className="label">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={metadata[field.name] || ""}
                        onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                        onBlur={() => handleMetaBlur(field.name, metadata[field.name] || "")}
                        className={`input-field ${errClass}`}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={metadata[field.name] || ""}
                        onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                        onBlur={() => handleMetaBlur(field.name, metadata[field.name] || "")}
                        placeholder={field.placeholder}
                        rows={3}
                        maxLength={1000}
                        className={`input-field resize-none ${errClass}`}
                      />
                    ) : (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        value={metadata[field.name] || ""}
                        onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                        onBlur={() => handleMetaBlur(field.name, metadata[field.name] || "")}
                        placeholder={field.placeholder}
                        maxLength={field.type === "date" ? undefined : 500}
                        className={`input-field ${errClass}`}
                      />
                    )}
                    <FieldError error={metaErr} />
                    {field.helpText && !metaErr && (
                      <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                        <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {field.helpText}
                      </p>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Value Band */}
          <div className="border-t border-gray-100 pt-6">
            <label className="label">Approximate Value</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VALUE_BAND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValueBand(valueBand === opt.value ? "" : opt.value as ValueBand)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    valueBand === opt.value
                      ? "border-vault-dark bg-blue-50 text-vault-dark"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              We use ranges instead of exact amounts — just a rough idea helps your family understand the scale.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); if (touched.notes) validateField("notes", e.target.value); }}
              onBlur={() => handleBlur("notes", notes)}
              placeholder="Any extra details your family should know about this asset..."
              rows={3}
              className={`input-field resize-none ${touched.notes && errors.notes ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
            />
            <FieldError error={touched.notes ? errors.notes ?? null : null} />
            {!errors.notes && <p className="text-xs text-gray-400 mt-1">{notes.length}/1000 characters</p>}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-100 pt-6">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                {formError}
              </div>
            )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving && !saveAsDraft ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Asset
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="btn-secondary flex-1"
            >
              {saving && saveAsDraft ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </button>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper functions for context-sensitive labels
function getTypeDescription(type: AssetType): string {
  const descriptions: Record<AssetType, string> = {
    BANK_ACCOUNT: "Savings, current, salary accounts",
    FIXED_DEPOSIT: "FDs, RDs, tax-saver deposits",
    MUTUAL_FUND: "SIPs, lump sum investments",
    INSURANCE: "Life, health, motor policies",
    DEMAT: "Stocks, ETFs, bonds",
    EPF: "Employee Provident Fund",
    PPF_NPS: "Public Provident Fund, pension",
    LOAN: "Home, personal, car loans",
    CREDIT_CARD: "Credit cards across banks",
    LOCKER: "Bank safe deposit lockers",
    REAL_ESTATE: "Property, land, commercial",
  };
  return descriptions[type];
}

function getInstitutionLabel(type: AssetType): string {
  const labels: Partial<Record<AssetType, string>> = {
    BANK_ACCOUNT: "Bank Name",
    FIXED_DEPOSIT: "Bank / Institution",
    MUTUAL_FUND: "AMC / Platform",
    INSURANCE: "Insurance Company",
    DEMAT: "Broker / Platform",
    EPF: "EPFO (via employer)",
    PPF_NPS: "Bank / Post Office / NPS Platform",
    LOAN: "Lender",
    CREDIT_CARD: "Issuing Bank",
    LOCKER: "Bank Name",
    REAL_ESTATE: "Description / Name",
  };
  return labels[type] || "Institution Name";
}

function getInstitutionPlaceholder(type: AssetType): string {
  const placeholders: Partial<Record<AssetType, string>> = {
    BANK_ACCOUNT: "e.g. HDFC Bank",
    MUTUAL_FUND: "e.g. Zerodha Coin, Groww",
    INSURANCE: "e.g. LIC, HDFC Life",
    DEMAT: "e.g. Zerodha, Groww",
    REAL_ESTATE: "e.g. 2BHK Flat in Whitefield",
  };
  return placeholders[type] || "e.g. Institution name";
}

function getIdentifierLabel(type: AssetType): string {
  const labels: Partial<Record<AssetType, string>> = {
    BANK_ACCOUNT: "Account Number (last 4 digits)",
    FIXED_DEPOSIT: "FD Number (last 4 digits)",
    MUTUAL_FUND: "Folio Number (last 4 digits)",
    INSURANCE: "Policy Number (last 4 digits)",
    DEMAT: "Client ID (last 4 digits)",
    CREDIT_CARD: "Card Number (last 4 digits)",
    LOAN: "Loan Account (last 4 digits)",
  };
  return labels[type] || "Identifier (last 4 digits)";
}
