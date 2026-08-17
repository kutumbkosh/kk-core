import { createClient } from "@supabase/supabase-js";

/**
 * Supabase service role client — bypasses Row Level Security.
 *
 * Use ONLY in server-side code that runs without a user session:
 *   - Webhook handlers (Razorpay, cron)
 *   - Background jobs
 *
 * NEVER import this in client components or expose the key to the browser.
 *
 * Env var required: SUPABASE_SERVICE_ROLE_KEY
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("[Supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
