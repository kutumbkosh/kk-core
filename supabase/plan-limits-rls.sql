-- KutumbKosh — Server-side plan limit enforcement via RLS
-- Run this in your Supabase SQL Editor
-- These policies prevent free users from exceeding plan limits
-- even if client-side checks are bypassed

-- ============================================================
-- Helper: Get user's active plan
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_plan(uid UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.subscriptions
     WHERE user_id = uid AND status = 'ACTIVE'
     ORDER BY created_at DESC LIMIT 1),
    'FREE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- Helper: Count user's assets
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_user_assets(uid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.assets WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- Helper: Count user's nominees
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_user_nominees(uid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.nominees WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- Drop existing permissive INSERT policies (replace with restrictive)
-- ============================================================

-- Assets: Replace the catch-all policy with separate SELECT/UPDATE/DELETE + limited INSERT
DROP POLICY IF EXISTS "Users can manage own assets" ON public.assets;

CREATE POLICY "Users can view own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON public.assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert assets within plan limits"
  ON public.assets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.get_user_plan(auth.uid()) = 'PRO'
      OR public.count_user_assets(auth.uid()) < 3
    )
  );


-- Nominees: Same pattern
DROP POLICY IF EXISTS "Users can manage own nominees" ON public.nominees;

CREATE POLICY "Users can view own nominees"
  ON public.nominees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own nominees"
  ON public.nominees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nominees"
  ON public.nominees FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert nominees within plan limits"
  ON public.nominees FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.get_user_plan(auth.uid()) = 'PRO'
      OR public.count_user_nominees(auth.uid()) < 2
    )
  );
