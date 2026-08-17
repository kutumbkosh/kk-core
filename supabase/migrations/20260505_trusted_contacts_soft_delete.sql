-- ============================================================
-- Migration: Trusted Contacts Soft Delete
-- Date: 2026-05-05
-- Scope: trusted_contacts
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ============================================================

-- 1. Add deleted_at column (nullable — existing rows unaffected)
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. RLS UPDATE policy — users can soft-delete their own trusted contacts
--    (sets deleted_at = now(); hard delete is not permitted per zero-access policy)
DROP POLICY IF EXISTS "Users can soft-delete their own trusted contacts" ON public.trusted_contacts;
CREATE POLICY "Users can soft-delete their own trusted contacts"
  ON public.trusted_contacts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Index for fast exclusion of soft-deleted rows
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_deleted_at
  ON public.trusted_contacts (deleted_at)
  WHERE deleted_at IS NULL;
