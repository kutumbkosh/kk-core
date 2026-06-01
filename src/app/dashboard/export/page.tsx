"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Asset, Nominee, AssetNomineeMapping, EmergencyDossier, UserProfile } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import {
  ArrowLeft,
  Download,
  Eye,
  Shield,
  FileText,
  Users,
  Loader2,
  AlertTriangle,
  Printer,
} from "lucide-react";

// Unicode symbols for each asset type — print-safe, no SVG dependency
const ASSET_TYPE_SYMBOLS: Record<string, string> = {
  BANK_ACCOUNT: "🏦",
  FIXED_DEPOSIT: "🐷",
  MUTUAL_FUND: "📈",
  INSURANCE: "🛡️",
  DEMAT: "📊",
  EPF: "🏢",
  PPF_NPS: "💰",
  LOAN: "🤝",
  CREDIT_CARD: "💳",
  LOCKER: "🔒",
  REAL_ESTATE: "🏠",
};

const RELATION_LABELS: Record<string, string> = {
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  sibling: "Sibling",
  grandchild: "Grandchild",
  grandparent: "Grandparent",
  in_law: "In-Law",
  other: "Other",
};

export default function ExportPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [mappings, setMappings] = useState<AssetNomineeMapping[]>([]);
  const [dossier, setDossier] = useState<EmergencyDossier | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [assetsRes, nomineesRes, dossierRes, profileRes] = await Promise.all([
      supabase.from("assets").select("*").eq("user_id", user.id).eq("is_draft", false).order("asset_type"),
      supabase.from("nominees").select("*").eq("user_id", user.id),
      supabase.from("emergency_dossiers").select("*").eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    const userAssetIds = (assetsRes.data || []).map((a) => a.id);
    const mappingsRes = userAssetIds.length > 0
      ? await supabase.from("asset_nominee_mappings").select("*").in("asset_id", userAssetIds)
      : { data: [] };

    setAssets(assetsRes.data || []);
    setNominees(nomineesRes.data || []);
    setMappings(mappingsRes.data || []);
    setDossier(dossierRes.data);
    setProfile(profileRes.data);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  // Group assets by type
  const assetsByType: Record<string, Asset[]> = {};
  assets.forEach(a => {
    if (!assetsByType[a.asset_type]) assetsByType[a.asset_type] = [];
    assetsByType[a.asset_type].push(a);
  });

  // Nominee map
  const nomineeMap = new Map(nominees.map(n => [n.id, n]));

  // Assets with/without nominees
  const assetsWithNominee = new Set(mappings.map(m => m.asset_id));
  const coveragePercent = assets.length > 0
    ? Math.round((new Set([...mappings.map(m => m.asset_id)].filter(id => assets.some(a => a.id === id))).size / assets.length) * 100)
    : 0;

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin" />
      </div>
    );
  }

  // ============================================================
  // PRINT PREVIEW — optimized for browser Save as PDF
  // ============================================================
  if (showPreview) {
    return (
      <div className="min-h-screen bg-white">
        {/* Toolbar — hidden when printing */}
        <div className="print:hidden sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to export
          </button>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">Tip: Use &ldquo;Save as PDF&rdquo; in your browser&apos;s print dialog</p>
            <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-4">
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Printable content — inline styles for maximum print reliability */}
        <div
          className="max-w-3xl mx-auto px-8 py-10 print:max-w-none print:px-0 print:py-0"
          style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}
        >

          {/* ─── HEADER ─── */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "3px solid #2563EB" }}>
            <div style={{ width: "44px", height: "44px", backgroundColor: "#2563EB", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", color: "white" }}>🛡️</span>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.3 }}>KutumbKosh Vault Summary</h1>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>Generated on {dateStr} &bull; Confidential Document</p>
            </div>
            {profile?.kutumb_id && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Vault ID</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", margin: 0, fontFamily: "monospace", letterSpacing: "0.08em" }}>{profile.kutumb_id}</p>
              </div>
            )}
          </div>

          {/* ─── OVERVIEW STATS ─── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "28px" }}>
            <div className="print-stat-card" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px", textAlign: "center", background: "#f9fafb" }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0 }}>{assets.length}</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0", fontWeight: 500 }}>Total Assets</p>
            </div>
            <div className="print-stat-card" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px", textAlign: "center", background: "#f9fafb" }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0 }}>{nominees.length}</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0", fontWeight: 500 }}>Nominees</p>
            </div>
            <div className="print-stat-card" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px", textAlign: "center", background: "#f9fafb" }}>
              <p style={{
                fontSize: "28px", fontWeight: 800, margin: 0,
                color: coveragePercent >= 80 ? "#059669" : coveragePercent >= 50 ? "#D97706" : "#DC2626"
              }}>{coveragePercent}%</p>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0", fontWeight: 500 }}>Nominee Coverage</p>
            </div>
          </div>

          {/* ─── ASSETS BY TYPE ─── */}
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 12px", paddingBottom: "6px", borderBottom: "1px solid #e5e7eb" }}>
            📋 Assets ({assets.length})
          </h2>

          {Object.entries(assetsByType).map(([type, typeAssets]) => {
            const config = ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG];
            const symbol = ASSET_TYPE_SYMBOLS[type] || "📄";
            return (
              <div key={type} className="print-section" style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>{symbol}</span>
                  {config?.label || type} ({typeAssets.length})
                </h3>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb" }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Institution</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Account / ID</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Value Band</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Nominee(s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeAssets.map((asset, idx) => {
                        const assetMappings = mappings.filter(m => m.asset_id === asset.id);
                        const isLast = idx === typeAssets.length - 1;
                        return (
                          <tr key={asset.id} style={{ pageBreakInside: "avoid" }}>
                            <td style={{ padding: "8px 12px", fontWeight: 500, color: "#111827", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                              {asset.institution_name}
                            </td>
                            <td style={{ padding: "8px 12px", color: "#4b5563", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                              {asset.account_identifier ? `****${asset.account_identifier}` : "—"}
                            </td>
                            <td style={{ padding: "8px 12px", color: "#4b5563", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                              {asset.approx_value_band || "—"}
                            </td>
                            <td style={{ padding: "8px 12px", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                              {assetMappings.length > 0 ? (
                                <span style={{ color: "#374151" }}>
                                  {assetMappings.map(m => {
                                    const nom = nomineeMap.get(m.nominee_id);
                                    return nom ? `${nom.full_name} (${m.share_percentage}%)` : "";
                                  }).filter(Boolean).join(", ")}
                                </span>
                              ) : (
                                <span style={{ color: "#DC2626", fontSize: "11px", fontWeight: 600 }}>⚠ No nominee</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {assets.length === 0 && (
            <p style={{ color: "#9ca3af", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No assets added yet.</p>
          )}

          {/* ─── NOMINEES ─── */}
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "28px 0 12px", paddingBottom: "6px", borderBottom: "1px solid #e5e7eb" }}>
            👥 Nominees ({nominees.length})
          </h2>

          {nominees.length > 0 ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "20px", pageBreakInside: "avoid" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Relation</th>
                    <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Contact</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#4b5563", borderBottom: "2px solid #e5e7eb" }}>Linked Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {nominees.map((nominee, idx) => {
                    const linked = mappings.filter(m => m.nominee_id === nominee.id);
                    const linkedAssetNames = linked.map(m => {
                      const a = assets.find(a => a.id === m.asset_id);
                      return a ? `${a.institution_name} (${m.share_percentage}%)` : "";
                    }).filter(Boolean);
                    const isLast = idx === nominees.length - 1;
                    return (
                      <tr key={nominee.id} style={{ pageBreakInside: "avoid" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500, color: "#111827", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                          {nominee.full_name}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                          {RELATION_LABELS[nominee.relation] || nominee.relation}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                          {nominee.contact_number || "—"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                          {linkedAssetNames.length > 0 ? (
                            <span style={{ color: "#374151", fontSize: "11px" }}>{linkedAssetNames.join(", ")}</span>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: "11px" }}>None linked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No nominees added yet.</p>
          )}

          {/* ─── NOMINEE GAPS ─── */}
          {assets.filter(a => !assetsWithNominee.has(a.id)).length > 0 && (
            <div className="print-section" style={{ marginBottom: "24px", padding: "14px 16px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "8px", pageBreakInside: "avoid" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#92400E", margin: "0 0 6px" }}>
                ⚠️ Nominee Gaps — {assets.filter(a => !assetsWithNominee.has(a.id)).length} asset{assets.filter(a => !assetsWithNominee.has(a.id)).length !== 1 ? "s" : ""} without nominees:
              </p>
              <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "12px", color: "#78350F" }}>
                {assets.filter(a => !assetsWithNominee.has(a.id)).map(a => (
                  <li key={a.id} style={{ marginBottom: "2px" }}>
                    {ASSET_TYPE_CONFIG[a.asset_type as keyof typeof ASSET_TYPE_CONFIG]?.label || a.asset_type}: {a.institution_name}
                    {a.account_identifier ? ` (****${a.account_identifier})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── EMERGENCY INSTRUCTIONS ─── */}
          {dossier?.general_instructions && (
            <div className="print-section" style={{ pageBreakInside: "avoid" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "28px 0 12px", paddingBottom: "6px", borderBottom: "1px solid #e5e7eb" }}>
                🚨 Emergency Instructions
              </h2>
              <div style={{ padding: "14px 16px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {dossier.general_instructions}
              </div>
            </div>
          )}

          {/* Per-asset-type instructions */}
          {dossier?.asset_type_instructions && Object.entries(dossier.asset_type_instructions).filter(([, v]) => v && typeof v === "string" && (v as string).trim()).length > 0 && (
            <div className="print-section" style={{ marginTop: "16px", pageBreakInside: "avoid" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>Per-Asset-Type Instructions</h3>
              {Object.entries(dossier.asset_type_instructions).filter(([, v]) => v && typeof v === "string" && (v as string).trim()).map(([type, instructions]) => {
                const config = ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG];
                const symbol = ASSET_TYPE_SYMBOLS[type] || "📄";
                return (
                  <div key={type} style={{ marginBottom: "10px", padding: "10px 14px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
                      {symbol} {config?.label || type}
                    </p>
                    <p style={{ fontSize: "12px", color: "#4b5563", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {instructions as string}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── FOOTER ─── */}
          <div style={{ marginTop: "40px", paddingTop: "12px", borderTop: "2px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
              🛡️ KutumbKosh &bull; Your Family&apos;s Financial Safety Net
            </p>
            <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
              Generated {dateStr} &bull; CONFIDENTIAL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN EXPORT PAGE (non-print view)
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Export Vault</h1>
            <p className="text-sm text-gray-500">Download or print your vault summary</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4 text-center">
            <FileText className="w-5 h-5 text-vault-accent mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
            <p className="text-xs text-gray-500">Assets</p>
          </div>
          <div className="card p-4 text-center">
            <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-gray-900">{nominees.length}</p>
            <p className="text-xs text-gray-500">Nominees</p>
          </div>
          <div className="card p-4 text-center">
            <Shield className="w-5 h-5 mx-auto mb-1.5" style={{ color: coveragePercent >= 80 ? "#059669" : coveragePercent >= 50 ? "#D97706" : "#DC2626" }} />
            <p className={`text-2xl font-bold ${coveragePercent >= 80 ? "text-emerald-600" : coveragePercent >= 50 ? "text-amber-600" : "text-red-600"}`}>{coveragePercent}%</p>
            <p className="text-xs text-gray-500">Coverage</p>
          </div>
        </div>

        {/* Export options — available on Free and Pro (DECISIONS.md 2026-05-12 | Product) */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handlePrint}
            className="card w-full flex items-center gap-4 p-5 hover:shadow-card-hover transition-all text-left"
          >
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-vault-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Download as PDF</p>
              <p className="text-xs text-gray-500 mt-0.5">Save a complete vault summary to your device. Uses your browser&apos;s Print &rarr; Save as PDF.</p>
            </div>
          </button>

          <button
            onClick={() => setShowPreview(true)}
            className="card w-full flex items-center gap-4 p-5 hover:shadow-card-hover transition-all text-left"
          >
            <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Preview summary</p>
              <p className="text-xs text-gray-500 mt-0.5">View the vault summary before exporting. Includes all assets, nominees, and emergency instructions.</p>
            </div>
          </button>
        </div>

        {/* Gaps warning */}
        {assets.filter(a => !assetsWithNominee.has(a.id)).length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Nominee gaps detected</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {assets.filter(a => !assetsWithNominee.has(a.id)).length} asset{assets.filter(a => !assetsWithNominee.has(a.id)).length !== 1 ? "s" : ""} don&apos;t have nominees linked.
                The export will mark these so you can address them.
              </p>
            </div>
          </div>
        )}

        {/* What's included */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">What&apos;s included in the export</h3>
          <div className="space-y-2.5">
            {[
              { label: "Asset inventory", desc: "All assets grouped by type with institution details and value bands", icon: FileText, color: "text-vault-accent", bg: "bg-blue-50" },
              { label: "Nominee mapping", desc: "Which nominees are linked to which assets with share percentages", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Coverage report", desc: "Assets without nominees are flagged for your attention", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Emergency instructions", desc: "Your general instructions and per-asset-type guidance for nominees", icon: Shield, color: "text-violet-600", bg: "bg-violet-50" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Security note:</span> The exported document contains sensitive financial information.
            Store it securely and share only with trusted family members.
          </p>
        </div>
      </main>
    </div>
  );
}
