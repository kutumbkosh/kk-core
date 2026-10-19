-- Migration: onboarding_wizard_status
-- Tracks whether a user has completed, skipped, or not yet started the
-- guided vault-setup wizard (HANDOFFS.md ID 68).
-- No RLS change needed — users already have UPDATE access to their own profiles row.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_wizard_status TEXT
    DEFAULT 'pending'
    CHECK (onboarding_wizard_status IN ('pending', 'completed', 'skipped'));
