-- Migration: add relation_other column to nominees and trusted_contacts
-- Stores free-text description when user selects "other" as the relationship type.
-- Run in Supabase SQL Editor (staging first, then production).

ALTER TABLE nominees
  ADD COLUMN IF NOT EXISTS relation_other TEXT;

ALTER TABLE trusted_contacts
  ADD COLUMN IF NOT EXISTS relation_other TEXT;
