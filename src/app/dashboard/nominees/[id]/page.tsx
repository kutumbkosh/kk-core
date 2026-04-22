"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Nominee, NomineeRelation, Asset, AssetNomineeMapping } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import { validateFullName, validatePhone, validatePAN, validateDOB, validateRelation, validateSharePercentage } from "@/lib/validations";
import FieldError from "@/components/FieldError";
import {
  ArrowLeft,
  Check,
  Loader2,
  Trash2,
  Edit3,
  User,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Link2,
  Unlink,
  Plus,
  Landmark,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Building2,
  Wallet,
  HandCoins,
  Lock,
  Home,
  FileText,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Landmark, PiggyBank, TrendingUp, Shield, BarChart3,
  Building2, Wallet, HandCoins, CreditCard, Lock, Home,
};

const RELATION_OPTIONS: { value: NomineeRelation; label: string }[] = [
  { value: "SPOUSE", label: "Spouse" },
  { value: "CHILD", label: "Child" },
  { value: "PARENT", label: "Parent" },
  { value: "SIBLING", label: "Sibling" },
  { value: "OTHER", label: "Other" },
];

export default function NomineeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const nomineeId = params.id as string;

  const [nominee, setNominee] = useState<Nominee | null>(null);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [mappings, setMappings] = useState<AssetNomineeMapping[]>([]);
  const [allMappings, setAllMappings] = useState<AssetNomineeMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingAssetId, setLinkingAssetId] = useState("");
  const [linkSharePct, setLinkSharePct] = useState("100");
  const [linkSaving, setLinkSaving] = useState(false);

  // Edit fields
  const [fullName, setFullName] = useState("");
  const [relation, setRelation] = useState<NomineeRelation | "">("");
  const [contactNumber, setContactNumber] = useState("");
  const [dob, setDob] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [linkError, setLinkError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [nomineeRes, assetsRes, mappingsRes, allMappingsRes] = await Promise.all([
      supabase.from("nominees").select("*").eq("id", nomineeId).eq("user_id", user.id).single(),
      supabase.from("assets").select("*").eq("user_id", user.id).order("institution_name"),
      supabase.from("asset_nominee_mappings").select("*").eq("nominee_id", nomineeId),
      supabase.from("asset_nominee_mappings").select("*"),
    ]);

    if (!nomineeRes.data) { router.push("/dashboard/nominees"); return; }

    const n = nomineeRes.data as Nominee;
    setNominee(n);
    setAllAssets(assetsRes.data || []);
    setMappings(mappingsRes.data || []);
    setAllMappings(allMappingsRes.data || []);

    setFullName(n.full_name);
    setRelation(n.relation);
    setContactNumber(n.contact_number || "");
    setDob(n.dob || "");
    setPanNumber(n.pan_number || "");
    setLoading(false);
  }, [nomineeId, router]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const handleSave = async () => {
    if (!nominee) return;

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
      const { error } = await supabase.from("nominees").update({
        full_name: fullName.trim(),
        relation,
        contact_number: contactNumber.trim() || null,
        dob: dob || null,
        pan_number: panNumber.trim().toUpperCase() || null,
        updated_at: new Date().toISOString(),
      }).eq("id", nominee.id);
      if (error) throw error;
      setEditing(false);
      await loadData();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!nominee) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      // Delete mappings first, then nominee
      await supabase.from("asset_nominee_mappings").delete().eq("nominee_id", nominee.id);
      const { error } = await supabase.from("nominees").delete().eq("id", nominee.id);
      if (error) throw error;
      router.push("/dashboard/nominees");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete.");
      setDeleting(false);
    }
  };

  const handleLinkAsset = async () => {
    if (!linkingAssetId || !linkSharePct) return;

    const available = getAvailableShare(linkingAssetId);
    const shareErr = validateSharePercentage(parseInt(linkSharePct), available);
    if (shareErr) {
      setLinkError(shareErr);
      return;
    }
    setLinkError(null);
    setLinkSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("asset_nominee_mappings").insert({
        asset_id: linkingAssetId,
        nominee_id: nomineeId,
        share_percentage: parseInt(linkSharePct),
      });
      if (error) throw error;
      setShowLinkModal(false);
      setLinkingAssetId("");
      setLinkSharePct("100");
      await loadData();
    } catch (err) {
      console.error("Link failed:", err);
      alert("Failed to link asset. The total share for an asset cannot exceed 100%.");
    } finally {
      setLinkSaving(false);
    }
  };

  const handleUnlinkAsset = async (mappingId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("asset_nominee_mappings").delete().eq("id", mappingId);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Unlink failed:", err);
      alert("Failed to unlink asset.");
    }
  };

  // Assets already linked to this nominee
  const linkedAssetIds = new Set(mappings.map((m) => m.asset_id));
  // Assets available to link (not yet linked to THIS nominee)
  const availableAssets = allAssets.filter((a) => !linkedAssetIds.has(a.id));

  // For each available asset, calculate remaining share
  const getAvailableShare = (assetId: string) => {
    const usedShare = allMappings
      .filter((m) => m.asset_id === assetId)
      .reduce((sum, m) => sum + (m.share_percentage || 0), 0);
    return Math.max(0, 100 - usedShare);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading nominee details...</p>
        </div>
      </div>
    );
  }

  if (!nominee) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/nominees")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-700">
              {nominee.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{nominee.full_name}</h1>
              <p className="text-xs text-gray-500">{nominee.relation}</p>
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
        {editing ? (
          /* ─── Edit Mode ─── */
          <div className="space-y-5">
            <div>
              <label className="label">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); if (touched.fullName) validateField("fullName", e.target.value); }} onBlur={() => handleBlur("fullName", fullName)} className={`input-field ${touched.fullName && errors.fullName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`} />
              <FieldError error={touched.fullName ? errors.fullName ?? null : null} />
            </div>
            <div>
              <label className="label">Relationship <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {RELATION_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => { setRelation(opt.value); setTouched(prev => ({ ...prev, relation: true })); setErrors(prev => ({ ...prev, relation: null })); }} className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${relation === opt.value ? "border-vault-dark bg-blue-50 text-vault-dark" : "border-gray-200 text-gray-600"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError error={touched.relation ? errors.relation ?? null : null} />
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input type="tel" value={contactNumber} onChange={(e) => { setContactNumber(e.target.value); if (touched.contactNumber) validateField("contactNumber", e.target.value); }} onBlur={() => handleBlur("contactNumber", contactNumber)} className={`input-field ${touched.contactNumber && errors.contactNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`} placeholder="+91 98765 43210" />
              <FieldError error={touched.contactNumber ? errors.contactNumber ?? null : null} />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => { setDob(e.target.value); if (touched.dob) validateField("dob", e.target.value); }} onBlur={() => handleBlur("dob", dob)} className={`input-field ${touched.dob && errors.dob ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`} />
              <FieldError error={touched.dob ? errors.dob ?? null : null} />
            </div>
            <div>
              <label className="label">PAN Number</label>
              <input type="text" value={panNumber} onChange={(e) => { const v = e.target.value.toUpperCase().slice(0, 10); setPanNumber(v); if (touched.panNumber) validateField("panNumber", v); }} onBlur={() => handleBlur("panNumber", panNumber)} maxLength={10} className={`input-field ${touched.panNumber && errors.panNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`} placeholder="ABCDE1234F" />
              <FieldError error={touched.panNumber ? errors.panNumber ?? null : null} />
            </div>
            <div className="border-t border-gray-100 pt-6">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                  {formError}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Changes
                </button>
                <button onClick={() => { setEditing(false); setErrors({}); setTouched({}); setFormError(""); loadData(); }} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── View Mode ─── */
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="card">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                  {nominee.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{nominee.full_name}</h2>
                  <span className="text-sm bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                    {nominee.relation}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {nominee.contact_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{nominee.contact_number}</span>
                  </div>
                )}
                {nominee.dob && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {new Date(nominee.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
                {nominee.pan_number && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{nominee.pan_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Assets */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-gray-500" /> Linked Assets
                </h3>
                {availableAssets.length > 0 && (
                  <button onClick={() => setShowLinkModal(true)} className="text-sm text-vault-accent font-medium flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Link Asset
                  </button>
                )}
              </div>

              {mappings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">
                    No assets linked to {nominee.full_name} yet.
                  </p>
                  {availableAssets.length > 0 ? (
                    <button onClick={() => setShowLinkModal(true)} className="btn-primary text-sm py-2 px-4">
                      <Plus className="w-4 h-4 mr-1.5" /> Link an Asset
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Add some assets to your vault first, then come back to link them.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {mappings.map((mapping) => {
                    const asset = allAssets.find((a) => a.id === mapping.asset_id);
                    if (!asset) return null;
                    const config = ASSET_TYPE_CONFIG[asset.asset_type];
                    const IconComp = iconMap[config?.icon] || FileText;
                    return (
                      <div key={mapping.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config?.color}15` }}>
                          <IconComp className="w-5 h-5" style={{ color: config?.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{asset.institution_name}</p>
                          <p className="text-xs text-gray-500">{config?.label}</p>
                        </div>
                        <span className="text-sm font-bold text-vault-dark bg-blue-50 px-2.5 py-1 rounded-lg">
                          {mapping.share_percentage}%
                        </span>
                        <button
                          onClick={() => handleUnlinkAsset(mapping.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Unlink asset"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="card border-red-100">
              <h3 className="font-semibold text-gray-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-4">This will also remove all asset-nominee links for {nominee.full_name}.</p>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-red-600 font-medium flex-1">Are you sure?</p>
                  <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost text-sm">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-600 font-medium hover:text-red-700">
                  <Trash2 className="w-4 h-4" /> Remove nominee
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── Link Asset Modal ─── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Link an Asset</h3>
              <p className="text-sm text-gray-500">Choose an asset and set the share percentage</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Asset selection */}
              <div>
                <label className="label">Select Asset <span className="text-red-500">*</span></label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableAssets.map((asset) => {
                    const config = ASSET_TYPE_CONFIG[asset.asset_type];
                    const IconComp = iconMap[config?.icon] || FileText;
                    const remaining = getAvailableShare(asset.id);
                    return (
                      <button
                        key={asset.id}
                        onClick={() => {
                          setLinkingAssetId(asset.id);
                          setLinkSharePct(String(Math.min(100, remaining)));
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          linkingAssetId === asset.id
                            ? "border-vault-dark bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config?.color}15` }}>
                          <IconComp className="w-4 h-4" style={{ color: config?.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{asset.institution_name}</p>
                          <p className="text-xs text-gray-500">{config?.label}</p>
                        </div>
                        <span className="text-xs text-gray-400">{remaining}% available</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Share percentage */}
              {linkingAssetId && (
                <div>
                  <label className="label">Share Percentage <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={getAvailableShare(linkingAssetId)}
                      value={linkSharePct}
                      onChange={(e) => { setLinkSharePct(e.target.value); if (linkError) setLinkError(null); }}
                      onBlur={() => { if (linkSharePct && linkingAssetId) { const err = validateSharePercentage(parseInt(linkSharePct), getAvailableShare(linkingAssetId)); setLinkError(err); } }}
                      className={`input-field w-28 ${linkError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                    />
                    <span className="text-sm text-gray-500">%</span>
                    <p className="text-xs text-gray-400 flex-1">
                      Max: {getAvailableShare(linkingAssetId)}%
                    </p>
                  </div>
                  <FieldError error={linkError} />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleLinkAsset}
                disabled={linkSaving || !linkingAssetId || !linkSharePct}
                className="btn-primary flex-1"
              >
                {linkSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                Link Asset
              </button>
              <button onClick={() => { setShowLinkModal(false); setLinkingAssetId(""); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
