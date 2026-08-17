/**
 * Centralised form error parser for KutumbKosh.
 *
 * Maps Supabase PostgreSQL error codes, known error message patterns,
 * and network/auth failures to specific, user-friendly messages.
 *
 * RULE: Never return a generic "Something went wrong" message.
 *       Every path must give the user an actionable or at least informative message.
 */

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Parses any caught error (Supabase, network, or unknown) into a
 * user-facing string. Safe to use in all catch blocks.
 *
 * Usage:
 *   catch (err) { setError(parseFormError(err)); }
 */
export function parseFormError(err: unknown, context?: "save" | "delete" | "load" | "auth"): string {
  const verb = context === "delete" ? "delete" : context === "load" ? "load" : context === "auth" ? "sign in" : "save";

  // ── Supabase / PostgREST errors (have a .code property) ──────────────────
  const e = err as SupabaseError;
  if (e?.code) {
    switch (e.code) {
      // PostgreSQL constraint violations
      case "23505":
        return "This information is already saved. Please check your entries and try again.";
      case "23503":
        return "A linked record could not be found. Please refresh the page and try again.";
      case "23502":
        return "A required field is missing. Please fill in all required fields and try again.";
      case "23514":
        return "One or more values are not valid. Please check your entries.";

      // RLS / permission errors
      case "42501":
      case "PGRST301":
        return "Your session has expired. Please sign in again to continue.";

      // PostgREST not-found
      case "PGRST116":
        return "Record not found. Please go back and try again.";

      // PostgREST relation errors
      case "PGRST200":
        return "Unable to process this request. Please refresh the page and try again.";

      // Auth errors
      case "invalid_credentials":
        return "Incorrect email or password. Please try again.";
      case "user_not_found":
      case "user_banned":
        return "Account not found. Please sign in again.";
      case "email_not_confirmed":
        return "Please verify your email address before continuing.";
      case "over_email_send_rate_limit":
      case "email_address_not_authorized":
        return "Too many attempts. Please wait a few minutes before trying again.";
      case "weak_password":
        return "Password is too weak. Please choose a stronger password.";
    }
  }

  // ── Error message pattern matching ───────────────────────────────────────
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();

  if (!msg || msg === "unknown error") {
    return `Unable to ${verb} your data. Please try again. If this keeps happening, contact care@kutumbkosh.com`;
  }

  // Auth / session
  if (msg.includes("not authenticated") || msg.includes("jwt") || msg.includes("session")) {
    return "Your session has expired. Please sign in again to continue.";
  }
  if (msg.includes("user not found") || msg.includes("no user")) {
    return "Please sign in to continue.";
  }

  // Network / connectivity
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("fetch failed") || msg.includes("network request failed")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "The request took too long. Please check your connection and try again.";
  }

  // Rate limiting
  if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("429")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  // Supabase email
  if (msg.includes("email rate limit") || msg.includes("over_email_send_rate_limit")) {
    return "Too many sign-in attempts. Please wait a few minutes before trying again.";
  }

  // Payment gateway (Razorpay-specific)
  if (msg.includes("payment gateway not ready")) {
    return "Payment gateway not ready. Please refresh the page and try again.";
  }
  if (msg.includes("razorpay") || msg.includes("payment")) {
    return "Payment could not be processed. Please try again or contact care@kutumbkosh.com";
  }

  // Database constraint messages (raw Postgres text that may leak through)
  if (msg.includes("unique constraint") || msg.includes("duplicate key")) {
    return "This information is already saved. Please check your entries and try again.";
  }
  if (msg.includes("violates row-level security") || msg.includes("new row violates")) {
    return "Your session has expired. Please sign in again to continue.";
  }
  if (msg.includes("foreign key")) {
    return "A linked record could not be found. Please refresh the page and try again.";
  }
  if (msg.includes("not null") || msg.includes("null value in column")) {
    return "A required field is missing. Please fill in all required fields.";
  }

  // Context-specific fallbacks — still specific, never generic
  if (context === "delete") {
    return "Unable to delete. Please try again. If this continues, contact care@kutumbkosh.com";
  }
  if (context === "load") {
    return "Unable to load your data. Please refresh the page.";
  }
  if (context === "auth") {
    return "Sign-in failed. Please check your email and try again.";
  }

  return "Unable to save your data. Please try again. If this continues, contact care@kutumbkosh.com";
}
