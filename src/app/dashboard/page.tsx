"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { isAdminEmail } from "@/lib/admin";
import {
  Shield,
  Plus,
  Users,
  FileText,
  Crown,
  AlertTriangle,
  Landmark,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Building2,
  Wallet,
  CreditCard,
  Lock,
  Home,
  HandCoins,
  LogOut,
  ChevronRight,
  Bell,
  Settings,
  Download,
  Hash,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import type { UserProfile, Asset, Nominee, TrustedContact } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import EmptyStateIllustration from "@/components/illustrations/EmptyStateIllustration";

const RELATION_LABELS: Record<string, string> = {
  spouse: "Spouse", child: "Child", parent: "Parent", sibling: "Sibling",
  grandchild: "Grandchild", grandparent: "Grandparent", in_law: "In-Law", other: "Other",
};

const ACCESS_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", ACTIVE: "Active", REVOKED: "Revoked",
};

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Landmark, PiggyBank, TrendingUp, Shield, BarChart3,
  Building2, Wallet, HandCoins, CreditCard, Lock, Home,
};

export default function DashboardPage() {
  const router = useRouter();
  const { isPro, plan, subscription, daysRemaining, limits } = useSubscription();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [mappings, setMappings] = useState<Array<{ asset_id: string; nominee_id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [kkIdCopied, setKkIdCopied] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    const [profileRes, assetsRes, nomineesRes, contactsRes, mappingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("assets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("nominees").select("*").eq("user_id", user.id),
      supabase.from("trusted_contacts").select("*").eq("user_id", user.id).is("deleted_at", null),
      supabase.from("asset_nominee_mappings").select("asset_id, nominee_id"),
    ]);

    setProfile(profileRes.data);
    setAssets(assetsRes.data || []);
    setNominees(nomineesRes.data || []);
    setContacts(contactsRes.data || []);
    setMappings(mappingsRes.data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleCopyKKID = () => {
    if (!profile?.kutumb_id) return;
    navigator.clipboard.writeText(profile.kutumb_id);
    setKkIdCopied(true);
    setTimeout(() => setKkIdCopied(false), 1500);
  };

  const totalAssets = assets.length;
  const assetsWithNominee = mappings.length > 0 ? new Set(mappings.map(m => m.asset_id)).size : 0;
  const nomineeCoverage = totalAssets > 0 ? Math.round((assetsWithNominee / totalAssets) * 100) : 0;
  const assetsWithoutNominee = totalAssets - assetsWithNominee;

  const assetsByType = assets.reduce((acc, asset) => {
    acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-vault-dark sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-vault-accent rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-bold text-white">KutumbKosh</h1>
            {isPro && (
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">PRO</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isAdminEmail(profile?.email) && (
              <button onClick={() => router.push("/admin")} className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-white/10 transition-colors" title="Admin Panel">
                <BarChart3 className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => router.push("/dashboard/reminders")} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Reminders">
              <Bell className="w-4 h-4" />
            </button>
            <button onClick={() => router.push("/contact")} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Help & Feedback">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button onClick={() => router.push("/dashboard/settings")} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {/* Welcome + Plan status — merged into one row */}
        {isPro ? (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-500">Your KutumbKosh overview</p>
                {profile?.kutumb_id && (
                  <button
                    onClick={handleCopyKKID}
                    className="flex items-center gap-1 text-[10px] font-mono text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy your Kutumb ID"
                  >
                    <Hash className="w-2.5 h-2.5" />
                    {profile.kutumb_id}
                    {kkIdCopied
                      ? <Check className="w-2.5 h-2.5 text-green-500" />
                      : <Copy className="w-2.5 h-2.5" />
                    }
                  </button>
                )}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-lg border border-blue-100">
              <Crown className="w-3.5 h-3.5 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Pro{subscription?.billing_cycle === "MONTHLY" ? " (Monthly)" : ""}
                </p>
                <p className="text-[10px] text-gray-500">
                  {daysRemaining !== null
                    ? `Renews in ${daysRemaining}d`
                    : "Active"}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/dashboard/subscription")} className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
              Manage
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg mb-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-500">Your KutumbKosh overview</p>
                {profile?.kutumb_id && (
                  <button
                    onClick={handleCopyKKID}
                    className="flex items-center gap-1 text-[10px] font-mono text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy your Kutumb ID"
                  >
                    <Hash className="w-2.5 h-2.5" />
                    {profile.kutumb_id}
                    {kkIdCopied
                      ? <Check className="w-2.5 h-2.5 text-green-500" />
                      : <Copy className="w-2.5 h-2.5" />
                    }
                  </button>
                )}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Free Plan</p>
                <p className="text-[10px] text-gray-500">{totalAssets}/{limits.maxAssets} assets &middot; {nominees.length}/{limits.maxNominees} nominees</p>
              </div>
            </div>
            <button onClick={() => router.push("/dashboard/pricing")} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
              <Crown className="w-3 h-3" /> Upgrade
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Assets", value: totalAssets, icon: FileText, color: "text-vault-accent", bg: "bg-blue-50" },
            { label: "Nominees", value: nominees.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Coverage", value: `${nomineeCoverage}%`, icon: Shield, color: nomineeCoverage >= 80 ? "text-emerald-600" : nomineeCoverage >= 50 ? "text-amber-600" : "text-red-500", bg: nomineeCoverage >= 80 ? "bg-emerald-50" : nomineeCoverage >= 50 ? "bg-amber-50" : "bg-red-50" },
            { label: "Contacts", value: contacts.length, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat) => (
            <div key={stat.label} className="card flex items-center gap-3 p-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nominee Gap Alert */}
        {assetsWithoutNominee > 0 && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              <span className="font-semibold">{assetsWithoutNominee} asset{assetsWithoutNominee !== 1 ? "s" : ""}</span> without a nominee — your family won&apos;t know about them.
            </p>
            <button onClick={() => router.push("/dashboard/reminders")} className="text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap">
              Review <ChevronRight className="w-3 h-3 inline" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Assets Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900">Your Assets</h3>
              <button onClick={() => router.push("/dashboard/assets/add")} className="btn-primary text-xs py-2 px-3">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Asset
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="card text-center py-10">
                <div className="w-28 h-28 mx-auto mb-4 opacity-70">
                  <EmptyStateIllustration />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Your vault is empty</h4>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
                  Start adding your bank accounts, investments, and policies.
                </p>
                <button onClick={() => router.push("/dashboard/assets/add")} className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Add your first asset
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => {
                  const config = ASSET_TYPE_CONFIG[asset.asset_type];
                  const IconComp = iconMap[config?.icon] || FileText;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
                      className="card flex items-center gap-3 hover:shadow-card-hover cursor-pointer transition-all p-3.5"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config?.color}12` }}>
                        <IconComp className="w-4.5 h-4.5" style={{ color: config?.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{asset.institution_name}</p>
                        <p className="text-xs text-gray-500">
                          {config?.label}{asset.account_identifier ? ` · ****${asset.account_identifier}` : ""}
                        </p>
                      </div>
                      {asset.approx_value_band && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {asset.approx_value_band}
                        </span>
                      )}
                      {asset.is_draft && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Asset breakdown */}
            {Object.keys(assetsByType).length > 0 && (
              <div className="card mt-4 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">By Category</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(assetsByType).map(([type, count]) => {
                    const config = ASSET_TYPE_CONFIG[type as keyof typeof ASSET_TYPE_CONFIG];
                    const IconComp = iconMap[config?.icon] || FileText;
                    return (
                      <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                        <IconComp className="w-3.5 h-3.5" style={{ color: config?.color }} />
                        <span className="text-xs text-gray-600 flex-1">{config?.label}</span>
                        <span className="text-xs font-bold text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: "Add an asset", icon: Plus, href: "/dashboard/assets/add", color: "text-vault-accent" },
                  { label: "Manage nominees", icon: Users, href: "/dashboard/nominees", color: "text-emerald-600" },
                  { label: "Emergency dossier", icon: AlertTriangle, href: "/dashboard/emergency", color: "text-orange-500" },
                  { label: "Export PDF", icon: Download, href: "/dashboard/export", color: "text-violet-600" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-sm text-gray-700 flex-1">{action.label}</span>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Upgrade CTA for free users */}
            {!isPro && (
              <button
                onClick={() => router.push("/dashboard/pricing")}
                className="card p-4 w-full text-left bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-gray-900">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Unlock unlimited assets, emergency access, PDF export & more.</p>
                <span className="text-xs font-bold text-blue-600">Just &#8377;499/year &rarr;</span>
              </button>
            )}

            {/* Nominees */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Nominees</h3>
                <button onClick={() => router.push("/dashboard/nominees")} className="text-xs text-vault-accent font-medium hover:underline">
                  Manage
                </button>
              </div>
              {nominees.length === 0 ? (
                <p className="text-xs text-gray-500">No nominees added yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {nominees.map((nominee) => (
                    <div
                      key={nominee.id}
                      onClick={() => router.push(`/dashboard/nominees/${nominee.id}`)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                        {nominee.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{nominee.full_name}</p>
                        <p className="text-xs text-gray-500">{RELATION_LABELS[nominee.relation] || nominee.relation}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trusted Contacts */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Trusted Contacts</h3>
                <button onClick={() => router.push("/dashboard/emergency")} className="text-xs text-vault-accent font-medium hover:underline">
                  Manage
                </button>
              </div>
              {contacts.length === 0 ? (
                <div className="flex flex-col items-start gap-1.5">
                  <p className="text-xs text-gray-500">No trusted contacts set up yet.</p>
                  <button
                    onClick={() => router.push("/dashboard/emergency")}
                    className="text-xs text-vault-accent font-medium hover:underline"
                  >
                    + Add a trusted contact
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2.5 p-2">
                      <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-xs font-bold text-violet-700">
                        {contact.contact_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.contact_name}</p>
                        <p className="text-xs text-gray-500">{RELATION_LABELS[contact.relation] || contact.relation}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        contact.access_status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                        contact.access_status === "REVOKED" ? "bg-red-50 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {ACCESS_STATUS_LABELS[contact.access_status] || contact.access_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
