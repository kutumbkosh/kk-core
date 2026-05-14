"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateInstructions } from "@/lib/validations";
import FieldError from "@/components/FieldError";
import type { TrustedContact, Asset, EmergencyDossier } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import { RELATIONSHIP_OPTIONS } from "@/lib/relationship-options";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import {
  ArrowLeft, Shield, Save, Check, Loader2, Users, FileText, AlertTriangle,
  Eye, EyeOff, UserPlus, ShieldOff, ShieldCheck, Trash2, XCircle, CheckCircle2,
  Timer, Zap, ChevronDown, ChevronUp,
} from "lucide-react";
import EmergencyIllustration from "@/components/illustrations/EmergencyIllustration";

const RELATION_DISPLAY: Record<string, string> = Object.fromEntries(
  RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label])
);

// Feature flag — gated until Operations confirms external legal review (HANDOFFS.md ID #40)
const V2V3_ENABLED = process.env.NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 === "true";

const INACTIVITY_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days (recommended)" },
  { value: 180, label: "180 days" },
];
const GRACE_OPTIONS = [
  { value: 14, label: "14 days (minimum)" },
  { value: 21, label: "21 days" },
  { value: 30, label: "30 days" },
];

// ─── Access Mode Panel ───────────────────────────────────────────────────────

interface AccessModePanelProps {
  contact: TrustedContact;
  onSaved: () => void;
}

function AccessModePanel({ contact, onSaved }: AccessModePanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"MANUAL" | "INACTIVITY" | "PRE_AUTHORIZED">(
    contact.access_mode ?? "MANUAL"
  );
  const [inactivityDays, setInactivityDays] = useState(contact.inactivity_days ?? 90);
  const [gracePeriodDays, setGracePeriodDays] = useState(contact.grace_period_days ?? 14);
  const [country, setCountry] = useState(contact.country_of_residence ?? "");
  const [consentChecked, setConsentChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset consent when mode changes
  const handleModeChange = (mode: "MANUAL" | "INACTIVITY" | "PRE_AUTHORIZED") => {
    setSelectedMode(mode);
    setConsentChecked(false);
    setError(null);
  };

  const handleSave = async () => {
    if (selectedMode !== "MANUAL" && !consentChecked) {
      setError("Please confirm you have read and understood the consent statement above.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/emergency/access-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trusted_contact_id: contact.id,
          access_mode: selectedMode,
          inactivity_days: selectedMode === "INACTIVITY" ? inactivityDays : undefined,
          grace_period_days: selectedMode === "INACTIVITY" ? gracePeriodDays : undefined,
          country_of_residence: country.trim() || null,
          consent_confirmed: consentChecked || selectedMode === "MANUAL",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save access mode");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currentMode = contact.access_mode ?? "MANUAL";
  const modeLabel: Record<string, string> = {
    MANUAL: "Manual approval only",
    INACTIVITY: "Inactivity timer",
    PRE_AUTHORIZED: "Pre-authorised access",
  };
  const modeBadgeColor: Record<string, string> = {
    MANUAL: "bg-gray-100 text-gray-600",
    INACTIVITY: "bg-amber-50 text-amber-700",
    PRE_AUTHORIZED: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => { setOpen((o) => !o); setError(null); }}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Timer className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">Access mode</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${modeBadgeColor[currentMode]}`}>
            {modeLabel[currentMode] ?? "Manual approval only"}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Mode selector */}
          <div className="space-y-2">
            {/* V1 — Manual */}
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedMode === "MANUAL" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name={`mode-${contact.id}`}
                value="MANUAL"
                checked={selectedMode === "MANUAL"}
                onChange={() => handleModeChange("MANUAL")}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="text-xs font-semibold text-gray-900">Manual approval only</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {contact.contact_name} must request access and you approve it manually.
                  Nothing happens automatically. (Default)
                </p>
              </div>
            </label>

            {/* V2 — Inactivity timer */}
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedMode === "INACTIVITY" ? "border-amber-300 bg-amber-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name={`mode-${contact.id}`}
                value="INACTIVITY"
                checked={selectedMode === "INACTIVITY"}
                onChange={() => handleModeChange("INACTIVITY")}
                className="mt-0.5 accent-amber-600"
              />
              <div>
                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <Timer className="w-3 h-3 text-amber-600" /> If I haven&apos;t been active for a while
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  If you haven&apos;t logged in for the period you choose, {contact.contact_name} will be
                  notified. You&apos;ll get a grace period to deny before access is granted.
                </p>
              </div>
            </label>

            {/* V3 — Pre-authorized */}
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedMode === "PRE_AUTHORIZED" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name={`mode-${contact.id}`}
                value="PRE_AUTHORIZED"
                checked={selectedMode === "PRE_AUTHORIZED"}
                onChange={() => handleModeChange("PRE_AUTHORIZED")}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-blue-600" /> Trust them fully — access anytime
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {contact.contact_name} can view your vault at any time without needing your
                  approval. You can revoke this at any time.
                </p>
              </div>
            </label>
          </div>

          {/* V2 — Configuration fields */}
          {selectedMode === "INACTIVITY" && (
            <div className="space-y-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Grant access if I haven&apos;t logged in for
                </label>
                <select
                  value={inactivityDays}
                  onChange={(e) => setInactivityDays(Number(e.target.value))}
                  className="input-field text-xs py-2"
                >
                  {INACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Give me this many days to deny before access is granted
                </label>
                <select
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                  className="input-field text-xs py-2"
                >
                  {GRACE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Minimum 14 days required.</p>
              </div>
            </div>
          )}

          {/* Country of residence — Condition 5 (S.16 compliance) */}
          {selectedMode !== "MANUAL" && (
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                {contact.contact_name}&apos;s country of residence{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India, UAE, USA"
                className="input-field text-xs py-2"
                maxLength={60}
              />
              <p className="text-xs text-gray-400 mt-1">
                Used internally for data compliance tracking only. Not visible to contacts.
              </p>
            </div>
          )}

          {/* Locked consent copy — V2 (Condition 3) */}
          {selectedMode === "INACTIVITY" && (
            <div className="p-3 bg-white border border-amber-200 rounded-lg text-xs text-gray-700 leading-relaxed space-y-2">
              <p className="font-semibold text-amber-800">Inactivity Access Grant</p>
              <p>
                If I have not logged into my KutumbKosh vault for{" "}
                <strong>{inactivityDays} days</strong>, I authorise KutumbKosh to notify{" "}
                <strong>{contact.contact_name}</strong> that they may request access to my vault.
              </p>
              <p>
                After <strong>{contact.contact_name}</strong> requests access, I will receive{" "}
                <strong>{gracePeriodDays} days&apos;</strong> notice by email to deny. If I do not
                deny within this period, <strong>{contact.contact_name}</strong> will be granted
                read-only access to my vault.
              </p>
              <p className="text-gray-500">I understand:</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>{contact.contact_name} will be notified immediately when access is granted.</li>
                <li>I can turn this off at any time from my vault settings before the inactivity timer fires.</li>
                <li>This is designed for my family&apos;s emergency readiness.</li>
              </ul>
              <label className="flex items-start gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => { setConsentChecked(e.target.checked); setError(null); }}
                  className="mt-0.5 accent-amber-600"
                />
                <span className="text-xs font-medium text-gray-800">
                  I confirm this is my choice — Save Setting
                </span>
              </label>
            </div>
          )}

          {/* Locked consent copy — V3 (Condition 7) */}
          {selectedMode === "PRE_AUTHORIZED" && (
            <div className="p-3 bg-white border border-blue-200 rounded-lg text-xs text-gray-700 leading-relaxed space-y-2">
              <p className="font-semibold text-blue-800">Pre-Authorised Vault Access</p>
              <p>
                I authorise <strong>{contact.contact_name}</strong> to view my KutumbKosh vault
                at any time. This access is immediate and remains active until I revoke it.
              </p>
              <p className="text-gray-500">I understand:</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>{contact.contact_name} will receive a notification with access instructions immediately.</li>
                <li>I can revoke this access at any time from my vault settings.</li>
                <li>I will receive an annual reminder to review this setting.</li>
              </ul>
              <label className="flex items-start gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => { setConsentChecked(e.target.checked); setError(null); }}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-xs font-medium text-gray-800">
                  I authorise this access — Save Setting
                </span>
              </label>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs py-2 flex-1"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save access mode
            </button>
            <button
              onClick={() => { setOpen(false); setError(null); }}
              className="btn-secondary text-xs py-2 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EmergencyPage() {
  const router = useRouter();
  const { isPro, isAtTrustedContactLimit, loading: subLoading } = useSubscription();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dossier, setDossier] = useState<EmergencyDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDossier, setEditingDossier] = useState(false);

  const [generalInstructions, setGeneralInstructions] = useState("");
  const [assetTypeInstructions, setAssetTypeInstructions] = useState<Record<string, string>>({});
  const [dossierErrors, setDossierErrors] = useState<Record<string, string | null>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [contactsRes, assetsRes, dossierRes] = await Promise.all([
      supabase.from("trusted_contacts").select("*").eq("user_id", user.id).is("deleted_at", null).order("created_at"),
      supabase.from("assets").select("*").eq("user_id", user.id).order("asset_type"),
      supabase.from("emergency_dossiers").select("*").eq("user_id", user.id).single(),
    ]);

    setContacts(contactsRes.data || []);
    setAssets(assetsRes.data || []);

    if (dossierRes.data) {
      const d = dossierRes.data as EmergencyDossier;
      setDossier(d);
      setGeneralInstructions(d.general_instructions || "");
      setAssetTypeInstructions((d.asset_type_instructions as Record<string, string>) || {});
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveDossier = async () => {
    const errs: Record<string, string | null> = {};
    errs.general = validateInstructions(generalInstructions, "General instructions");
    assetTypes.forEach((type) => {
      errs[type] = validateInstructions(
        assetTypeInstructions[type] || "",
        (ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG]?.label ?? type) + " instructions"
      );
    });
    setDossierErrors(errs);
    if (Object.values(errs).some((e) => e !== null)) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const trimmedTypeInstructions: Record<string, string> = {};
      Object.entries(assetTypeInstructions).forEach(([k, v]) => { if (v.trim()) trimmedTypeInstructions[k] = v.trim(); });

      const payload = {
        user_id: user.id,
        general_instructions: generalInstructions.trim() || null,
        asset_type_instructions: trimmedTypeInstructions,
        updated_at: new Date().toISOString(),
      };

      if (dossier) {
        const { error } = await supabase.from("emergency_dossiers").update(payload).eq("id", dossier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("emergency_dossiers").insert(payload);
        if (error) throw error;
      }
      setEditingDossier(false);
      await loadData();
    } catch (err) {
      console.error("Failed to save dossier:", err);
      setDossierErrors((prev) => ({ ...prev, general: "Something went wrong. Please try again." }));
    } finally {
      setSaving(false);
    }
  };

  const handleContactStatusChange = async (contactId: string, newStatus: "ACTIVE" | "REVOKED") => {
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = { access_status: newStatus };
      if (newStatus === "ACTIVE") updateData.activation_approved_at = new Date().toISOString();
      const { error } = await supabase.from("trusted_contacts").update(updateData).eq("id", contactId);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Failed to update contact:", err);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("trusted_contacts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", contactId);
      if (error) throw error;
      setConfirmRemoveId(null);
      await loadData();
    } catch (err) {
      console.error("Failed to remove contact:", err);
    }
  };

  const assetTypes = Array.from(new Set(assets.map((a) => a.asset_type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
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
            <h1 className="text-lg font-bold text-gray-900">Emergency Access</h1>
            <p className="text-sm text-gray-500">Instructions and access for your trusted contacts</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* Summary card */}
        <div className="card flex items-start gap-4 p-5">
          <div className="w-20 h-20 flex-shrink-0">
            <EmergencyIllustration />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">What is this?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your emergency dossier is a set of instructions that your trusted contacts can see if
              something happens to you. It tells them where to find your assets, who to contact, and
              what steps to take. No passwords or full account numbers are ever shared.
            </p>
          </div>
        </div>

        {/* Trusted Contacts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" /> Trusted Contacts
            </h3>
            {isAtTrustedContactLimit(contacts.length) ? (
              <UpgradePrompt feature="emergency_contact_limit" variant="inline" />
            ) : (
              <button onClick={() => router.push("/onboarding/emergency-contact")} className="text-xs text-vault-accent font-medium flex items-center gap-1 hover:underline">
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">No trusted contacts added yet.</p>
              <button onClick={() => router.push("/onboarding/emergency-contact")} className="btn-primary text-xs py-2 px-3">
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Add a contact
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                  {confirmRemoveId === contact.id ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-xs text-gray-700 flex-1 min-w-0">
                        Remove <span className="font-semibold">{contact.contact_name}</span> as a trusted contact?
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleRemoveContact(contact.id)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                        <button onClick={() => setConfirmRemoveId(null)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                          contact.access_status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                          contact.access_status === "REVOKED" ? "bg-red-100 text-red-700" :
                          "bg-gray-200 text-gray-600"
                        }`}>
                          {contact.contact_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{contact.contact_name}</p>
                          <p className="text-xs text-gray-500">
                            {RELATION_DISPLAY[contact.relation] ?? contact.relation}
                            {contact.contact_phone ? ` · ${contact.contact_phone}` : ""}
                            {contact.contact_email ? ` · ${contact.contact_email}` : ""}
                          </p>
                          {!contact.contact_email && !contact.contact_phone && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800">
                              ⚠ Missing contact info
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              contact.access_status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                              contact.access_status === "REVOKED" ? "bg-red-50 text-red-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {contact.access_status}
                            </span>
                            {contact.access_status === "PENDING" && (
                              <button onClick={() => handleContactStatusChange(contact.id, "ACTIVE")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                            )}
                            {contact.access_status === "ACTIVE" && (
                              <button onClick={() => handleContactStatusChange(contact.id, "REVOKED")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
                                <ShieldOff className="w-3 h-3" /> Revoke Access
                              </button>
                            )}
                            {contact.access_status === "REVOKED" && (
                              <button onClick={() => handleContactStatusChange(contact.id, "ACTIVE")} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> Restore Access
                              </button>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setConfirmRemoveId(contact.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0" title="Remove contact">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* V2/V3 access mode panel — feature-flagged + Pro-gated */}
                      {V2V3_ENABLED && isPro && (
                        <AccessModePanel contact={contact} onSaved={loadData} />
                      )}
                      {V2V3_ENABLED && !isPro && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <UpgradePrompt feature="emergency_access_v2v3" variant="banner" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Dossier */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" /> Emergency Dossier
            </h3>
            <div className="flex items-center gap-2">
              {!editingDossier && (
                <button onClick={() => setShowPreview(!showPreview)} className="btn-ghost text-xs py-1.5 px-2.5">
                  {showPreview ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                  {showPreview ? "Hide" : "Preview"}
                </button>
              )}
              {!editingDossier && (
                <button onClick={() => setEditingDossier(true)} className="text-xs text-vault-accent font-medium hover:underline">
                  Edit
                </button>
              )}
            </div>
          </div>

          {editingDossier ? (
            <div className="space-y-5">
              <div>
                <label className="label">General Instructions</label>
                <textarea
                  value={generalInstructions}
                  onChange={(e) => { setGeneralInstructions(e.target.value); if (dossierErrors.general) setDossierErrors((prev) => ({ ...prev, general: validateInstructions(e.target.value, "General instructions") })); }}
                  rows={4}
                  maxLength={5000}
                  className={`input-field resize-none ${dossierErrors.general ? "border-red-300" : ""}`}
                  placeholder={"Write general instructions for your family. For example:\n• Contact my CA: Mr. Sharma (9876543210)\n• All bank statements are in the blue folder in the study\n• My will is with Advocate Gupta in Pune"}
                />
                <FieldError error={dossierErrors.general ?? null} />
                {!dossierErrors.general && <p className="text-xs text-gray-400 mt-1">{generalInstructions.length}/5,000 characters · Visible to approved trusted contacts</p>}
              </div>

              {assetTypes.length > 0 && (
                <div>
                  <label className="label">Instructions by Asset Type</label>
                  <p className="text-xs text-gray-400 mb-3">Add specific notes for each category of assets you hold.</p>
                  <div className="space-y-3">
                    {assetTypes.map((type) => {
                      const config = ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG];
                      return (
                        <div key={type}>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">{config?.label}</label>
                          <textarea
                            value={assetTypeInstructions[type] || ""}
                            onChange={(e) => { setAssetTypeInstructions({ ...assetTypeInstructions, [type]: e.target.value }); if (dossierErrors[type]) setDossierErrors((prev) => ({ ...prev, [type]: validateInstructions(e.target.value, (config?.label ?? type) + " instructions") })); }}
                            rows={2}
                            maxLength={5000}
                            className={`input-field resize-none text-xs ${dossierErrors[type] ? "border-red-300" : ""}`}
                            placeholder={`How to handle your ${config?.label?.toLowerCase() ?? type} assets...`}
                          />
                          <FieldError error={dossierErrors[type] ?? null} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {assetTypes.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Add assets to your vault first — then you can write specific instructions for each type.</p>
                </div>
              )}

              <div className="flex gap-3 border-t border-gray-100 pt-4">
                <button onClick={handleSaveDossier} disabled={saving} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Dossier
                </button>
                <button onClick={() => { setEditingDossier(false); loadData(); }} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : showPreview ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> This is what your trusted contacts will see
                </p>
              </div>
              {generalInstructions ? (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">General Instructions</p>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{generalInstructions}</div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No general instructions written yet.</p>
              )}
              {assets.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Asset Summary ({assets.length} assets)</p>
                  <div className="space-y-1.5">
                    {assets.filter((a) => !a.is_draft).map((asset) => {
                      const config = ASSET_TYPE_CONFIG[asset.asset_type];
                      return (
                        <div key={asset.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${config?.color}12` }}>
                            <Shield className="w-3 h-3" style={{ color: config?.color }} />
                          </div>
                          <span className="text-xs text-gray-700 flex-1">{asset.institution_name}</span>
                          <span className="text-xs text-gray-400">{config?.label}</span>
                          {asset.account_identifier && <span className="text-xs text-gray-400">****{asset.account_identifier}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {Object.entries(assetTypeInstructions).filter(([, v]) => v?.trim()).map(([type, instruction]) => {
                const config = ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG];
                return (
                  <div key={type}>
                    <p className="text-xs font-semibold text-gray-700 mb-1">{config?.label} — Notes</p>
                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap">{instruction}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {dossier ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm text-gray-700">Dossier created</p>
                  </div>
                  {generalInstructions && (
                    <p className="text-xs text-gray-500 line-clamp-2">{generalInstructions}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date(dossier.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">You haven&apos;t written any emergency instructions yet.</p>
                  <button onClick={() => setEditingDossier(true)} className="btn-primary text-xs py-2 px-3">
                    <FileText className="w-3.5 h-3.5 mr-1" /> Write your dossier
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* What gets shared */}
        <div className="card bg-gray-50 border-gray-200 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">What your contacts can see</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Asset names & types", ok: true },
              { label: "Last 4 digits only", ok: true },
              { label: "Nominee information", ok: true },
              { label: "Your instructions", ok: true },
              { label: "Full account numbers", ok: false },
              { label: "Passwords / PINs", ok: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                {item.ok
                  ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                  : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span className={item.ok ? "text-gray-600" : "text-gray-400 line-through"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
