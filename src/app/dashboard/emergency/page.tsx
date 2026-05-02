"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateInstructions } from "@/lib/validations";
import FieldError from "@/components/FieldError";
import type { TrustedContact, Asset, EmergencyDossier } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import {
  ArrowLeft,
  Shield,
  Save,
  Check,
  Loader2,
  Users,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  UserPlus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Hash,
} from "lucide-react";
import EmergencyIllustration from "@/components/illustrations/EmergencyIllustration";

export default function EmergencyPage() {
  const router = useRouter();
  const { isPro, loading: subLoading } = useSubscription();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dossier, setDossier] = useState<EmergencyDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDossier, setEditingDossier] = useState(false);

  // Dossier form fields
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [assetTypeInstructions, setAssetTypeInstructions] = useState<Record<string, string>>({});

  const [dossierErrors, setDossierErrors] = useState<Record<string, string | null>>({});

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [contactsRes, assetsRes, dossierRes] = await Promise.all([
      supabase.from("trusted_contacts").select("*").eq("user_id", user.id).order("created_at"),
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
    // Validate all fields
    const errs: Record<string, string | null> = {};
    errs.general = validateInstructions(generalInstructions, "General instructions");
    assetTypes.forEach((type) => {
      errs[type] = validateInstructions(assetTypeInstructions[type] || "", ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG]?.label + " instructions");
    });
    setDossierErrors(errs);

    if (Object.values(errs).some((e) => e !== null)) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Trim all instruction values
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
      if (newStatus === "ACTIVE") {
        updateData.activation_approved_at = new Date().toISOString();
      }
      const { error } = await supabase.from("trusted_contacts").update(updateData).eq("id", contactId);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Failed to update contact:", err);
    }
  };

  // Group assets by type for instructions
  const assetTypes = Array.from(new Set(assets.map((a) => a.asset_type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-vault-accent rounded-full animate-spin mx-auto mb-3" />
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

        {/* Pro gate */}
        {!isPro && !subLoading && (
          <UpgradePrompt feature="emergency_access" variant="card" />
        )}

        {/* ─── Summary card ─── */}
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

        {/* ─── Trusted Contacts ─── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" /> Trusted Contacts
            </h3>
            <button onClick={() => router.push("/onboarding/emergency-contact")} className="text-xs text-vault-accent font-medium flex items-center gap-1 hover:underline">
              <UserPlus className="w-3.5 h-3.5" /> Add
            </button>
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
                <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    contact.access_status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                    contact.access_status === "REVOKED" ? "bg-red-100 text-red-700" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    {contact.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.contact_name}</p>
                    <p className="text-xs text-gray-500">{contact.relation} · {contact.contact_email || contact.contact_phone || "No contact info"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      contact.access_status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                      contact.access_status === "REVOKED" ? "bg-red-50 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {contact.access_status}
                    </span>
                    {contact.access_status === "PENDING" && (
                      <button onClick={() => handleContactStatusChange(contact.id, "ACTIVE")} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100" title="Approve access">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {contact.access_status === "ACTIVE" && (
                      <button onClick={() => handleContactStatusChange(contact.id, "REVOKED")} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" title="Revoke access">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {contact.access_status === "REVOKED" && (
                      <button onClick={() => handleContactStatusChange(contact.id, "ACTIVE")} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100" title="Re-activate">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Emergency Dossier ─── */}
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
              {/* General instructions */}
              <div>
                <label className="label">General Instructions</label>
                <textarea
                  value={generalInstructions}
                  onChange={(e) => { setGeneralInstructions(e.target.value); if (dossierErrors.general) setDossierErrors((prev) => ({ ...prev, general: validateInstructions(e.target.value, "General instructions") })); }}
                  rows={4}
                  maxLength={5000}
                  className={`input-field resize-none ${dossierErrors.general ? "border-red-300" : ""}`}
                  placeholder="Write general instructions for your family. For example:&#10;• Contact my CA: Mr. Sharma (9876543210)&#10;• All bank statements are in the blue folder in the study&#10;• My will is with Advocate Gupta in Pune"
                />
                <FieldError error={dossierErrors.general ?? null} />
                {!dossierErrors.general && <p className="text-xs text-gray-400 mt-1">{generalInstructions.length}/5,000 characters &middot; Visible to approved trusted contacts</p>}
              </div>

              {/* Per-asset-type instructions */}
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
                            onChange={(e) => { setAssetTypeInstructions({ ...assetTypeInstructions, [type]: e.target.value }); if (dossierErrors[type]) setDossierErrors((prev) => ({ ...prev, [type]: validateInstructions(e.target.value, config?.label + " instructions") })); }}
                            rows={2}
                            maxLength={5000}
                            className={`input-field resize-none text-xs ${dossierErrors[type] ? "border-red-300" : ""}`}
                            placeholder={`How to handle your ${config?.label.toLowerCase()} assets...`}
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
            /* ─── Preview Mode ─── */
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

              {/* Asset summary */}
              {assets.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Asset Summary ({assets.length} assets)</p>
                  <div className="space-y-1.5">
                    {assets.filter(a => !a.is_draft).map((asset) => {
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

              {/* Per-type instructions in preview */}
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
            /* ─── Default state ─── */
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
                  <p className="text-sm text-gray-500 mb-3">
                    You haven&apos;t written any emergency instructions yet.
                  </p>
                  <button onClick={() => setEditingDossier(true)} className="btn-primary text-xs py-2 px-3">
                    <FileText className="w-3.5 h-3.5 mr-1" /> Write your dossier
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Emergency Access Request (Kutumb ID lookup — UI only at launch) ─── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-bold text-gray-900">Access Someone&apos;s Vault</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            If a vault holder has listed you as a trusted contact, enter their Kutumb ID to request emergency access.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., KK-A4B7C2"
              maxLength={9}
              className="input-field flex-1 font-mono uppercase tracking-wide text-sm"
              onChange={(e) => {
                // Normalise: allow only KK- prefix + charset
                const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                e.target.value = raw;
              }}
            />
            <button
              type="button"
              className="btn-secondary text-sm px-4"
              onClick={() => {
                // Backend access-request flow is a future feature.
                // At launch: UI only — button intentionally non-functional.
                alert("Emergency access requests are coming soon. Please contact the vault holder directly.");
              }}
            >
              Request Access
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            The vault holder will be notified and must approve your request before you can see anything.
          </p>
        </div>

        {/* ─── What gets shared ─── */}
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
                {item.ok ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={item.ok ? "text-gray-600" : "text-gray-400 line-through"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
