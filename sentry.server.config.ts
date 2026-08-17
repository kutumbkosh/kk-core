/**
 * Sentry server-side (Node.js runtime) configuration.
 * Loaded via src/instrumentation.ts when NEXT_RUNTIME === "nodejs".
 *
 * Requires: NEXT_PUBLIC_SENTRY_DSN in your environment variables.
 * If DSN is not set, Sentry is silently disabled — no errors thrown.
 *
 * DPDPA NOTE (Decision 2026-05-02): See sentry.client.config.ts for full context.
 * Server-side applies the same pseudonymisation: UUIDs scrubbed, user context
 * stripped, IP removed, cookies and auth headers dropped.
 */
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// UUID pattern covers Supabase user IDs and asset IDs that appear in URL paths.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const scrubUuids = (str: string): string => str.replace(UUID_RE, "[id]");

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV || "development",

    // Sample 10% of transactions in production, 100% in dev/staging.
    tracesSampleRate:
      process.env.NEXT_PUBLIC_APP_ENV === "production" ? 0.1 : 1.0,

    // DPDPA pseudonymisation: strip all personal identifiers before sending.
    beforeSend(event) {
      // 1. Strip user context entirely (includes ip_address, id, email).
      delete event.user;

      // 2. Scrub UUIDs from request URL.
      if (event.request?.url) {
        event.request.url = scrubUuids(event.request.url);
      }

      // 3. Drop cookies and auth headers.
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete (event.request.headers as Record<string, string>)["authorization"];
          delete (event.request.headers as Record<string, string>)["Authorization"];
          delete (event.request.headers as Record<string, string>)["cookie"];
          delete (event.request.headers as Record<string, string>)["Cookie"];
        }
      }

      return event;
    },
  });
}
