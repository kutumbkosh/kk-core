-- KutumbKosh — B2B Channel Partner Management
-- Run this in your Supabase SQL Editor
-- Tracks channel partners, referrals, conversions, costs, and performance

-- ============================================================
-- 1. CHANNEL PARTNERS (CAs, insurance cos, investment firms, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.channel_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN (
    'CA', 'INSURANCE', 'INVESTMENT', 'BANK', 'WEALTH_MANAGER', 'FINTECH', 'OTHER'
  )),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  referral_code TEXT NOT NULL UNIQUE,        -- e.g. "CA-MEHTA-2026"
  referral_link TEXT NOT NULL UNIQUE,         -- e.g. "https://kutumbkosh.in/?ref=CA-MEHTA-2026"
  commission_per_signup INTEGER DEFAULT 0,    -- flat fee in INR per converted (paid) user
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'TERMINATED')),
  monthly_cost INTEGER DEFAULT 0,             -- fixed monthly cost / retainer for this partner
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed — admin-only table, accessed via SECURITY DEFINER functions
ALTER TABLE public.channel_partners ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_channel_partners_code ON public.channel_partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_channel_partners_type ON public.channel_partners(channel_type);


-- ============================================================
-- 2. REFERRAL TRACKING (every signup that comes through a partner)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.channel_partners(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE, -- one referral per user
  referral_code TEXT NOT NULL,               -- the code used at signup
  source TEXT DEFAULT 'LINK' CHECK (source IN ('LINK', 'CODE', 'MANUAL')),
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,                  -- when user upgraded to Pro
  commission_paid BOOLEAN DEFAULT FALSE,
  commission_amount INTEGER DEFAULT 0,       -- amount owed/paid for this referral
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can mark own referral as converted"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_referrals_partner ON public.referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);


-- ============================================================
-- 3. CHANNEL COSTS (monthly cost log per partner)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.channel_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.channel_partners(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,                        -- e.g. "2026-04"
  cost_type TEXT NOT NULL CHECK (cost_type IN ('RETAINER', 'COMMISSION', 'MARKETING', 'OTHER')),
  amount INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, month, cost_type)
);

ALTER TABLE public.channel_costs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_channel_costs_partner ON public.channel_costs(partner_id);


-- ============================================================
-- 4. ADMIN FUNCTIONS FOR CHANNEL ANALYTICS
-- ============================================================

-- 4a. Channel overview — summary stats for all partners
CREATE OR REPLACE FUNCTION public.admin_channel_overview()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_partners', (SELECT COUNT(*) FROM public.channel_partners),
    'active_partners', (SELECT COUNT(*) FROM public.channel_partners WHERE status = 'ACTIVE'),
    'total_referrals', (SELECT COUNT(*) FROM public.referrals),
    'total_conversions', (SELECT COUNT(*) FROM public.referrals WHERE converted_at IS NOT NULL),
    'conversion_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE converted_at IS NOT NULL))::numeric / COUNT(*) * 100, 1)
        ELSE 0
      END
      FROM public.referrals
    ),
    'total_commission_owed', (SELECT COALESCE(SUM(commission_amount), 0) FROM public.referrals WHERE converted_at IS NOT NULL AND NOT commission_paid),
    'total_commission_paid', (SELECT COALESCE(SUM(commission_amount), 0) FROM public.referrals WHERE commission_paid),
    'total_channel_costs', (SELECT COALESCE(SUM(amount), 0) FROM public.channel_costs),
    'referrals_this_month', (SELECT COUNT(*) FROM public.referrals WHERE signed_up_at >= date_trunc('month', CURRENT_DATE)),
    'conversions_this_month', (SELECT COUNT(*) FROM public.referrals WHERE converted_at >= date_trunc('month', CURRENT_DATE))
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4b. Partner list with stats
CREATE OR REPLACE FUNCTION public.admin_channel_partner_list()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    SELECT
      cp.id,
      cp.partner_name,
      cp.channel_type,
      cp.contact_name,
      cp.contact_email,
      cp.referral_code,
      cp.commission_per_signup,
      cp.status,
      cp.monthly_cost,
      cp.created_at,
      COALESCE(r.total_referrals, 0) AS total_referrals,
      COALESCE(r.total_conversions, 0) AS total_conversions,
      CASE WHEN COALESCE(r.total_referrals, 0) > 0
        THEN ROUND(COALESCE(r.total_conversions, 0)::numeric / r.total_referrals * 100, 1)
        ELSE 0
      END AS conversion_rate,
      COALESCE(r.commission_owed, 0) AS commission_owed,
      COALESCE(c.total_cost, 0) AS total_cost,
      -- Revenue from this channel (conversions × ₹499)
      COALESCE(r.total_conversions, 0) * 499 AS revenue_generated,
      -- ROI: (revenue - costs) / costs × 100
      CASE WHEN COALESCE(c.total_cost, 0) + COALESCE(r.commission_owed, 0) > 0
        THEN ROUND(
          ((COALESCE(r.total_conversions, 0) * 499) - COALESCE(c.total_cost, 0) - COALESCE(r.commission_owed, 0))::numeric
          / (COALESCE(c.total_cost, 0) + COALESCE(r.commission_owed, 0)) * 100, 1
        )
        ELSE 0
      END AS roi_percent
    FROM public.channel_partners cp
    LEFT JOIN (
      SELECT
        partner_id,
        COUNT(*) AS total_referrals,
        COUNT(*) FILTER (WHERE converted_at IS NOT NULL) AS total_conversions,
        COALESCE(SUM(commission_amount) FILTER (WHERE converted_at IS NOT NULL AND NOT commission_paid), 0) AS commission_owed
      FROM public.referrals
      GROUP BY partner_id
    ) r ON r.partner_id = cp.id
    LEFT JOIN (
      SELECT partner_id, SUM(amount) AS total_cost
      FROM public.channel_costs
      GROUP BY partner_id
    ) c ON c.partner_id = cp.id
    ORDER BY COALESCE(r.total_conversions, 0) DESC, cp.created_at DESC
  ) t;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4c. Single partner detail with monthly breakdown
CREATE OR REPLACE FUNCTION public.admin_channel_partner_detail(p_partner_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'partner', (
      SELECT row_to_json(cp) FROM public.channel_partners cp WHERE cp.id = p_partner_id
    ),
    'monthly_performance', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          to_char(d, 'YYYY-MM') AS month,
          COALESCE(COUNT(r.id), 0) AS referrals,
          COALESCE(COUNT(r.id) FILTER (WHERE r.converted_at IS NOT NULL), 0) AS conversions,
          COALESCE(SUM(r.commission_amount) FILTER (WHERE r.converted_at IS NOT NULL), 0) AS commission,
          COALESCE((SELECT SUM(cc.amount) FROM public.channel_costs cc WHERE cc.partner_id = p_partner_id AND cc.month = to_char(d, 'YYYY-MM')), 0) AS cost
        FROM generate_series(
          date_trunc('month', CURRENT_DATE - interval '11 months'),
          date_trunc('month', CURRENT_DATE),
          '1 month'
        ) d
        LEFT JOIN public.referrals r ON r.partner_id = p_partner_id AND date_trunc('month', r.signed_up_at) = d
        GROUP BY d
        ORDER BY d
      ) t
    ), '[]'::json),
    'recent_referrals', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          r.id,
          p.full_name,
          p.email,
          r.source,
          r.signed_up_at,
          r.converted_at,
          r.commission_amount,
          r.commission_paid
        FROM public.referrals r
        LEFT JOIN public.profiles p ON p.id = r.user_id
        WHERE r.partner_id = p_partner_id
        ORDER BY r.signed_up_at DESC
        LIMIT 50
      ) t
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4d. Channel type performance comparison
CREATE OR REPLACE FUNCTION public.admin_channel_type_performance()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    SELECT
      cp.channel_type,
      COUNT(DISTINCT cp.id) AS partner_count,
      COALESCE(SUM(r.refs), 0) AS total_referrals,
      COALESCE(SUM(r.convs), 0) AS total_conversions,
      CASE WHEN COALESCE(SUM(r.refs), 0) > 0
        THEN ROUND(COALESCE(SUM(r.convs), 0)::numeric / SUM(r.refs) * 100, 1)
        ELSE 0
      END AS conversion_rate,
      COALESCE(SUM(r.convs), 0) * 499 AS revenue,
      COALESCE(SUM(c.cost), 0) + COALESCE(SUM(r.comm), 0) AS total_cost,
      CASE WHEN COALESCE(SUM(c.cost), 0) + COALESCE(SUM(r.comm), 0) > 0
        THEN ROUND(COALESCE(SUM(r.convs), 0)::numeric * 499 / (SUM(c.cost) + SUM(r.comm)), 1)
        ELSE 0
      END AS cost_per_acquisition
    FROM public.channel_partners cp
    LEFT JOIN (
      SELECT partner_id, COUNT(*) AS refs, COUNT(*) FILTER (WHERE converted_at IS NOT NULL) AS convs,
        COALESCE(SUM(commission_amount) FILTER (WHERE converted_at IS NOT NULL), 0) AS comm
      FROM public.referrals GROUP BY partner_id
    ) r ON r.partner_id = cp.id
    LEFT JOIN (
      SELECT partner_id, SUM(amount) AS cost FROM public.channel_costs GROUP BY partner_id
    ) c ON c.partner_id = cp.id
    GROUP BY cp.channel_type
    ORDER BY total_conversions DESC
  ) t;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
