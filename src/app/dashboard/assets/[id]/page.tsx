"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Asset, ValueBand, Nominee, AssetNomineeMapping } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import {
  ASSET_TYPE_FIELDS,
  VALUE_BAND_OPTIONS,
} from "@/lib/asset-fields";
import { parseFormError } from "@/lib/errors";
import {
  ArrowLeft,
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
  Check,
  Loader2,
  Trash2,
  HelpCircle,
  Users,
  Edit3,
  FileText,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Landmark, PiggyBank, TrendingUp, Shield, BarChart3,
  Building2, Wallet, HandCoins, CreditCard, Lock, Home,
};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [mappings, setMappings] = useState<AssetNomineeMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Editable fields
  const [institutionName, setInstitutionName] = useState("");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [valueBand, setValueBand] = useState<ValueBand | "">("");
  const [notes, setNotes] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const loadAsset = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [assetRes, nomineesRes, mappingsRes] = await Promise.all([
      supabase.from("assets").select("*").eq("id", assetId).eq("user_id", user.id).single(),
      supabase.from("nominees").select("*").eq("user_id", user.id),
      supabase.from("asset_nominee_mappings").select("*").eq("asset_id", assetId),
    ]);

    if (!assetRes.data) {
      router.push("/dashboard");
      return;
    }

    const a = assetRes.data as Asset;
    setAsset(a);
    setNominees(nomineesRes.data || []);
    setMappings(mappingsRes.data || []);

    // Populate edit fields
    setInstitutionName(a.institution_name);
    setAccountIdentifier(a.account_identifier || "");
    setValueBand((a.approx_value_band as ValueBand) || "");
    setNotes(a.notes || "");
    setMetadata((a.metadata as Record<string, string>) || {});
    setLoading(false);
  }, [assetId, router]);

  useEffect(() => { loadAsset(); }, [loadAsset]);

  const handleSave = async () => {
    if (!asset || !institutionName.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("assets").update({
        institution_name: institutionName.trim(),
        account_identifier: accountIdentifier.trim() || null,
        approx_value_band: valueBand || null,
        notes: notes.trim() || null,
        metadata,
        is_draft: false,
        updated_at: new Date().toISOString(),
      }).eq("id", asset.id);

      if (error) throw error;
      setEditing(false);
      await loadAsset();
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(parseFormError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("assets").delete().eq("id", asset.id);
      if (error) throw error;
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteError(parseFormError(err, "delete"));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-vault-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) return null;

  const typeConfig = ASSET_TYPE_CONFIG[asset.asset_type];
  const TypeIcon = iconMap[typeConfig?.icon] || Shield;
  const typeFields = ASSET_TYPE_FIELDS[asset.asset_type];
  const linkedNominees = mappings.map((m) => {
    const nominee = nominees.find((n) => n.id === m.nominee_id);
    return nominee ? { ...nominee, share: m.share_percentage } : null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${typeConfig?.color}15` }}>
              <TypeIcon className="w-5 h-5" style={{ color: typeConfig?.color }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{asset.institution_name}</h1>
              <p className="text-xs text-gray-500">{typeConfig?.label}{asset.account_identifier ? ` · ****${asset.account_identifier}` : ""}</p>
            </div>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-ghost text-vault-accent">
              <Edit3 className="w-4 h-4 mr-1.5" /> Edit
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Draft Banner */}
        {asset.is_draft && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <FileText className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">This asset is a draft</p>
              <p className="text-xs text-amber-600">Complete the details and save to finalize.</p>
            </div>
          </div>
        )}

        {editing ? (
          /* ─── Edit Mode ─── */
          <div className="space-y-6">
            <div>
              <label className="label">Institution / Name <span className="text-red-500">*</span></label>
              <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="label">Identifier (last 4 digits)</label>
              <input type="text" value={accountIdentifier} onChange={(e) => setAccountIdentifier(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} className="input-field" />
            </div>

            {typeFields.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Details</h3>
                <div className="space-y-4">
                  {typeFields.map((field) => (
                    <div key={field.name}>
                      <label className="label">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      {field.type === "select" ? (
                        <select value={metadata[field.name] || ""} onChange={(e) => setMetadata({ ...metadata, [field.name]: e.target.value })} className="input-field">
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea value={metadata[field.name] || ""} onChange={(e) => setMetadata({ ...metadata, [field.name]: e.target.value })} placeholder={field.placeholder} rows={3} className="input-field resize-none" />
                      ) : (
                        <input type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"} value={metadata[field.name] || ""} onChange={(e) => setMetadata({ ...metadata, [field.name]: e.target.value })} placeholder={field.placeholder} className="input-field" />
                      )}
                      {field.helpText && (
                        <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                          <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />{field.helpText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <label className="label">Approximate Value</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VALUE_BAND_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setValueBand(valueBand === opt.value ? "" : opt.value as ValueBand)} className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${valueBand === opt.value ? "border-vault-dark bg-blue-50 text-vault-dark" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input-field resize-none" placeholder="Any notes for your family..." />
            </div>

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{saveError}</div>
            )}
            <div className="border-t border-gray-100 pt-6 flex gap-3">
              <button onClick={() => { setSaveError(""); handleSave(); }} disabled={saving || !institutionName.trim()} className="btn-primary flex-1">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
              <button onClick={() => { setEditing(false); setSaveError(""); loadAsset(); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          /* ─── View Mode ─── */
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${typeConfig?.color}15` }}>
                  <TypeIcon className="w-7 h-7" style={{ color: typeConfig?.color }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{asset.institution_name}</h2>
                  <p className="text-sm text-gray-500">
                    {typeConfig?.label}
                    {asset.account_identifier ? ` · ****${asset.account_identifier}` : ""}
                  </p>
                </div>
              </div>

              {asset.approx_value_band && (
                <div className="inline-block bg-blue-50 text-vault-dark px-3 py-1.5 rounded-lg text-sm font-semibold mb-4">
                  {VALUE_BAND_OPTIONS.find((o) => o.value === asset.approx_value_band)?.label || asset.approx_value_band}
                </div>
              )}

              {/* Metadata fields */}
              {Object.keys(metadata).length > 0 && (
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                  {typeFields.map((field) => {
                    const val = metadata[field.name];
                    if (!val) return null;
                    let displayVal = val;
                    if (field.type === "select" && field.options) {
                      const opt = field.options.find((o) => o.value === val);
                      if (opt) displayVal = opt.label;
                    }
                    return (
                      <div key={field.name} className="flex justify-between items-start">
                        <span className="text-sm text-gray-500">{field.label}</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {asset.notes && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-900">{asset.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 mt-4 text-xs text-gray-400">
                Added on {new Date(asset.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {asset.updated_at !== asset.created_at && (
                  <> · Updated {new Date(asset.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                )}
              </div>
            </div>

            {/* Linked Nominees */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" /> Linked Nominees
                </h3>
              </div>
              {linkedNominees.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No nominees linked to this asset yet.</p>
                  <p className="text-xs text-gray-400">
                    You&apos;ll be able to link nominees in the Nominee Management module.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedNominees.map((n) => n && (
                    <div key={n.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                        {n.full_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{n.full_name}</p>
                        <p className="text-xs text-gray-500">{n.relation}</p>
                      </div>
                      <span className="text-sm font-semibold text-vault-dark">{n.share}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="card border-red-100">
              <h3 className="font-semibold text-gray-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-4">Removing this asset will also remove all linked nominee mappings.</p>
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  {deleteError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{deleteError}</div>
                  )}
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-red-600 font-medium flex-1">Are you sure? This can&apos;t be undone.</p>
                    <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
                    </button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }} className="btn-ghost text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-600 font-medium hover:text-red-700 transition-colors">
                  <Trash2 className="w-4 h-4" /> Remove this asset
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
