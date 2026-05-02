-- ============================================================
-- Migration: Mandatory Fields + Kutumb ID
-- Date: 2026-05-02
-- Scope: profiles, nominees, trusted_contacts
-- Safe to re-run (uses IF NOT EXISTS / DROP CONSTRAINT IF EXISTS)
-- ============================================================


-- ============================================================
-- 1. PROFILES — add mandatory field columns + kutumb_id
-- ============================================================
-- Note: existing `phone` and `dob` columns are kept for backward compat.
-- New columns mobile_number and date_of_birth are used by the updated app.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kutumb_id TEXT;

-- Unique constraint and index for Kutumb ID lookups
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_kutumb_id_unique;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_kutumb_id_unique UNIQUE (kutumb_id);

CREATE INDEX IF NOT EXISTS idx_profiles_kutumb_id
  ON public.profiles (kutumb_id);

-- NOTE: The backfill + NOT NULL at end of this script handles existing rows.


-- ============================================================
-- 2. NOMINEES — extend relation values, add email + guardian fields
-- ============================================================

-- Drop the existing narrow CHECK so we can extend it
ALTER TABLE public.nominees
  DROP CONSTRAINT IF EXISTS nominees_relation_check;

-- Add missing columns
ALTER TABLE public.nominees
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS guardian_mobile TEXT;

-- Extended relation CHECK: lowercase (new UI) + UPPERCASE (legacy backward compat)
ALTER TABLE public.nominees
  ADD CONSTRAINT nominees_relation_check
  CHECK (relation IN (
    'spouse', 'child', 'parent', 'sibling', 'grandchild', 'grandparent', 'in_law', 'other',
    'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'
  ));

-- Soft enforcement: at least one of contact_number / email must be present.
-- Enforced at app layer to avoid blocking legacy rows.


-- ============================================================
-- 3. TRUSTED CONTACTS — extend relation values, enforce contact fields
-- ============================================================

ALTER TABLE public.trusted_contacts
  DROP CONSTRAINT IF EXISTS trusted_contacts_relation_check;

-- Extended relation CHECK: lowercase (new UI) + UPPERCASE (legacy)
ALTER TABLE public.trusted_contacts
  ADD CONSTRAINT trusted_contacts_relation_check
  CHECK (relation IN (
    'spouse', 'child', 'parent', 'sibling', 'grandchild', 'grandparent',
    'in_law', 'friend', 'colleague', 'other',
    'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'FRIEND', 'COLLEAGUE', 'OTHER'
  ));

-- Both contact_phone and contact_email are mandatory for trusted contacts.
-- Coerce any existing NULLs to empty string before enforcing NOT NULL.
UPDATE public.trusted_contacts SET contact_phone = '' WHERE contact_phone IS NULL;
UPDATE public.trusted_contacts SET contact_email = '' WHERE contact_email IS NULL;

ALTER TABLE public.trusted_contacts
  ALTER COLUMN contact_phone SET NOT NULL,
  ALTER COLUMN contact_email SET NOT NULL;


-- ============================================================
-- 4. generate_kutumb_id() — reusable function
-- ============================================================
-- Charset excludes 0, 1, O, I to prevent visual ambiguity.
-- Format: KK-XXXXXX where X is from ABCDEFGHJKLMNPQRSTUVWXYZ23456789
-- Keyspace: 32^6 = 1,073,741,824 unique IDs

CREATE OR REPLACE FUNCTION public.generate_kutumb_id()
RETURNS TEXT AS $$
DECLARE
  charset TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate TEXT;
  i INT;
  attempt INT := 0;
BEGIN
  LOOP
    candidate := 'KK-';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(charset, floor(random() * length(charset) + 1)::INT, 1);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE kutumb_id = candidate) THEN
      RETURN candidate;
    END IF;

    attempt := attempt + 1;
    IF attempt > 10 THEN
      RAISE EXCEPTION 'Could not generate a unique Kutumb ID after 10 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 5. handle_new_user — updated to assign kutumb_id at signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, kutumb_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    public.generate_kutumb_id()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 6. Backfill — assign Kutumb IDs to all existing users
-- ============================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.profiles WHERE kutumb_id IS NULL LOOP
    UPDATE public.profiles
    SET kutumb_id = public.generate_kutumb_id()
    WHERE id = rec.id;
  END LOOP;
END;
$$;

-- Enforce NOT NULL after backfill ensures all rows have a value
ALTER TABLE public.profiles ALTER COLUMN kutumb_id SET NOT NULL;
