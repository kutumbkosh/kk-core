-- KutumbKosh — Razorpay Webhook Infrastructure
-- HANDOFFS.md ID 11 — Finance → Engineering
-- Run on: Staging first, then Production
-- Date: 2026-07-28

-- ============================================================
-- 1. razorpay_events — webhook event log
--    Used for: Finance reconciliation, idempotency (UNIQUE on razorpay_event_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.razorpay_events (
  id                UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_event_id TEXT    UNIQUE NOT NULL,   -- e.g. "pay_xxxxx:payment.captured" — idempotency key
  event_type        TEXT    NOT NULL,           -- e.g. "payment.captured"
  payload           JSONB   NOT NULL,           -- full raw webhook payload
  processed_at      TIMESTAMPTZ DEFAULT NOW(),
  processing_status TEXT    NOT NULL DEFAULT 'success'
                    CHECK (processing_status IN ('success', 'failed', 'skipped')),
  error_message     TEXT                        -- populated on processing_status = 'failed'
);

-- Service role only — no user-facing policies
-- Finance reads via Supabase dashboard (service role) for reconciliation
ALTER TABLE public.razorpay_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_razorpay_events_type
  ON public.razorpay_events (event_type);

CREATE INDEX IF NOT EXISTS idx_razorpay_events_processed_at
  ON public.razorpay_events (processed_at DESC);


-- ============================================================
-- 2. subscriptions — add grace period column
--    ID 11: 7-day grace period after payment.failed before downgrade
-- ============================================================
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ;


-- ============================================================
-- 3. GST invoice number sequence
--    Sequential, non-resettable. Format: KK-YYYY-NNNN (e.g. KK-2026-0001)
--    DECISIONS.md 2026-05-07 | Finance — SAC 998314
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq
  START 1
  INCREMENT 1
  NO CYCLE;

-- RPC function callable from webhook handler (service role)
CREATE OR REPLACE FUNCTION public.get_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_val BIGINT;
  year_val TEXT;
BEGIN
  SELECT nextval('public.invoice_number_seq') INTO seq_val;
  year_val := EXTRACT(YEAR FROM NOW())::TEXT;
  RETURN 'KK-' || year_val || '-' || LPAD(seq_val::TEXT, 4, '0');
END;
$$;
