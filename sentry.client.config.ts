/**
 * Sentry client-side (browser) configuration.
 * Auto-loaded by @sentry/nextjs webpack plugin.
 *
 * Requires: NEXT_PUBLIC_SENTRY_DSN in your environment variables.
 * If DSN is not set, Sentry is silently disabled — no errors thrown.
 *
 * DPDPA NOTE (Decision 2026-05-02):
 * Sentry stores data in US/EU. To minimise cross-border personal data transfer
 * under DPDPA 2023 S.16, this config applies pseudonymisation at source:
 *   - All UUIDs in URLs are replaced with "[id]" before transmission
 *   - User context (id, email) is stripped entirely — never sent to Sentry
 *   - Cookies and auth headers are dropped from request context
 *   - fetch/XHR breadcrumbs are dropped (may contain auth tokens)
 *   - Replay masks all text, inputs, and media (no vault content captured)
 * This reduces Sentry payloads to anonymous error telemetry only.
 * Full remediation (self-hosted in India) is tracked in HANDOFFS.md → Operations.
 */
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// UUID pattern covers Supabase user IDs and asset IDs that appear in URL paths.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const scrubUuids = (str: string): string => str.replace(UUID_RE, "[id]");

if (SENTRY_DSN) {
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV || "development",

    // Sample 10% of transactions in production, 100% in dev/staging.
    tracesSampleRate: isProd ? 0.1 : 1.0,

    // Replay: capture 10% of sessions in prod, 0 in dev/staging.
    // All text, inputs, and media are masked — no vault content is ever captured.
    replaysSessionSampleRate: isProd ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],

    // Ignore common noise events.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],

    // DPDPA pseudonymisation: strip all personal identifiers before sending.
    beforeSend(event) {
      // 1. Strip user context entirely — no user ID or email leaves India.
      delete event.user;

      // 2. Scrub UUIDs from request URL (e.g. /assets/abc-uuid → /assets/[id]).
      if (event.request?.url) {
        event.request.url = scrubUuids(event.request.url);
      }

      // 3. Drop cookies and auth headers from request context.
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete (event.request.headers as Record<string, string>)["Authorization"];
          delete (event.request.headers as Record<string, string>)["Cookie"];
        }
      }

      return event;
    },

    // Drop breadcrumbs that could carry auth tokens or user-identifiable URLs.
    beforeBreadcrumb(breadcrumb) {
      // Drop all network breadcrumbs — request/response may contain tokens.
      if (breadcrumb.category === "fetch" || breadcrumb.category === "xhr") {
        return null;
      }
      // Scrub UUIDs from navigation breadcrumb URLs.
      if (breadcrumb.category === "navigation" && breadcrumb.data?.to) {
        breadcrumb.data.to = scrubUuids(breadcrumb.data.to as string);
        if (breadcrumb.data.from) {
          breadcrumb.data.from = scrubUuids(breadcrumb.data.from as string);
        }
      }
      return breadcrumb;
    },
  });
}
