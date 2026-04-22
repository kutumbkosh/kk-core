"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Asset, Nominee, AssetNomineeMapping } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import {
  ArrowLeft,
  Bell,
  Shield,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
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
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark, PiggyBank, TrendingUp, Shield, BarChart3,
  Building2, Wallet, HandCoins, CreditCard, Lock, Home,
};

interface Reminder {
  id: string;
  type: "nominee_gap" | "draft_asset" | "insurance_expiry" | "fd_maturity" | "review_nudge";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  assetId?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

export default function RemindersPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [mappings, setMappings] = useState<AssetNomineeMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [assetsRes, nomineesRes, mappingsRes] = await Promise.all([
      supabase.from("assets").select("*").eq("user_id", user.id),
      supabase.from("nominees").select("*").eq("user_id", user.id),
      supabase.from("asset_nominee_mappings").select("*"),
    ]);

    setAssets(assetsRes.data || []);
    setNominees(nomineesRes.data || []);
    setMappings(mappingsRes.data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  // Generate reminders from data
  const reminders: Reminder[] = [];

  // 1. Assets without nominees
  const assetsWithNominee = new Set(mappings.map(m => m.asset_id));
  assets.filter(a => !a.is_draft && !assetsWithNominee.has(a.id)).forEach(asset => {
    const config = ASSET_TYPE_CONFIG[asset.asset_type];
    reminders.push({
      id: `nominee-gap-${asset.id}`,
      type: "nominee_gap",
      severity: "high",
      title: `${asset.institution_name} has no nominee`,
      description: `Your ${config?.label.toLowerCase()} doesn't have a nominee linked. Your family won't know about this asset.`,
      actionLabel: "Link nominee",
      actionHref: `/dashboard/assets/${asset.id}`,
      assetId: asset.id,
      icon: AlertTriangle,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
    });
  });

  // 2. Draft assets
  assets.filter(a => a.is_draft).forEach(asset => {
    reminders.push({
      id: `draft-${asset.id}`,
      type: "draft_asset",
      severity: "medium",
      title: `Complete "${asset.institution_name}"`,
      description: "This asset is saved as a draft. Complete the details so it's included in your vault summary.",
      actionLabel: "Complete",
      actionHref: `/dashboard/assets/${asset.id}`,
      assetId: asset.id,
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    });
  });

  // 3. Insurance expiry reminders
  assets.filter(a => a.asset_type === "INSURANCE").forEach(asset => {
    const meta = asset.metadata as Record<string, string>;
    if (meta?.expiry_date) {
      const expiry = new Date(meta.expiry_date);
      const now = new Date();
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 90) {
        reminders.push({
          id: `insurance-expiry-${asset.id}`,
          type: "insurance_expiry",
          severity: daysUntil <= 30 ? "high" : "medium",
          title: `${asset.institution_name} policy expires in ${daysUntil} days`,
          description: `Your insurance policy expires on ${expiry.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Renew it to maintain coverage.`,
          actionLabel: "View policy",
          actionHref: `/dashboard/assets/${asset.id}`,
          icon: Calendar,
          iconColor: daysUntil <= 30 ? "text-red-600" : "text-amber-600",
          iconBg: daysUntil <= 30 ? "bg-red-50" : "bg-amber-50",
        });
      }
    }
  });

  // 4. FD maturity reminders
  assets.filter(a => a.asset_type === "FIXED_DEPOSIT").forEach(asset => {
    const meta = asset.metadata as Record<string, string>;
    if (meta?.maturity_date) {
      const maturity = new Date(meta.maturity_date);
      const now = new Date();
      const daysUntil = Math.ceil((maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 60) {
        reminders.push({
          id: `fd-maturity-${asset.id}`,
          type: "fd_maturity",
          severity: "medium",
          title: `${asset.institution_name} FD matures in ${daysUntil} days`,
          description: `Maturity date: ${maturity.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Decide whether to renew or withdraw.`,
          actionLabel: "View FD",
          actionHref: `/dashboard/assets/${asset.id}`,
          icon: Calendar,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-50",
        });
      }
    }
  });

  // 5. General review nudge if no activity in 30+ days
  if (assets.length > 0) {
    const lastUpdated = assets.reduce((latest, a) => {
      const d = new Date(a.updated_at);
      return d > latest ? d : latest;
    }, new Date(0));
    const daysSinceUpdate = Math.ceil((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 30) {
      reminders.push({
        id: "review-nudge",
        type: "review_nudge",
        severity: "low",
        title: "Time for a vault review",
        description: `It's been ${daysSinceUpdate} days since you last updated your vault. Check if anything has changed — new accounts, closed policies, or updated nominees.`,
        actionLabel: "Review vault",
        actionHref: "/dashboard",
        icon: Clock,
        iconColor: "text-gray-500",
        iconBg: "bg-gray-100",
      });
    }
  }

  // No nominees at all
  if (nominees.length === 0 && assets.length > 0) {
    reminders.push({
      id: "no-nominees",
      type: "nominee_gap",
      severity: "high",
      title: "You haven't added any nominees",
      description: "Add your spouse, children, or parents as nominees so they know what assets they're entitled to.",
      actionLabel: "Add nominee",
      actionHref: "/dashboard/nominees/add",
      icon: AlertTriangle,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
    });
  }

  // Sort: high → medium → low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  reminders.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const highCount = reminders.filter(r => r.severity === "high").length;
  const mediumCount = reminders.filter(r => r.severity === "medium").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-vault-accent rounded-full animate-spin" />
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
            <h1 className="text-lg font-bold text-gray-900">Reminders</h1>
            <p className="text-sm text-gray-500">Things that need your attention</p>
          </div>
          {reminders.length > 0 && (
            <div className="flex items-center gap-2">
              {highCount > 0 && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{highCount} urgent</span>}
              {mediumCount > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{mediumCount} pending</span>}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6">
        {reminders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">All clear</h3>
            <p className="text-sm text-gray-500">
              {assets.length === 0
                ? "Add assets to your vault and we'll start tracking reminders for you."
                : "No pending reminders. Your vault is in good shape."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`card p-4 flex items-start gap-3 cursor-pointer hover:shadow-card-hover transition-all ${
                  reminder.severity === "high" ? "border-red-200" :
                  reminder.severity === "medium" ? "border-amber-200" : ""
                }`}
                onClick={() => reminder.actionHref && router.push(reminder.actionHref)}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${reminder.iconBg}`}>
                  <reminder.icon className={`w-4.5 h-4.5 ${reminder.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{reminder.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{reminder.description}</p>
                </div>
                {reminder.actionLabel && (
                  <span className="text-xs font-semibold text-vault-accent whitespace-nowrap flex items-center gap-0.5 mt-0.5">
                    {reminder.actionLabel} <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">How reminders work:</span> We auto-detect nominee gaps, draft assets, upcoming insurance expirations,
            FD maturities, and vault review nudges based on your data. No manual setup needed.
          </p>
        </div>
      </main>
    </div>
  );
}
