# KutumbKosh — Launch Checklist

## Legal & Compliance
- [ ] Verify DPDPA 2023 compliance — consult a legal advisor, draft a formal privacy policy, set up consent mechanisms, and data deletion flows.
  - [x] Landing page copy softened — "DPDPA Compliant" replaced in coming-soon/index.html and security/page.tsx per DECISIONS.md
- [ ] Draft and publish Privacy Policy page
- [ ] Draft and publish Terms of Service page — IN PROGRESS: Finance has drafted Payment, Subscription & Refund section (docs/FINANCE-TOS-PAYMENT-DRAFT.docx). Operations to coordinate external legal review before publish. Full ToS still needs drafting (Operations scope).
- [ ] Add cookie consent banner (if applicable)

## Landing Page
- [ ] Upload updated `coming-soon/index.html` to Cloudflare Pages
- [ ] Test Web3Forms waitlist end-to-end (submit test email, confirm delivery)
- [ ] Remove `google-apps-script.js` from coming-soon folder before uploading
- [ ] Set up a custom domain on Cloudflare (if not already done)
- [x] "How KutumbKosh Works" — Done 2026-05-03. Marketing design delivered (docs/marketing/how-it-works-infographic.html). Tech implemented in coming-soon/index.html (before features section, Marketing design faithful) and src/app/page.tsx (as <HowItWorks /> component at src/components/HowItWorks.tsx). Shubham to re-upload coming-soon/index.html to Cloudflare Pages.

## Product
- [ ] Final QA pass on all dashboard flows (assets, nominees, reminders)
- [ ] Test Razorpay payment flow (Pro subscription) — BLOCKED: requires Shubham to complete Razorpay KYC + live mode activation first (Finance handoff). Engineering spec ready at docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx
- [x] Mandatory field validation — Done 2026-05-02. Profile Setup (mobile mandatory, single-step form — no OTP yet, DOB mandatory 18+), Nominee form (relationship mandatory, at-least-one contact, minor guardian dynamic fields), Trusted Contact form (mobile AND email both mandatory). DB migration: supabase/migrations/20260502_mandatory_fields_and_kutumb_id.sql.
- [ ] Mobile OTP verification for Profile Setup — BLOCKED: SMS provider (Twilio or MSG91) not yet chosen by Shubham. Configure in Supabase Dashboard → Auth → Phone, then confirm go-ahead to Engineering. See HANDOFFS.md.
- [x] Kutumb ID — Done 2026-05-02. generate_kutumb_id() Postgres function (charset excludes 0/1/O/I, retry on collision). kutumb_id column added to profiles (NOT NULL UNIQUE, backfilled for existing users). Displayed in Settings with copy-to-clipboard. Printed in Vault Dossier PDF header. Emergency Access UI has Kutumb ID input field (backend logic is a future feature). src/lib/kutumb-id.ts added for client-side use.
- [ ] Vault Dossier PDF generation — verify output quality (Kutumb ID now printed in PDF header — 2026-05-02)
- [ ] Emergency access feature — test invite and access flow
- [ ] Mobile responsiveness check across devices

## Infrastructure
- [ ] Vercel production deployment (currently staging only)
- [ ] Set up production Supabase environment (separate from staging)
- [ ] Configure production environment variables on Vercel
- [ ] Run DB migration in production Supabase SQL Editor: supabase/migrations/20260502_mandatory_fields_and_kutumb_id.sql (mandatory fields + Kutumb ID columns + generate_kutumb_id function + updated handle_new_user trigger). BLOCKED until production Supabase environment is set up.
- [x] Run DB migration in staging + production Supabase SQL Editor: supabase/migrations/20260504_relation_other.sql (adds relation_other TEXT column to nominees and trusted_contacts — required for "Other" relationship bug fix shipped 2026-05-04). Done 2026-05-05 — Shubham confirmed.
- [x] Run DB migration in staging + production Supabase SQL Editor: supabase/migrations/20260505_trusted_contacts_soft_delete.sql (adds deleted_at TIMESTAMPTZ column + RLS UPDATE policy + partial index to trusted_contacts — required for soft delete on Emergency Access page, shipped 2026-05-05). Done 2026-05-05 — Shubham confirmed.
- [x] Set up error monitoring (Sentry or similar) — Done 2026-05-01. sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, src/instrumentation.ts created. next.config.mjs wrapped with withSentryConfig (tunnelRoute /monitoring, hideSourceMaps, disableLogger). @sentry/nextjs added to package.json. PENDING: Shubham to run npm install, create Sentry account, set NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN in Vercel.
- [x] Set up analytics (Cloudflare Web Analytics) — Done 2026-05-01. src/components/CloudflareAnalytics.tsx created (production-only, cookieless, free). layout.tsx updated. CSP updated: static.cloudflareinsights.com in script-src, cloudflareinsights.com in connect-src. PENDING: Shubham to go to Cloudflare Dashboard → Web Analytics → Add kutumbkosh.com → set NEXT_PUBLIC_CF_BEACON_TOKEN in Vercel production.

## Branding & Marketing
- [ ] Finalize social medi