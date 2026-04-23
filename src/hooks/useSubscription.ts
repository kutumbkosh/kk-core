"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanType, Subscription } from "@/types/database";
import { PLAN_LIMITS } from "@/types/database";

interface SubscriptionState {
  plan: PlanType;
  subscription: Subscription | null;
  loading: boolean;
  isPro: boolean;
  limits: typeof PLAN_LIMITS.FREE;
  canUseFeature: (feature: string) => boolean;
  isAtAssetLimit: (currentCount: number) => boolean;
  isAtNomineeLimit: (currentCount: number) => boolean;
  daysRemaining: number | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["ACTIVE", "CANCELLED"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSubscription(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadSubscription(); }, [loadSubscription]);

  // A cancelled subscription still counts as Pro until the billing period ends
  const isWithinBillingPeriod = subscription?.current_period_end
    ? new Date(subscription.current_period_end).getTime() > Date.now()
    : false;

  const isEffectivelyPro =
    subscription?.plan === "PRO" &&
    (subscription.status === "ACTIVE" || (subscription.status === "CANCELLED" && isWithinBillingPeriod));

  const plan: PlanType = isEffectivelyPro ? "PRO" : "FREE";
  const limits = PLAN_LIMITS[plan];

  const canUseFeature = (feature: string) => limits.features.includes(feature);
  const isAtAssetLimit = (currentCount: number) => currentCount >= limits.maxAssets;
  const isAtNomineeLimit = (currentCount: number) => currentCount >= limits.maxNominees;

  const daysRemaining = subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    plan,
    subscription,
    loading,
    isPro: isEffectivelyPro,
    limits,
    canUseFeature,
    isAtAssetLimit,
    isAtNomineeLimit,
    daysRemaining,
    refresh: loadSubscription,
  };
}
