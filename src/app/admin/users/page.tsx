"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Crown,
  Users as UsersIcon,
  FileText,
  UserCheck,
  Filter,
  Loader2,
  Calendar,
  Activity,
} from "lucide-react";

interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  onboarding_completed: boolean;
  signup_date: string;
  plan: string;
  sub_status: string;
  billing_cycle: string;
  amount_paid: number | null;
  current_period_end: string | null;
  asset_count: number;
  nominee_count: number;
  last_active: string | null;
}

interface UserListResponse {
  total: number;
  page: number;
  page_size: number;
  users: UserRecord[];
}

const PLAN_BADGES: Record<string, { label: string; className: string }> = {
  FREE: { label: "Free", className: "bg-gray-100 text-gray-600" },
  PRO: { label: "Pro", className: "bg-blue-100 text-blue-700" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: result } = await supabase.rpc("admin_user_list", {
      search_query: search,
      page_num: page,
      page_size: pageSize,
      plan_filter: planFilter,
    });
    if (result) setData(result);
    setLoading(false);
  }, [search, page, planFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [search, planFilter]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">
          {data ? `${data.total.toLocaleString("en-IN")} total users` : "Loading..."}
        </p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {["ALL", "FREE", "PRO"].map((f) => (
            <button
              key={f}
              onClick={() => setPlanFilter(f)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                planFilter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "ALL" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Plan</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Billing</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Assets</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Nominees</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Onboarded</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">Signed Up</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-300 mx-auto" />
                  </td>
                </tr>
              ) : data && data.users.length > 0 ? (
                data.users.map((user) => {
                  const badge = PLAN_BADGES[user.plan] || PLAN_BADGES.FREE;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{user.full_name || "—"}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
                          {user.plan !== "FREE" && <Crown className="w-3 h-3" />}
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 text-xs text-gray-500">
                        {user.billing_cycle !== "NONE" ? (
                          <span>{user.billing_cycle === "ANNUAL" ? "Annual" : "Monthly"}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                          <FileText className="w-3 h-3 text-gray-400" />
                          {user.asset_count}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                          <UsersIcon className="w-3 h-3 text-gray-400" />
                          {user.nominee_count}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        {user.onboarding_completed ? (
                          <UserCheck className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-xs text-gray-300">No</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(user.signup_date)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-gray-400" />
                          {timeAgo(user.last_active)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
