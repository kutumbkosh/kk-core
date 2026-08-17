/**
 * Sentry edge runtime configuration.
 * Loaded via src/instrumentation.ts when NEXT_RUNTIME === "edge".
 *
 * Requires: NEXT_PUBLIC_SENTRY_DSN in your environment variables.
 * If DSN is not set, Sentry is silently disabled — no errors thrown.
 */
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV || "development",
    tracesSampleRate:
      process.env.NEXT_PUBLIC_APP_ENV === "production" ? 0.1 : 1.0,
  });
}
