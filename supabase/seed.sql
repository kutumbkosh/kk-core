-- ╔═══════════════════════════════════════════════════════════╗
-- ║         KutumbKosh — Dev / Staging Seed Data              ║
-- ║                                                          ║
-- ║  Run this AFTER schema.sql to populate test data.        ║
-- ║  DO NOT run this in production.                          ║
-- ║                                                          ║
-- ║  Note: This creates data for a test user. You need to    ║
-- ║  first sign up via the app with the email below, then    ║
-- ║  run this script replacing the user_id placeholder.      ║
-- ╚═══════════════════════════════════════════════════════════╝

-- ============================================================
-- INSTRUCTIONS:
-- 1. Sign up in the app with email: test@kutumbkosh.dev
-- 2. Go to Supabase Dashboard → Authentication → Users
-- 3. Copy the user's UUID
-- 4. Replace 'REPLACE_WITH_USER_UUID' below with that UUID
-- 5. Run this script in SQL Editor
-- ============================================================

-- Set the test user ID (replace this!)
DO $$
DECLARE
  test_user_id UUID := 'REPLACE_WITH_USER_UUID';
  asset_bank UUID;
  asset_fd UUID;
  asset_mf UUID;
  asset_insurance UUID;
  asset_epf UUID;
  nominee_spouse UUID;
  nominee_child UUID;
  nominee_parent UUID;
BEGIN

-- ─── Update profile ───────────────────────────────────────
UPDATE public.profiles SET
  full_name = 'Rahul Sharma',
  phone = '+919876543210',
  dob = '1988-06-15',
  pan_number = 'ABCDS1234F',
  onboarding_completed = true,
  updated_at = NOW()
WHERE id = test_user_id;

-- ─── Assets (5 diverse types) ─────────────────────────────
INSERT INTO public.assets (id, user_id, asset_type, institution_name, account_identifier, metadata, approx_value_band, notes, is_draft)
VALUES
  (gen_random_uuid(), test_user_id, 'BANK_ACCOUNT', 'HDFC Bank', '4321',
   '{"account_type": "savings", "branch": "Koramangala, Bengaluru"}', '5-10L',
   'Primary salary account. Net banking activated.', false),
  (gen_random_uuid(), test_user_id, 'FIXED_DEPOSIT', 'SBI', '8765',
   '{"maturity_date": "2027-03-15", "interest_rate": "7.1%"}', '10-50L',
   'Tax-saver FD. Auto-renewal enabled.', false),
  (gen_random_uuid(), test_user_id, 'MUTUAL_FUND', 'Zerodha Coin', '2109',
   '{"fund_name": "Nifty 50 Index Fund", "sip_amount": "10000", "sip_date": "5th"}', '5-10L',
   'Monthly SIP since Jan 2022.', false),
  (gen_random_uuid(), test_user_id, 'INSURANCE', 'LIC', '5678',
   '{"policy_type": "term", "sum_assured": "1 Crore", "premium_date": "2025-08-20"}', '1-5L',
   'Term plan. Premium due annually in August.', false),
  (gen_random_uuid(), test_user_id, 'EPF', 'EPFO via TCS', '3456',
   '{"uan": "1234", "employer": "TCS"}', '10-50L',
   'UAN linked to Aadhaar. Check passbook on EPFO portal.', false)
RETURNING id INTO asset_bank;

-- Fetch IDs for linking
SELECT id INTO asset_bank FROM public.assets WHERE user_id = test_user_id AND asset_type = 'BANK_ACCOUNT' LIMIT 1;
SELECT id INTO asset_fd FROM public.assets WHERE user_id = test_user_id AND asset_type = 'FIXED_DEPOSIT' LIMIT 1;
SELECT id INTO asset_mf FROM public.assets WHERE user_id = test_user_id AND asset_type = 'MUTUAL_FUND' LIMIT 1;
SELECT id INTO asset_insurance FROM public.assets WHERE user_id = test_user_id AND asset_type = 'INSURANCE' LIMIT 1;
SELECT id INTO asset_epf FROM public.assets WHERE user_id = test_user_id AND asset_type = 'EPF' LIMIT 1;

-- ─── Nominees (3) ─────────────────────────────────────────
INSERT INTO public.nominees (id, user_id, full_name, relation, contact_number, dob, pan_number)
VALUES
  (gen_random_uuid(), test_user_id, 'Priya Sharma', 'SPOUSE', '+919876543211', '1990-09-22', 'BCDPS5678G'),
  (gen_random_uuid(), test_user_id, 'Aarav Sharma', 'CHILD', NULL, '2018-03-10', NULL),
  (gen_random_uuid(), test_user_id, 'Sunita Sharma', 'PARENT', '+919876543212', '1960-12-01', 'CDSPS9012H');

SELECT id INTO nominee_spouse FROM public.nominees WHERE user_id = test_user_id AND relation = 'SPOUSE' LIMIT 1;
SELECT id INTO nominee_child FROM public.nominees WHERE user_id = test_user_id AND relation = 'CHILD' LIMIT 1;
SELECT id INTO nominee_parent FROM public.nominees WHERE user_id = test_user_id AND relation = 'PARENT' LIMIT 1;

-- ─── Asset-Nominee Mappings ───────────────────────────────
-- Spouse gets majority share, child & parent get portions
INSERT INTO public.asset_nominee_mappings (asset_id, nominee_id, share_percentage) VALUES
  (asset_bank, nominee_spouse, 50),
  (asset_bank, nominee_child, 30),
  (asset_bank, nominee_parent, 20),
  (asset_fd, nominee_spouse, 100),
  (asset_mf, nominee_spouse, 60),
  (asset_mf, nominee_child, 40),
  (asset_insurance, nominee_spouse, 100),
  (asset_epf, nominee_spouse, 50),
  (asset_epf, nominee_child, 50);

-- ─── Trusted Contact ─────────────────────────────────────
INSERT INTO public.trusted_contacts (user_id, contact_name, contact_phone, contact_email, relation, access_status)
VALUES
  (test_user_id, 'Amit Sharma', '+919876543213', 'amit.sharma@email.com', 'SIBLING', 'PENDING');

-- ─── Emergency Dossier ───────────────────────────────────
INSERT INTO public.emergency_dossiers (user_id, general_instructions, asset_type_instructions)
VALUES (
  test_user_id,
  E'1. Contact our CA: Mr. Venkatesh (9845012345) — he has copies of all tax filings.\n2. All bank statements are in the blue folder in the study cupboard, top shelf.\n3. My will is with Advocate Priya Menon in Indiranagar, Bengaluru (9845067890).\n4. Insurance policy documents are in the Google Drive folder "Insurance Docs" — Priya has access.',
  '{"BANK_ACCOUNT": "HDFC salary account has auto-pay for home loan EMI. Do not close until loan is settled.", "INSURANCE": "LIC term plan — claim must be filed within 3 years. Call LIC branch in Koramangala.", "MUTUAL_FUND": "SIP can be paused from Zerodha app. Login with registered email.", "EPF": "File PF withdrawal through employer HR. UAN is linked to Aadhaar."}'
);

-- ─── Audit Log Entries ───────────────────────────────────
INSERT INTO public.audit_logs (user_id, action, details)
VALUES
  (test_user_id, 'LOGIN', '{"method": "magic_link"}'),
  (test_user_id, 'ASSET_CREATED', '{"asset_type": "BANK_ACCOUNT", "institution": "HDFC Bank"}'),
  (test_user_id, 'NOMINEE_CREATED', '{"name": "Priya Sharma", "relation": "SPOUSE"}'),
  (test_user_id, 'DOSSIER_UPDATED', '{"sections_updated": ["general", "BANK_ACCOUNT", "INSURANCE"]}');

RAISE NOTICE 'Seed data created successfully for user %', test_user_id;

END $$;
