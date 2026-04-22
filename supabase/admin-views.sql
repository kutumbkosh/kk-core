-- KutumbKosh Admin Dashboard — Database Views & Functions
-- Run this in your Supabase SQL Editor
-- These functions use SECURITY DEFINER to bypass RLS for admin queries

-- ============================================================
-- 1. ADMIN CHECK FUNCTION
-- ============================================================
-- Admin check function.
-- IMPORTANT: Before running in production, replace the placeholder email
-- below with your actual admin email(s).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email IN (
      'admin@kutumbkosh.com'
      -- Add more admin emails as needed, e.g.:
      -- ,'another-admin@kutumbkosh.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 2. ADMIN OVERVIEW METRICS
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_overview_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_assets', (SELECT COUNT(*) FROM public.assets),
    'total_nominees', (SELECT COUNT(*) FROM public.nominees),

    -- Signups
    'signups_today', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE),
    'signups_this_week', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'signups_this_month', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= date_trunc('month', CURRENT_DATE)),

    -- Subscription breakdown
    'free_users', (SELECT COUNT(*) FROM public.subscriptions WHERE plan = 'FREE' AND status = 'ACTIVE'),
    'pro_users', (SELECT COUNT(*) FROM public.subscriptions WHERE plan = 'PRO' AND status = 'ACTIVE'),
    'paid_monthly', (SELECT COUNT(*) FROM public.subscriptions WHERE plan != 'FREE' AND billing_cycle = 'MONTHLY' AND status = 'ACTIVE'),
    'paid_annual', (SELECT COUNT(*) FROM public.subscriptions WHERE plan != 'FREE' AND billing_cycle = 'ANNUAL' AND status = 'ACTIVE'),

    -- Revenue
    'total_revenue', (SELECT COALESCE(SUM(amount_paid), 0) FROM public.subscriptions WHERE status = 'ACTIVE' AND plan != 'FREE'),
    'mrr', (
      SELECT COALESCE(SUM(
        CASE
          WHEN billing_cycle = 'MONTHLY' THEN amount_paid
          WHEN billing_cycle = 'ANNUAL' THEN ROUND(amount_paid / 12.0)
          ELSE 0
        END
      ), 0)
      FROM public.subscriptions WHERE status = 'ACTIVE' AND plan != 'FREE'
    ),

    -- Churn
    'cancelled_total', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'CANCELLED'),
    'cancelled_this_month', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'CANCELLED' AND updated_at >= date_trunc('month', CURRENT_DATE)),
    'expired_total', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'EXPIRED'),

    -- Engagement
    'users_with_assets', (SELECT COUNT(DISTINCT user_id) FROM public.assets),
    'users_with_nominees', (SELECT COUNT(DISTINCT user_id) FROM public.nominees),
    'users_with_emergency', (SELECT COUNT(DISTINCT user_id) FROM public.emergency_dossiers),
    'avg_assets_per_user', (SELECT ROUND(AVG(cnt)::numeric, 1) FROM (SELECT COUNT(*) as cnt FROM public.assets GROUP BY user_id) sub),
    'avg_nominees_per_user', (SELECT ROUND(AVG(cnt)::numeric, 1) FROM (SELECT COUNT(*) as cnt FROM public.nominees GROUP BY user_id) sub),

    -- Onboarding
    'onboarding_completed', (SELECT COUNT(*) FROM public.profiles WHERE onboarding_completed = TRUE),
    'onboarding_pending', (SELECT COUNT(*) FROM public.profiles WHERE onboarding_completed = FALSE)

  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 3. DAILY SIGNUPS (last 30 days for chart)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_daily_signups(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      d::date AS date,
      COALESCE(COUNT(p.id), 0) AS signups
    FROM generate_series(
      CURRENT_DATE - (days_back || ' days')::interval,
      CURRENT_DATE,
      '1 day'
    ) d
    LEFT JOIN public.profiles p ON p.created_at::date = d::date
    GROUP BY d::date
    ORDER BY d::date
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 4. MONTHLY REVENUE (last 12 months)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_monthly_revenue(months_back INTEGER DEFAULT 12)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      to_char(d, 'YYYY-MM') AS month,
      COALESCE(SUM(s.amount_paid), 0) AS revenue,
      COALESCE(COUNT(s.id), 0) AS new_subs
    FROM generate_series(
      date_trunc('month', CURRENT_DATE - (months_back || ' months')::interval),
      date_trunc('month', CURRENT_DATE),
      '1 month'
    ) d
    LEFT JOIN public.subscriptions s
      ON date_trunc('month', s.created_at) = d
      AND s.plan != 'FREE'
    GROUP BY d
    ORDER BY d
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 5. USER LIST (for user management)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_user_list(
  search_query TEXT DEFAULT '',
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  plan_filter TEXT DEFAULT 'ALL'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  offset_val INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  offset_val := (page_num - 1) * page_size;

  SELECT COUNT(*) INTO total_count
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id AND s.status = 'ACTIVE'
  WHERE (search_query = '' OR p.full_name ILIKE '%' || search_query || '%' OR p.email ILIKE '%' || search_query || '%')
    AND (plan_filter = 'ALL' OR COALESCE(s.plan, 'FREE') = plan_filter);

  SELECT json_build_object(
    'total', total_count,
    'page', page_num,
    'page_size', page_size,
    'users', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          p.id,
          p.full_name,
          p.email,
          p.phone,
          p.onboarding_completed,
          p.created_at AS signup_date,
          COALESCE(s.plan, 'FREE') AS plan,
          COALESCE(s.status, 'ACTIVE') AS sub_status,
          COALESCE(s.billing_cycle, 'NONE') AS billing_cycle,
          s.amount_paid,
          s.current_period_end,
          (SELECT COUNT(*) FROM public.assets a WHERE a.user_id = p.id) AS asset_count,
          (SELECT COUNT(*) FROM public.nominees n WHERE n.user_id = p.id) AS nominee_count,
          (SELECT MAX(created_at) FROM public.audit_logs al WHERE al.user_id = p.id) AS last_active
        FROM public.profiles p
        LEFT JOIN public.subscriptions s ON s.user_id = p.id AND s.status = 'ACTIVE'
        WHERE (search_query = '' OR p.full_name ILIKE '%' || search_query || '%' OR p.email ILIKE '%' || search_query || '%')
          AND (plan_filter = 'ALL' OR COALESCE(s.plan, 'FREE') = plan_filter)
        ORDER BY p.created_at DESC
        LIMIT page_size OFFSET offset_val
      ) t
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 6. ASSET TYPE BREAKDOWN
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_asset_breakdown()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT asset_type, COUNT(*) AS count
    FROM public.assets
    GROUP BY asset_type
    ORDER BY count DESC
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 7. CHURN RATE CALCULATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_churn_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
  active_start INTEGER;
  churned INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Users who were paid at start of month
  SELECT COUNT(*) INTO active_start
  FROM public.subscriptions
  WHERE plan != 'FREE'
    AND created_at < date_trunc('month', CURRENT_DATE)
    AND (status = 'ACTIVE' OR (status IN ('CANCELLED', 'EXPIRED') AND updated_at >= date_trunc('month', CURRENT_DATE)));

  -- Users who cancelled/expired this month
  SELECT COUNT(*) INTO churned
  FROM public.subscriptions
  WHERE plan != 'FREE'
    AND status IN ('CANCELLED', 'EXPIRED')
    AND updated_at >= date_trunc('month', CURRENT_DATE);

  SELECT json_build_object(
    'active_paid_start_of_month', active_start,
    'churned_this_month', churned,
    'churn_rate', CASE WHEN active_start > 0 THEN ROUND((churned::numeric / active_start) * 100, 1) ELSE 0 END,
    'cancelled_total', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'CANCELLED'),
    'expired_total', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'EXPIRED')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
