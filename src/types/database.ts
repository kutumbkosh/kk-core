// Database types for KutumbKosh
// These match the Supabase schema defined in supabase/schema.sql

export type AssetType =
  | "BANK_ACCOUNT"
  | "FIXED_DEPOSIT"
  | "MUTUAL_FUND"
  | "INSURANCE"
  | "DEMAT"
  | "EPF"
  | "PPF_NPS"
  | "LOAN"
  | "CREDIT_CARD"
  | "LOCKER"
  | "REAL_ESTATE";

export type ValueBand = "<1L" | "1-5L" | "5-10L" | "10-50L" | "50L+";

export type NomineeRelation =
  | "spouse"
  | "child"
  | "parent"
  | "sibling"
  | "grandchild"
  | "grandparent"
  | "in_law"
  | "other"
  // Legacy uppercase values kept for backward compat with existing rows
  | "SPOUSE"
  | "CHILD"
  | "PARENT"
  | "SIBLING"
  | "OTHER";

export type AccessStatus = "PENDING" | "ACTIVE" | "REVOKED";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  dob: string | null;
  // New mandatory-fields columns
  mobile_number: string | null;
  mobile_verified: boolean;
  date_of_birth: string | null;
  profile_complete: boolean;
  kutumb_id: string | null;
  pan_number: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  asset_type: AssetType;
  institution_name: string;
  account_identifier: string | null;
  metadata: Record<string, unknown>;
  approx_value_band: ValueBand | null;
  document_url: string | null;
  notes: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface Nominee {
  id: string;
  user_id: string;
  full_name: string;
  relation: NomineeRelation;
  dob: string | null;
  contact_number: string | null;
  email: string | null;
  guardian_name: string | null;
  guardian_mobile: string | null;
  pan_number: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetNomineeMapping {
  id: string;
  asset_id: string;
  nominee_id: string;
  share_percentage: number;
  is_synced_with_institution: boolean;
  last_verified_at: string | null;
  created_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  relation: string;
  access_status: AccessStatus;
  activation_requested_at: string | null;
  activation_approved_at: string | null;
  created_at: string;
}

export interface EmergencyDossier {
  id: string;
  user_id: string;
  general_instructions: string | null;
  asset_type_instructions: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export type PlanType = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  billing_cycle: "MONTHLY" | "ANNUAL";
  amount_paid: number;
  razorpay_subscription_id: string | null;
  razorpay_payment_id: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// Plan limits
export const PLAN_LIMITS: Record<PlanType, { maxAssets: number; maxNominees: number; features: string[] }> = {
  FREE: {
    maxAssets: 3,
    maxNominees: 2,
    features: ["basic_reminders"],
  },
  PRO: {
    maxAssets: Infinity,
    maxNominees: Infinity,
    features: ["basic_reminders", "all_reminders", "emergency_access", "pdf_export", "share_percentages", "priority_support"],
  },
};

// Asset type display configuration
export const ASSET_TYPE_CONFIG: Record<
  AssetType,
  { label: string; icon: string; color: string }
> = {
  BANK_ACCOUNT: { label: "Bank Account", icon: "Landmark", color: "#2E86C1" },
  FIXED_DEPOSIT: { label: "Fixed Deposit / RD", icon: "PiggyBank", color: "#1A7A5C" },
  MUTUAL_FUND: { label: "Mutual Fund", icon: "TrendingUp", color: "#8E44AD" },
  INSURANCE: { label: "Insurance", icon: "Shield", color: "#E67E22" },
  DEMAT: { label: "Demat & Stocks", icon: "BarChart3", color: "#2C3E50" },
  EPF: { label: "EPF", icon: "Building2", color: "#16A085" },
  PPF_NPS: { label: "PPF / NPS", icon: "Wallet", color: "#2980B9" },
  LOAN: { label: "Loan", icon: "HandCoins", color: "#E74C3C" },
  CREDIT_CARD: { label: "Credit Card", icon: "CreditCard", color: "#9B59B6" },
  LOCKER: { label: "Locker", icon: "Lock", color: "#34495E" },
  REAL_ESTATE: { label: "Real Estate", icon: "Home", color: "#27AE60" },
};
