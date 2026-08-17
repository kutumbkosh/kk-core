"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Nominee, Asset, AssetNomineeMapping } from "@/types/database";
import { ASSET_TYPE_CONFIG } from "@/types/database";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  Shield,
  AlertTriangle,
  Users,
} from "lucide-react";
import NomineesIllustration from "@/components/illustrations/NomineesIllustration";

export default function NomineesPage() {
  const router = useRouter();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [mappings, setMappings] = useState<AssetNomineeMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }

    const [nomineesRes, assetsRes] = await Promise.all([
      supabase.from("nominees").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("assets").select("*").eq("user_id", user.id),
    ]);

    const userAssetIds = (assetsRes.data || []).map((a) => a.id);
    const mappingsRes = userAssetIds.length > 0
      ? await supabase.from("asset_nominee_mappings").select("*").in("asset_id", userAssetIds)
      : { data: [] };

    setNominees(nomineesRes.data || []);
    setAssets(assetsRes.data || []);
    setMappings(mappingsRes.data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  // Calculate stats
  const totalAssets = assets.length;
  const assetsWithNominee = new Set(mappings.map((m) => m.asset_id)).size;
  const assetsWithoutNominee = totalAssets - assetsWithNominee;

  // Get linked assets for each nominee
  const getNomineeAssets = (nomineeId: string) => {
    const assetIds = mappings.filter((m) => m.nominee_id === nomineeId).map((m) => m.asset_id);
    return assets.filter((a) => assetIds.includes(a.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-vault-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading nominees...</p>
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
            <h1 className="text-lg font-bold text-gray-900">Nominees</h1>
            <p className="text-sm text-gray-500">People who matter most to you</p>
          </div>
          <button onClick={() => router.push("/dashboard/nominees/add")} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> Add Nominee
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6">
        {/* Nominee vs trusted contact explainer */}
        <div className="card flex items-start gap-4 p-5 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">
              What&apos;s the difference between a nominee and a trusted contact?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              A nominee is the person who legally inherits a specific asset — registered directly
              with your bank, insurer, or fund. A trusted contact is someone who can see your
              full vault summary if you&apos;re ever unreachable, so they know exactly what exists
              and who to contact. They cannot claim any assets — only view the summary.
              These can be the same person, or entirely different people.
            </p>
          </div>
        </div>

        {/* Coverage alert */}
        {assetsWithoutNominee > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {assetsWithoutNominee} of {totalAssets} assets don&apos;t have a nominee yet
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Link nominees to all your assets so your family can claim them.
              </p>
            </div>
          </div>
        )}

        {nominees.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-40 h-40 mx-auto mb-6 opacity-80">
              <NomineesIllustration />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No nominees added yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Add the people you trust — your spouse, children, parents, or siblings. You can then link them to your assets so they know exactly what belongs to them.
            </p>
            <button onClick={() => router.push("/dashboard/nominees/add")} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add your first nominee
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {nominees.map((nominee) => {
              const linkedAssets = getNomineeAssets(nominee.id);
              const totalShare = mappings
                .filter((m) => m.nominee_id === nominee.id)
                .reduce((sum, m) => sum + (m.share_percentage || 0), 0);

              return (
                <div
                  key={nominee.id}
                  onClick={() => router.push(`/dashboard/nominees/${nominee.id}`)}
                  className="card hover:border-gray-200 cursor-pointer transition-all p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-700 flex-shrink-0">
                      {nominee.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{nominee.full_name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {nominee.relation}
                        </span>
                      </div>

                      {nominee.contact_number && (
                        <p className="text-sm text-gray-500 mt-0.5">{nominee.contact_number}</p>
                      )}

                      {/* Linked assets summary */}
                      {linkedAssets.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {linkedAssets.slice(0, 4).map((asset) => {
                            const config = ASSET_TYPE_CONFIG[asset.asset_type];
                            return (
                              <span key={asset.id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                                <Shield className="w-3 h-3" />
                                {asset.institution_name}
                              </span>
                            );
                          })}
                          {linkedAssets.length > 4 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{linkedAssets.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">No assets linked yet</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Helpful note */}
        {nominees.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-700 font-medium">
              Tap on a nominee to link them to your assets and set their share percentage.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Linking ensures your family knows exactly which assets they&apos;re entitled to.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
