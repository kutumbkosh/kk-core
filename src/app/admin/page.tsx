"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Crown,
  TrendingUp,
  IndianRupee,
  UserMinus,
  Activity,
  FileText,
  UserCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Loader2,
} from "lucide-react";

interface Metrics {
  total_users: number;
  total_assets: number;
  total_nominees: number;
  signups_today: number;
  signups_this_week: number;
  signups_this_month: number;
  free_users: number;
  pro_users: number;
  paid_monthly: number;
  paid_annual: number;
  total_revenue: number;
  mrr: number;
  cancelled_total: number;
  cancelled_this_month: number;
  expired_total: number;
  users_with_assets: number;
  users_with_nominees: number;
  users_with_emergency: number;
  avg_assets_per_user: number;
  avg_nominees_per_user: number;
  onboarding_completed: number;
  onboarding_pending: number;
}

interface ChurnMetrics {
  active_paid_start_of_month: number;
  churned_this_month: number;
  churn_rate: number;
  cancelled_total: number;
  expired_total: number;
}

interface DailySignup {
  date: string;
  signups: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  new_subs: number;
}

interface AssetBreakdown {
  asset_type: string;
  count: number;
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  BANK_ACCOUNT: "Bank Accounts",
  FIXED_DEPOSIT: "Fixed Deposits",
  MUTUAL_FUND: "Mutual Funds",
  INSURANCE: "Insurance",
  DEMAT: "Demat / Stocks",
  EPF: "EPF",
  PPF_NPS: "PPF / NPS",
  LOAN: "Loans",
  CREDIT_CARD: "Credit Cards",
  LOCKER: "Lockers",
  REAL_ESTATE: "Real Estate",
};

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
  trend,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  trend?: "up" | "down" | null;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "gray";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend === "up" && <ArrowUpRight className="w-4 h-4 text-green-500" />}
        {trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ data, maxVal }: { data: DailySignup[]; maxVal: number }) {
  const last14 = data.slice(-14);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {last14.map((d) => (
        <div
          key={d.date}
          className="flex-1 bg-blue-400 rounded-t-sm min-h-[2px] transition-all"
          style={{ height: `${maxVal > 0 ? (d.signups / maxVal) * 100 : 0}%` }}
          title={`${d.date}: ${d.signups} signups`}
        />
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [churn, setChurn] = useState<ChurnMetrics | null>(null);
  const [dailySignups, setDailySignups] = useState<DailySignup[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [assetBreakdown, setAssetBreakdown] = useState<AssetBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [metricsRes, churnRes, signupsRes, revenueRes, assetsRes] = await Promise.all([
      supabase.rpc("admin_overview_metrics"),
      supabase.rpc("admin_churn_metrics"),
      supabase.rpc("admin_daily_signups", { days_back: 30 }),
      supabase.rpc("admin_monthly_revenue", { months_back: 12 }),
      supabase.rpc("admin_asset_breakdown"),
    ]);

    if (metricsRes.data) setMetrics(metricsRes.data);
    if (churnRes.data) setChurn(churnRes.data);
    if (signupsRes.data) setDailySignups(signupsRes.data);
    if (revenueRes.data) setMonthlyRevenue(revenueRes.data);
    if (assetsRes.data) setAssetBreakdown(assetsRes.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Failed to load admin metrics. Make sure the admin SQL functions are deployed.</p>
      </div>
    );
  }

  const conversionRate = metrics.total_users > 0
    ? (metrics.pro_users / metrics.total_users * 100).toFixed(1)
    : "0.0";

  const maxSignup = Math.max(...dailySignups.map((d) => d.signups), 1);
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue), 1);
  const totalAssets = assetBreakdown.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time business metrics for KutumbKosh</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Row 1: Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={metrics.total_users.toLocaleString("en-IN")} icon={Users} sub={`+${metrics.signups_today} today`} color="blue" />
        <MetricCard label="Paid Users" value={metrics.pro_users.toLocaleString("en-IN")} icon={Crown} sub={`${conversionRate}% conversion`} color="amber" />
        <MetricCard
          label="MRR"
          value={`₹${metrics.mrr.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          sub={`ARR: ₹${(metrics.mrr * 12).toLocaleString("en-IN")}`}
          color="green"
        />
        <MetricCard
          label="Churn Rate"
          value={churn ? `${churn.churn_rate}%` : "0%"}
          icon={UserMinus}
          sub={churn ? `${churn.churned_this_month} this month` : ""}
          color="red"
          trend={churn && churn.churn_rate > 5 ? "down" : null}
        />
      </div>

      {/* Row 2: Signup trend + Revenue */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Signups chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Daily Signups</h3>
              <p className="text-xs text-gray-400">Last 14 days</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{metrics.signups_this_month}</p>
              <p className="text-xs text-gray-400">this month</p>
            </div>
          </div>
          <MiniBar data={dailySignups} maxVal={maxSignup} />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">{dailySignups.slice(-14)[0]?.date?.slice(5)}</span>
            <span className="text-[10px] text-gray-400">Today</span>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Monthly Revenue</h3>
              <p className="text-xs text-gray-400">Last 12 months</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">₹{metrics.total_revenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-400">lifetime</p>
            </div>
          </div>
          <div className="flex items-end gap-1 h-16">
            {monthlyRevenue.slice(-12).map((d) => (
              <div
                key={d.month}
                className="flex-1 bg-green-400 rounded-t-sm min-h-[2px] transition-all"
                style={{ height: `${maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0}%` }}
                title={`${d.month}: ₹${d.revenue.toLocaleString("en-IN")}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">{monthlyRevenue.slice(-12)[0]?.month}</span>
            <span className="text-[10px] text-gray-400">{monthlyRevenue[monthlyRevenue.length - 1]?.month}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Subscription breakdown + Asset breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Subscription breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-gray-400" />
            Subscription Plans
          </h3>
          <div className="space-y-3">
            {[
              { label: "Free", count: metrics.free_users, color: "bg-gray-300" },
              { label: "Pro", count: metrics.pro_users, color: "bg-blue-500" },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{p.label}</span>
                  <span className="text-xs font-semibold text-gray-900">{p.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all`}
                    style={{ width: `${metrics.total_users > 0 ? (p.count / metrics.total_users) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Monthly billing</span>
              <span className="text-xs font-semibold">{metrics.paid_monthly}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Annual billing</span>
              <span className="text-xs font-semibold">{metrics.paid_annual}</span>
            </div>
          </div>
        </div>

        {/* Asset breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-gray-400" />
            Asset Types
          </h3>
          <div className="space-y-2">
            {assetBreakdown.slice(0, 6).map((a) => (
              <div key={a.asset_type}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600">{ASSET_TYPE_LABELS[a.asset_type] || a.asset_type}</span>
                  <span className="text-xs font-semibold text-gray-900">{a.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-vault-accent rounded-full transition-all"
                    style={{ width: `${totalAssets > 0 ? (a.count / totalAssets) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total assets</span>
              <span className="text-xs font-semibold">{totalAssets}</span>
            </div>
          </div>
        </div>

        {/* Engagement metrics */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-gray-400" />
            Engagement
          </h3>
          <div className="space-y-3">
            {[
              { label: "Completed onboarding", value: metrics.onboarding_completed, total: metrics.total_users },
              { label: "Has assets", value: metrics.users_with_assets, total: metrics.total_users },
              { label: "Has nominees", value: metrics.users_with_nominees, total: metrics.total_users },
              { label: "Has emergency plan", value: metrics.users_with_emergency, total: metrics.total_users },
            ].map((e) => {
              const pct = e.total > 0 ? ((e.value / e.total) * 100).toFixed(0) : "0";
              return (
                <div key={e.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{e.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{e.value}</span>
                    <span className="text-[10px] text-gray-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Avg assets/user</span>
              <span className="text-xs font-semibold">{metrics.avg_assets_per_user || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Avg nominees/user</span>
              <span className="text-xs font-semibold">{metrics.avg_nominees_per_user || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Signups This Week" value={metrics.signups_this_week} icon={Calendar} color="purple" />
        <MetricCard label="Total Assets" value={metrics.total_assets.toLocaleString("en-IN")} icon={FileText} color="blue" />
        <MetricCard label="Total Nominees" value={metrics.total_nominees.toLocaleString("en-IN")} icon={UserCheck} color="green" />
        <MetricCard
          label="Lifetime Revenue"
          value={`₹${metrics.total_revenue.toLocaleString("en-IN")}`}
          icon={Wallet}
          color="amber"
        />
      </div>
    </div>
  );
}
