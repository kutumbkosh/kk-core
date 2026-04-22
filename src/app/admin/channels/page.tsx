"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Handshake,
  Plus,
  TrendingUp,
  Users,
  IndianRupee,
  Target,
  RefreshCw,
  ChevronRight,
  Loader2,
  ArrowUpRight,
  Copy,
  Check,
  X,
  Building2,
  Briefcase,
  Shield,
  Wallet,
  Landmark,
  Cpu,
  MoreHorizontal,
} from "lucide-react";

interface OverviewMetrics {
  total_partners: number;
  active_partners: number;
  total_referrals: number;
  total_conversions: number;
  conversion_rate: number;
  total_commission_owed: number;
  total_commission_paid: number;
  total_channel_costs: number;
  referrals_this_month: number;
  conversions_this_month: number;
}

interface Partner {
  id: string;
  partner_name: string;
  channel_type: string;
  contact_name: string | null;
  contact_email: string | null;
  referral_code: string;
  commission_per_signup: number;
  status: string;
  monthly_cost: number;
  created_at: string;
  total_referrals: number;
  total_conversions: number;
  conversion_rate: number;
  commission_owed: number;
  total_cost: number;
  revenue_generated: number;
  roi_percent: number;
}

interface ChannelTypePerf {
  channel_type: string;
  partner_count: number;
  total_referrals: number;
  total_conversions: number;
  conversion_rate: number;
  revenue: number;
  total_cost: number;
  cost_per_acquisition: number;
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

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-amber-100 text-amber-700",
  TERMINATED: "bg-red-100 text-red-700",
};

export default function AdminChannelsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [channelPerf, setChannelPerf] = useState<ChannelTypePerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [overviewRes, partnersRes, perfRes] = await Promise.all([
      supabase.rpc("admin_channel_overview"),
      supabase.rpc("admin_channel_partner_list"),
      supabase.rpc("admin_channel_type_performance"),
    ]);
    if (overviewRes.data) setMetrics(overviewRes.data);
    if (partnersRes.data) setPartners(partnersRes.data);
    if (perfRes.data) setChannelPerf(perfRes.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">B2B Channels</h1>
          <p className="text-sm text-gray-500">Manage distribution partners, track referrals, and measure ROI</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-vault-accent text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Overview metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Active Partners", value: metrics.active_partners, icon: Handshake, color: "bg-blue-50 text-blue-600" },
            { label: "Total Referrals", value: metrics.total_referrals, icon: Users, color: "bg-green-50 text-green-600", sub: `+${metrics.referrals_this_month} this month` },
            { label: "Conversions", value: metrics.total_conversions, icon: Target, color: "bg-amber-50 text-amber-600", sub: `${metrics.conversion_rate}% rate` },
            { label: "Revenue from Channels", value: `₹${(metrics.total_conversions * 499).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-emerald-50 text-emerald-600" },
            { label: "Commission Owed", value: `₹${metrics.total_commission_owed.toLocaleString("en-IN")}`, icon: Wallet, color: "bg-red-50 text-red-600", sub: `₹${metrics.total_commission_paid.toLocaleString("en-IN")} paid` },
          ].map((m) => (
            <div key={m.label} className="card p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              {m.sub && <p className="text-xs text-gray-400 mt-1">{m.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Channel type performance */}
      {channelPerf.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Performance by Channel Type</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">Channel</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">Partners</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">Referrals</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">Conversions</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500">Conv. Rate</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Revenue</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {channelPerf.map((cp) => {
                  const config = CHANNEL_TYPE_CONFIG[cp.channel_type] || CHANNEL_TYPE_CONFIG.OTHER;
                  return (
                    <tr key={cp.channel_type} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${config.color}`}>
                            <config.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-gray-900">{config.label}</span>
                        </div>
                      </td>
                      <td className="text-center text-gray-600">{cp.partner_count}</td>
                      <td className="text-center text-gray-600">{cp.total_referrals}</td>
                      <td className="text-center font-semibold text-gray-900">{cp.total_conversions}</td>
                      <td className="text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cp.conversion_rate >= 20 ? "bg-green-100 text-green-700" : cp.conversion_rate >= 10 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {cp.conversion_rate}%
                        </span>
                      </td>
                      <td className="text-right font-semibold text-gray-900">₹{cp.revenue.toLocaleString("en-IN")}</td>
                      <td className="text-right text-gray-600">₹{cp.total_cost.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Partners table */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">All Partners ({partners.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Partner</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Referrals</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Conversions</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Conv. Rate</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500">Revenue</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500">ROI</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Code</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-sm text-gray-400">
                    No partners yet. Click &ldquo;Add Partner&rdquo; to get started.
                  </td>
                </tr>
              ) : (
                partners.map((p) => {
                  const config = CHANNEL_TYPE_CONFIG[p.channel_type] || CHANNEL_TYPE_CONFIG.OTHER;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/channels/${p.id}`)}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.partner_name}</p>
                        {p.contact_name && <p className="text-xs text-gray-400">{p.contact_name}</p>}
                      </td>
                      <td className="text-center px-3 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <config.icon className="w-3 h-3" />
                          {config.label.split(" ")[0]}
                        </div>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[p.status] || STATUS_BADGE.ACTIVE}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 text-gray-600">{p.total_referrals}</td>
                      <td className="text-center px-3 py-3 font-semibold text-gray-900">{p.total_conversions}</td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-xs font-semibold ${p.conversion_rate >= 20 ? "text-green-600" : p.conversion_rate >= 10 ? "text-amber-600" : "text-gray-500"}`}>
                          {p.conversion_rate}%
                        </span>
                      </td>
                      <td className="text-right px-3 py-3 font-semibold text-gray-900">₹{p.revenue_generated.toLocaleString("en-IN")}</td>
                      <td className="text-right px-3 py-3">
                        <span className={`text-xs font-bold ${p.roi_percent > 0 ? "text-green-600" : p.roi_percent < 0 ? "text-red-600" : "text-gray-400"}`}>
                          {p.roi_percent > 0 ? "+" : ""}{p.roi_percent}%
                        </span>
                      </td>
                      <td className="text-center px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => copyToClipboard(p.referral_code, p.referral_code)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-mono hover:bg-gray-200 transition-colors"
                          title="Copy referral code"
                        >
                          {copiedCode === p.referral_code ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                          {p.referral_code}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <AddPartnerModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); loadData(); }}
        />
      )}
    </div>
  );
}


// ============================================================
// Add Partner Modal
// ============================================================
function AddPartnerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    partner_name: "",
    channel_type: "CA",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    commission_per_signup: "50",
    monthly_cost: "0",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const generateCode = (name: string, type: string) => {
    const prefix = type.substring(0, 3).toUpperCase();
    const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${slug}-${rand}`;
  };

  const handleSave = async () => {
    if (!form.partner_name.trim()) {
      setError("Partner name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const code = generateCode(form.partner_name, form.channel_type);
    const baseUrl = window.location.origin;

    const supabase = createClient();
    const { error: insertError } = await supabase.from("channel_partners").insert({
      partner_name: form.partner_name.trim(),
      channel_type: form.channel_type,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      referral_code: code,
      referral_link: `${baseUrl}/?ref=${code}`,
      commission_per_signup: parseInt(form.commission_per_signup) || 0,
      monthly_cost: parseInt(form.monthly_cost) || 0,
      notes: form.notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Add Channel Partner</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Partner Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.partner_name}
              onChange={(e) => setForm({ ...form, partner_name: e.target.value })}
              placeholder="e.g., CA Raghav Mehta & Associates"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Channel Type</label>
            <select
              value={form.channel_type}
              onChange={(e) => setForm({ ...form, channel_type: e.target.value })}
              className="input-field"
            >
              {Object.entries(CHANNEL_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="Name"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="email@company.com"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Phone</label>
            <input
              type="tel"
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Commission / Signup (₹)</label>
              <input
                type="number"
                value={form.commission_per_signup}
                onChange={(e) => setForm({ ...form, commission_per_signup: e.target.value })}
                placeholder="50"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Monthly Retainer (₹)</label>
              <input
                type="number"
                value={form.monthly_cost}
                onChange={(e) => setForm({ ...form, monthly_cost: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional notes about this partnership..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Add Partner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
