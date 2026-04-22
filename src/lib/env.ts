/**
 * KutumbKosh Environment Configuration
 *
 * Centralizes all environment variables with validation.
 * Fails fast at startup if required variables are missing.
 */

export type Environment = "development" | "staging" | "production";

function getEnv(): Environment {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";
  if (env === "production" || env === "staging" || env === "development") {
    return env;
  }
  return "development";
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

/**
 * Validated environment config — import this instead of reading process.env directly.
 */
export const env = {
  // ─── Environment ─────────────────────────────────────
  NODE_ENV: getEnv(),
  isProduction: getEnv() === "production",
  isStaging: getEnv() === "staging",
  isDevelopment: getEnv() === "development",

  // ─── Supabase ────────────────────────────────────────
  supabase: {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },

  // ─── App ─────────────────────────────────────────────
  app: {
    name: optionalEnv("NEXT_PUBLIC_APP_NAME", "KutumbKosh"),
    url: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    env: getEnv(),
  },

  // ─── Feature Flags (env-based) ───────────────────────
  features: {
    /** Enable mock payments (true in dev/staging, false in prod) */
    mockPayments: optionalEnv("NEXT_PUBLIC_MOCK_PAYMENTS", getEnv() !== "production" ? "true" : "false") === "true",
    /** Show environment badge in the UI */
    showEnvBadge: getEnv() !== "production",
  },
} as const;

/**
 * Log environment info at startup (non-sensitive only).
 * Call this in your root layout or app initialization.
 */
export function logEnvironment(): void {
  if (typeof window !== "undefined") return; // Server-side only
  console.log(`[KutumbKosh] Environment: ${env.NODE_ENV}`);
  console.log(`[KutumbKosh] Supabase URL: ${env.supabase.url}`);
  console.log(`[KutumbKosh] App URL: ${env.app.url}`);
  console.log(`[KutumbKosh] Mock Payments: ${env.features.mockPayments}`);
}
