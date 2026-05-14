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
- [ ] Final QA pass on all dashboard flows (assets, nominees, reminders) — BLOCKED: Product audit (2026-05-12) found 4 critical + 4 high bugs in Reminders and Emergency Access. Engineering handoff at HANDOFFS.md ID 44. C1 + C2 fixed (HANDOFFS.md ID 51 Done 2026-05-12). 2 critical + 4 high remain open before QA pass is meaningful.
- [ ] Test Razorpay payment flow (Pro subscription) — BLOCKED: requires Shubham to complete Razorpay KYC + live mode activation first (Finance handoff). Engineering spec ready at docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx
- [x] Mandatory field validation — Done 2026-05-02. Profile Setup (mobile mandatory, single-step form — no OTP yet, DOB mandatory 18+), Nominee form (relationship mandatory, at-least-one contact, minor guardian dynamic fields), Trusted Contact form (mobile AND email both mandatory). DB migration: supabase/migrations/20260502_mandatory_fields_and_kutumb_id.sql.
- [ ] Mobile OTP verification for Profile Setup — BLOCKED: SMS provider (Twilio or MSG91) not yet chosen by Shubham. Configure in Supabase Dashboard → Auth → Phone, then confirm go-ahead to Engineering. See HANDOFFS.md.
- [x] Kutumb ID — Done 2026-05-02. generate_kutumb_id() Postgres function (charset excludes 0/1/O/I, retry on collision). kutumb_id column added to profiles (NOT NULL UNIQUE, backfilled for existing users). Displayed in Settings with copy-to-clipboard. Printed in Vault Dossier PDF header. Emergency Access UI has Kutumb ID input field (backend logic is a future feature). src/lib/kutumb-id.ts added for client-side use.
- [ ] Vault Dossier PDF generation — verify output quality (Kutumb ID now printed in PDF header — 2026-05-02)
- [ ] Emergency access feature — V2 (inactivity timer) + V3 (pre-authorized access) build — IN PROGRESS: Product decision locked (DECISIONS.md 2026-05-07), Operations DPDPA clearance received with 7 conditions (HANDOFFS.md ID 36), Engineering handoff raised (HANDOFFS.md ID 40). BLOCKED on go-live until external legal review complete (Operations to arrange).
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
- [ ] Finalize social media profiles — set up @KutumbKosh (or best available handle) on Instagram, LinkedIn, and Twitter/X before launch day
- [x] og-image.png created — Done 2026-05-01. public/og-image.png (1200×630px, 51KB) confirmed present in repo. Shubham to commit, deploy, and validate preview at https://www.opengraph.xyz or via WhatsApp before marking launch complete.
- [x] Pricing copy locked — Done 2026-05-07. Sales & Marketing spec at docs/marketing/pricing-copy-lock.md. Three violations found in src/app/dashboard/pricing/page.tsx (line 126: "or ₹79/month"; missing "Inclusive of GST" label; line 237 monthly billing FAQ). Engineering fixed all three (HANDOFFS.md ID 41 Done 2026-05-12).
- [x] Pricing page tier copy corrected — Done 2026-05-12. Four factual errors in features array fixed (emergency access, trusted contacts, PDF, reminders all showed incorrect Free tier values). Engineering handoff raised as HANDOFFS.md ID 50.
- [x] UpgradePrompt copy corrected — Done 2026-05-12. Three copy blocks written: emergency_access_v2v3 (new), emergency_contact_limit (new), all_reminders (fixed — removed vault review nudge from Pro-only desc). Engineering handoff raised as HANDOFFS.md ID 48.
- [ ] Schedule launch-day posts — draft 3–5 posts (Instagram, LinkedIn, WhatsApp broadcast) using brand kit templates at docs/marketing/KutumbKosh-Brand-Kit-v2.pdf. Prepare and schedule in advance.
- [ ] Draft and send waitlist notification email on launch day (if any subscribers signed up via coming-soon page)
- [x] care@kutumbkosh.com inbox — confirmed live and monitored (2026-05-04)
- [x] Web3Forms decision — Closed 2026-05-12. Shubham confirmed waitlist emails are already being stored. No form addition needed. Waitlist notification email (launch day) is now unblocked.

## SEO
- [ ] Set up Google Search Console for kutumbkosh.com — add property, verify via Cloudflare DNS TXT record (see Marketing → Shubham handoff in HANDOFFS.md)
- [ ] Set up Bing Webmaster Tools at https://www.bing.com/webmasters
- [ ] Submit sitemap.xml in Google Search Console after production deploy
- [ ] Validate Core Web Vitals baseline post-launch — LCP < 2.5s, INP < 200ms, CLS < 0.1 (see Marketing → Engineering handoff in HANDOFFS.md)

## Finance & Payments (Shubham — All are hard launch blockers)
- [ ] Register legal business entity (Pvt. Ltd. recommended; LLP or Sole Proprietorship acceptable for soft launch) at https://www.mca.gov.in
- [ ] Open a business current account in entity name (HDFC, ICICI, or Kotak) — required for Razorpay settlements
- [ ] Register for GSTIN at https://www.gst.gov.in — confirm SAC code 998314 with CA before registering
- [x] Confirm pricing decision in writing: ₹499/year GST-inclusive — locked in DECISIONS.md 2026-05-07. pricing/page.tsx violations fixed 2026-05-12 (HANDOFFS.md ID #41).
- [ ] Complete Razorpay KYC + live mode activation; link business current account for settlements
- [ ] Engage a CA for GSTR-1, GSTR-3B, advance tax, and annual ITR filing

## Legal & Compliance (Additional Items)
- [ ] Draft full Privacy Policy (data collected, purpose, storage, retention, user rights, grievance, DPDPA alignment) — publish at /privacy before first production user
- [ ] Draft full Terms of Service non-payment sections — Finance drafted Payment/Subscription/Refund section; Operations to draft remainder and coordinate external legal review before publish
- [ ] Determine if cookie consent banner is legally required for current stack; if yes, raise Engineering handoff to implement
- [x] Confirm /grievance page exists at /grievance and is linked from /privacy footer (per DECISIONS.md 2026-04-28) — Verified 2026-05-12. src/app/grievance/page.tsx exists; footer links confirmed present.
- [ ] Operations: obtain formal DPDPA S.16 clearance for Sentry before setting NEXT_PUBLIC_SENTRY_DSN in Vercel production

## Infrastructure (Pending Shubham Actions)
- [x] Run `npm install` in vault/ — Done. package-lock.json confirmed: 87 @sentry/nextjs entries + 3 web-vitals entries present (verified 2026-05-12).
- [ ] Configure Resend transactional email — set RESEND_API_KEY in Vercel production for branded magic link, subscription, and renewal emails
- [ ] Set NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN in Vercel after Sentry account created and Operations DPDPA S.16 clearance received
- [ ] Set NEXT_PUBLIC_CF_BEACON_TOKEN in Vercel production after Cloudflare Web Analytics beacon token obtained

## Support & Operations
- [x] care@kutumbkosh.com — confirmed live and monitored (2026-05-04)
- [x] FAQ — Landing page collapsible section: Done 2026-05-14. Implemented in coming-soon/index.html (details/summary accordion, no JS, FAQ JSON-LD schema in head) and src/app/page.tsx (src/components/FAQ.tsx, React useState accordion). 7 Q&As verbatim from docs/marketing/faq-copy.md. Placed after How It Works, before CTA/footer.
- [x] FAQ — In-app nominee vs trusted contact explainer card: Done 2026-05-14. Added to src/app/dashboard/nominees/page.tsx at top of main, above coverage alert. Exact copy from docs/marketing/faq-copy.md Part 2. Users icon, card pattern matches emergency page.
- [ ] Dedicated /faq page — DEFERRED post-launch (DECISIONS.md 2026-05-12 | Product). Build from real care@kutumbkosh.com questions after launch.
- [ ] Define support SLA and response workflow for care@kutumbkosh.com inbox

## Security (Completed)
- [x] Security audit — Go/No-Go verdict: GO cleared for production deploy (2026-05-01)
- [x] Supabase RLS enabled on all tables
- [x] Zero-routine-access policy documented — Internal Access Policy v1.0 at docs/policies/security/internal-access-policy.md
- [x] Grievance Officer designated — Shubham, care@kutumbkosh.com, 48-hour acknowledgement / 30-day resolution SLA (docs/policies/security/grievance-officer-designation.md)

## Post-Launch — Week 1
- [ ] Monitor error logs in Sentry dashboard (after DSN configured and Operations DPDPA clearance received)
- [ ] Monitor traffic in Cloudflare Web Analytics (after beacon token set)
- [ ] Direct outreach to first users / early waitlist sign-ups for feedback
- [ ] Triage and prioritise post-launch bug reports
- [x] Integrate Core Web Vitals monitoring — Done 2026-05-07. web-vitals ^4.2.4 added to package.json. src/components/WebVitals.tsx collects CLS/FCP/INP/LCP/TTFB (production-only, dynamic import, sendBeacon). src/app/api/vitals/route.ts logs metrics to Vercel function logs with rating (good/needs-improvement/poor). WebVitals component wired into src/app/layout.tsx. PENDING: Shubham to run npm install.
- [ ] Publish introductory blog post or LinkedIn article to build early SEO signal