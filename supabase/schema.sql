-- KutumbKosh Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  dob DATE,
  pan_number TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2. ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'BANK_ACCOUNT', 'FIXED_DEPOSIT', 'MUTUAL_FUND', 'INSURANCE',
    'DEMAT', 'EPF', 'PPF_NPS', 'LOAN', 'CREDIT_CARD', 'LOCKER', 'REAL_ESTATE'
  )),
  institution_name TEXT NOT NULL,
  account_identifier TEXT, -- last 4 digits only
  metadata JSONB DEFAULT '{}',
  approx_value_band TEXT CHECK (approx_value_band IN ('<1L', '1-5L', '5-10L', '10-50L', '50L+')),
  document_url TEXT,
  notes TEXT,
  is_draft BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own assets"
  ON public.assets FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- 3. NOMINEES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nominees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER')),
  dob DATE,
  contact_number TEXT,
  pan_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nominees"
  ON public.nominees FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- 4. ASSET-NOMINEE MAPPING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.asset_nominee_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE NOT NULL,
  share_percentage INTEGER DEFAULT 100 CHECK (share_percentage > 0 AND share_percentage <= 100),
  is_synced_with_institution BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, nominee_id)
);

ALTER TABLE public.asset_nominee_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mappings"
  ON public.asset_nominee_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assets WHERE assets.id = asset_nominee_mappings.asset_id AND assets.user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. TRUSTED CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  relation TEXT NOT NULL DEFAULT 'OTHER',
  access_status TEXT DEFAULT 'PENDING' CHECK (access_status IN ('PENDING', 'ACTIVE', 'REVOKED')),
  activation_requested_at TIMESTAMPTZ,
  activation_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own trusted contacts"
  ON public.trusted_contacts FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. EMERGENCY DOSSIER
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emergency_dossiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  general_instructions TEXT,
  asset_type_instructions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dossier"
  ON public.emergency_dossiers FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- 7. DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  document_type TEXT DEFAULT 'OTHER' CHECK (document_type IN ('STATEMENT', 'POLICY', 'WILL', 'POA', 'OTHER')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_hash TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- 8. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_nominees_user_id ON public.nominees(user_id);
CREATE INDEX IF NOT EXISTS idx_mappings_asset ON public.asset_nominee_mappings(asset_id);
CREATE INDEX IF NOT EXISTS idx_mappings_nominee ON public.asset_nominee_mappings(nominee_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);

-- ============================================================
-- 9. SUBSCRIPTIONS (billing & plan management)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE')),
  billing_cycle TEXT NOT NULL DEFAULT 'ANNUAL' CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL')),
  amount_paid INTEGER NOT NULL DEFAULT 0,
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);


-- ============================================================
-- 10. ADMIN ACCESS LOG (audit trail for all admin DB operations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  function_name TEXT NOT NULL,
  called_at TIMESTAMPTZ DEFAULT NOW(),
  context JSONB DEFAULT '{}'
);
ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_admin_access_log_email ON public.admin_access_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_called_at ON public.admin_access_log(called_at DESC);
