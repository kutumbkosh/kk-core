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

## Product
- [ ] Final QA pass on all dashboard flows (assets, nominees, reminders)
- [ ] Test Razorpay payment flow (Pro subscription) — BLOCKED: requires Shubham to complete Razorpay KYC + live mode activation first (Finance handoff). Engineering spec ready at docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx
- [ ] Vault Dossier PDF generation — verify output quality
- [ ] Emergency access feature — test invite and access flow
- [ ] Mobile responsiveness check across devices

## Infrastructure
- [ ] Vercel production deployment (currently staging only)
- [ ] Set up production Supabase environment (separate from staging)
- [ ] Configure production environment variables on Vercel
- [x] Set up error monitoring (Sentry or similar) — Done 2026-05-01. sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, src/instrumentation.ts created. next.config.mjs wrapped with withSentryConfig (tunnelRoute /monitoring, hideSourceMaps, disableLogger). @sentry/nextjs added to package.json. PENDING: Shubham to run npm install, create Sentry account, set NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN in Vercel.
- [x] Set up analytics (Cloudflare Web Analytics) — Done 2026-05-01. src/components/CloudflareAnalytics.tsx created (production-only, cookieless, free). layout.tsx updated. CSP updated: static.cloudflareinsights.com in script-src, cloudflareinsights.com in connect-src. PENDING: Shubham to go to Cloudflare Dashboard → Web Analytics → Add kutumbkosh.com → set NEXT_PUBLIC_CF_BEACON_TOKEN in Vercel production.

## Branding & Marketing
- [ ] Finalize social media profiles (Instagram, LinkedIn, Twitter/X)
- [ ] Prepare launch-day social posts using brand kit templates
- [ ] Set up care@kutumbkosh.com email (if not already)
- [ ] Notify waitlist subscribers on launch day
