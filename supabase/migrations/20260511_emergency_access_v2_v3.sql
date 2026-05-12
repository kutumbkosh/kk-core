-- ============================================================
-- Emergency Access V2 (inactivity timer) + V3 (pre-authorized)
-- DECISIONS.md 2026-05-07 | Product
-- HANDOFFS.md ID #36 (Operations DPDPA clearance, 7 conditions)
-- HANDOFFS.md ID #40 (Engineering handoff)
--
-- IMPORTANT: V2 and V3 must NOT be enabled in production until
-- Operations confirms external legal review is complete.
-- Feature flag: NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 env var.
-- ============================================================

-- Access mode for each trusted contact
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS access_mode TEXT DEFAULT 'MANUAL'
    CHECK (access_mode IN ('MANUAL', 'INACTIVITY', 'PRE_AUTHORIZED'));

-- V2: inactivity window in days (owner-selectable: 30/60/90/180)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS inactivity_days INTEGER DEFAULT 90
    CHECK (inactivity_days IN (30, 60, 90, 180));

-- V2: grace period in days before auto-grant fires (min 14 — Condition 1)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 14
    CHECK (grace_period_days IN (14, 21, 30));

-- V2: timestamp when the inactivity timer fired and grace period began
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS inactivity_trigger_fired_at TIMESTAMPTZ;

-- V2: when the grace period ends (fire + grace_period_days)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS inactivity_grace_ends_at TIMESTAMPTZ;

-- V2: consent captured at setup (Condition 3 — locked copy)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS v2_consent_at TIMESTAMPTZ;

-- V3: consent captured at setup (Condition 7 — locked copy)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS v3_consent_at TIMESTAMPTZ;

-- V3: annual re-confirmation nudge tracking (Condition 6)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS v3_last_reconfirmed_at TIMESTAMPTZ;

-- Condition 5 — S.16 cross-border compliance readiness
-- Optional field; not displayed in vault UI, internal compliance only
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS country_of_residence TEXT;

-- ============================================================
-- Emergency access audit log
-- Records all mode changes, consent captures, trigger events,
-- grace period notifications, and auto-grant events.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emergency_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trusted_contact_id UUID REFERENCES public.trusted_contacts(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'MODE_SET_V1',
    'MODE_SET_V2',
    'MODE_SET_V3',
    'V2_CONSENT_CAPTURED',
    'V3_CONSENT_CAPTURED',
    'V3_RECONFIRMED',
    'V2_TIMER_FIRED',
    'V2_GRACE_STARTED',
    'V2_GRACE_NOTIFICATION_SENT',
    'V2_AUTO_GRANTED',
    'V2_OWNER_DENIED',
    'V3_ACCESS_GRANTED',
    'ACCESS_REVOKED'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency access log"
  ON public.emergency_access_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert audit events from API routes
CREATE POLICY "Service role can insert audit events"
  ON public.emergency_access_log FOR INSERT
  WITH CHECK (true);
