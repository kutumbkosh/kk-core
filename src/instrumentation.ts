/**
 * Next.js instrumentation hook.
 * Loads the correct Sentry config depending on the runtime.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * This file must live in src/ (or the project root if not using src/ directory).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
