"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Users,
  Target,
  IndianRupee,
  TrendingUp,
  Loader2,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  Link2,
  Keyboard,
  UserPlus,
  Briefcase,
  Shield,
  Landmark,
  Wallet,
  Cpu,
  Building2,
  Pencil,
  X,
} from "lucide-react";

interface PartnerDetail {
  id: string;
  partner_name: string;
  channel_type: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  referral_code: string;
  referral_link: string;
  commission_per_signup: number;
  status: string;
  monthly_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MonthlyPerf {
  month: string;
  referrals: number;
  conversions: number;
  commission: number;
  cost: number;
}

interface Referral {
  id: string;
  full_name: string | null;
  email: string | null;
  source: string;
  signed_up_at: string;
  converted_at: string | null;
  commission_amount: number;
  commission_paid: boolean;
}

interface PartnerData {
  partner: PartnerDetail;
  monthly_performance: MonthlyPerf[];
  recent_referrals: Referral[];
}

const CHANNEL_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CA: { label: "Chartered Accountant", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
  INSURANCE: { label: "Insurance Company", icon: Shield, color: "text-amber-600 bg-amber-50" },
  INVESTMENT: { label: "Investment Firm", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  BANK: { label: "Bank", icon: Landmark, color: "text-purple-600 bg-purple-50" },
  WEALTH_MANAGER: { label: "Wealth Manager", icon: Wallet, color: "text-indigo-600 bg-indigo-50" },
  FINTECH: { label: "Fintech Partner", icon: Cpu, color: "text-cyan-600 bg-cyan-50" },
  OTHER: { label: "Other", icon: Building2, color: "text-gray-600 bg-gray-100" },
};

const SOURCE_ICON: Record<string, React.ElementType> = {
  LINK: Link2,
  CODE: Keyboard,
  MANUAL: UserPlus,
};

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [data, setData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: result } = await supabase.rpc("admin_channel_partner_detail", {
      p_partner_id: partnerId,
    });
    if (result) setData(result);
    setLoading(false);
  }, [partnerId]);

  useEffect(() => { loadData(); }, [loadData]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data || !data.partner) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Partner not found.</p>
        <button onClick={() => router.push("/admin/channels")} className="btn-ghost mt-4">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Channels
        </button>
      </div>
    );
  }

  const { partner, monthly_performance, recent_referrals } = data;
  const config = CHANNEL_TYPE_CONFIG[partner.channel_type] || CHANNEL_TYPE_CONFIG.OTHER;

  const totalReferrals = recent_referrals.length;
  const totalConversions = recent_referrals.filter(r => r.converted_at).length;
  const conversionRate = totalReferrals > 0 ? ((totalConversions / totalReferrals) * 100).toFixed(1) : "0.0";
  const totalRevenue = totalConversions * 499;
  const totalCommission = recent_referrals.filter(r => r.converted_at).reduce((s, r) => s + r.commission_amount, 0);
  const unpaidCommission = recent_referrals.filter(r => r.converted_at && !r.commission_paid).reduce((s, r) => s + r.commission_amount, 0);

  const maxRefs = Math.max(...monthly_performance.map(m => m.referrals), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => router.push("/admin/channels")} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors mt-0.5">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{partner.partner_name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                partner.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                partner.status === "PAUSED" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              }`}>{partner.status}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <config.icon className="w-3 h-3" />
                {config.label}
              </span>
              {partner.contact_name && <span>{partner.contact_name}</span>}
              {partner.contact_email && <span>&middot; {partner.contact_email}</span>}
            </div>
          </div>
        </div>
        <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </div>

      {/* Referral codes */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Referral Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Referral Code</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono font-bold text-gray-900">{partner.referral_code}</code>
              <button onClick={() => copyToClipboard(partner.referral_code, "code")} className="p-1 hover:bg-gray-200 rounded transition-colors">
                {copiedField === "code" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Referral Link</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-gray-700 truncate">{partner.referral_link}</code>
              <button onClick={() => copyToClipboard(partner.referral_link, "link")} className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0">
                {copiedField === "link" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Commission / Signup</p>
            <p className="text-lg font-bold text-gray-900">₹{partner.commission_per_signup}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Monthly Retainer</p>
            <p className="text-lg font-bold text-gray-900">₹{partner.monthly_cost.toLocaleString("en-IN")}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Partner Since</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(partner.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          {partner.contact_phone && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-semibold text-gray-900">{partner.contact_phone}</p>
            </div>
          )}
        </div>
        {partner.notes && (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700">{partner.notes}</p>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Referrals", value: totalReferrals, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Conversions", value: totalConversions, icon: Target, color: "bg-green-50 text-green-600" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
          { label: "Revenue Generated", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-emerald-50 text-emerald-600" },
          { label: "Commission Unpaid", value: `₹${unpaidCommission.toLocaleString("en-IN")}`, icon: Wallet, color: "bg-red-50 text-red-600" },
        ].map((m) => (
          <div key={m.label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
              <m.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-500">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly performance chart */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Performance (Last 12 Months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500">Month</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-500">Referrals</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-500">Conversions</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Commission</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Cost</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Net</th>
                <th className="py-2 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthly_performance.map((m) => {
                const revenue = m.conversions * 499;
                const net = revenue - m.commission - m.cost;
                return (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="py-2.5 text-gray-900 font-medium">{m.month}</td>
                    <td className="text-center text-gray-600">{m.referrals}</td>
                    <td className="text-center font-semibold text-gray-900">{m.conversions}</td>
                    <td className="text-right text-gray-600">₹{m.commission.toLocaleString("en-IN")}</td>
                    <td className="text-right text-gray-600">₹{m.cost.toLocaleString("en-IN")}</td>
                    <td className={`text-right font-semibold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {net >= 0 ? "+" : ""}₹{net.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full transition-all"
                          style={{ width: `${maxRefs > 0 ? (m.referrals / maxRefs) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent referrals */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Recent Referrals ({recent_referrals.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Source</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">Signed Up</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">Converted</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500">Commission</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent_referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                    No referrals yet for this partner.
                  </td>
                </tr>
              ) : (
                recent_referrals.map((r) => {
                  const SourceIcon = SOURCE_ICON[r.source] || UserPlus;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.full_name || "—"}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <SourceIcon className="w-3 h-3" />
                          {r.source}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {new Date(r.signed_up_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3">
                        {r.converted_at ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <ArrowUpRight className="w-3 h-3" />
                            {new Date(r.converted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">Not yet</span>
                        )}
                      </td>
                      <td className="text-right px-3 py-3 text-sm font-medium text-gray-900">
                        {r.converted_at ? `₹${r.commission_amount}` : "—"}
                      </td>
                      <td className="text-center px-3 py-3">
                        {r.commission_paid ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : r.converted_at ? (
                          <span className="text-xs text-amber-600 font-medium">Pending</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <EditPartnerModal
          partner={partner}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); loadData(); }}
        />
      )}
    </div>
  );
}


// ============================================================
// Edit Partner Modal
// ============================================================
function EditPartnerModal({ partner, onClose, onSaved }: { partner: PartnerDetail; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    partner_name: partner.partner_name,
    channel_type: partner.channel_type,
    contact_name: partner.contact_name || "",
    contact_email: partner.contact_email || "",
    contact_phone: partner.contact_phone || "",
    commission_per_signup: String(partner.commission_per_signup),
    monthly_cost: String(partner.monthly_cost),
    status: partner.status,
    notes: partner.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.partner_name.trim()) { setError("Partner name is required."); return; }
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.from("channel_partners").update({
      partner_name: form.partner_name.trim(),
      channel_type: form.channel_type,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      commission_per_signup: parseInt(form.commission_per_signup) || 0,
      monthly_cost: parseInt(form.monthly_cost) || 0,
      status: form.status,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", partner.id);

    if (updateError) { setError(updateError.message); setSaving(false); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Edit Partner</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Partner Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Channel Type</label>
              <select value={form.channel_type} onChange={(e) => setForm({ ...form, channel_type: e.target.value })} className="input-field">
                {["CA", "INSURANCE", "INVESTMENT", "BANK", "WEALTH_MANAGER", "FINTECH", "OTHER"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Person</label>
              <input type="text" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Email</label>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Phone</label>
              <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Commission (₹)</label>
              <input type="number" value={form.commission_per_signup} onChange={(e) => setForm({ ...form, commission_per_signup: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Retainer (₹)</label>
              <input type="number" value={form.monthly_cost} onChange={(e) => setForm({ ...form, monthly_cost: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
