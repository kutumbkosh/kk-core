# KutumbKosh — Cross-Department Handoffs

This file is the async message bus between departments. Any department can write a request here. The receiving department reads open handoffs at the start of every session before doing any work.

## How to use
- **Writing a handoff:** Fill in all fields below. Set STATUS to `Open`.
- **Receiving a handoff:** Read all open items addressed to your department. Update STATUS to `In Progress` or `Done` as you work.
- **Format:** Copy the template block and fill it in. Keep completed items at the bottom under `## Completed`.

---

## Template

```
FROM:      [Department name]
TO:        [Department name]
PRIORITY:  [High / Medium / Low]
REQUEST:   [Clear description of what needs to be done.
            Be specific — link to files, include exact copy, reference decisions.]
DEADLINE:  [e.g., Before production deploy / Before launch day / No rush]
STATUS:    Open
---
```

---

## Open Handoffs

FROM:      Tech
TO:        Operations
PRIORITY:  High — Must resolve before production deploy
REQUEST:   Sentry (error monitoring) stores data in US/EU (AWS US-East-1 by default).
           Under DPDPA 2023 S.16, cross-border transfer of personal data is subject to
           restrictions once transfer rules are notified by the Indian government.

           Engineering has applied pseudonymisation at source (Decision 2026-05-02):
           - User identifiers stripped before transmission
           - UUIDs in URLs replaced with [id]
           - Auth headers and cookies dropped
           - Sentry Replay fully masked

           However, this is a technical mitigation only — not a legal clearance.

           OPERATIONS ACTION REQUIRED:
           1. Formally assess whether Sentry's US/EU data storage is permissible under
              DPDPA 2023 S.16, given that transfer rules have not yet been notified.
           2. Assess whether pseudonymised error telemetry (no user IDs, no IPs, scrubbed
              URLs) still constitutes "personal data" under DPDPA's definition, or whether
              it qualifies as anonymous data outside the Act's scope.
           3. If cleared: approve Sentry for production and inform Engineering so that
              NEXT_PUBLIC_SENTRY_DSN can be set in Vercel production env vars.
           4. If not cleared: Engineering will evaluate Option 2 (self-hosted GlitchTip
              on AWS Mumbai) as the long-term remediation. Estimated effort: 1–2 days.

           CURRENT STATUS OF SENTRY:
           - Dev/Staging: Can be enabled (lower risk, no real user data)
           - Production: BLOCKED until Operations clears this handoff

           Reference: DECISIONS.md → 2026-05-02 | Tech
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Legal / Compliance
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Launch Blocker
REQUEST:   The SQL migrations for admin_access_log and the updated is_admin()
           function have been run on Dev and Staging but NOT on Production.

           ✅ UNBLOCKED — Engineering fixes are complete (2026-05-01). Files are
           correct. You may now run in the Production Supabase SQL Editor:
           1. The admin_access_log table block from the bottom of supabase/schema.sql
           2. The full supabase/admin-views.sql (recreates is_admin() with
              shubham.git@gmail.com and adds log_admin_access() function)

           This is required for the Internal Access Policy to be technically enforced
           in production. Until this is done, the audit trail does not exist in prod.
DEADLINE:  Before production deploy
STATUS:    Open — Ready for Shubham action
---

---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Before Launch
REQUEST:   og-image.png has been created by Marketing and is already at
           public/og-image.png in the repo (1200×630px PNG, 50 KB).

           Specs: #1E40AF background, Poppins font, KutumbKosh wordmark +
           shield logo, tagline, feature pills, "Organize. Protect. Pass on."
           headline, kutumbkosh.com domain badge.

           Action required:
           1. git add public/og-image.png and commit.
           2. Deploy to production.
           3. Verify the image is reachable at https://kutumbkosh.com/og-image.png.
           4. Validate OG tag resolution via https://www.opengraph.xyz or a
              WhatsApp link preview before marking launch complete.

           This closes the open note in the "SEO meta tags" Done handoff above.
DEADLINE:  Before launch day
STATUS:    Done — 2026-05-01. public/og-image.png confirmed present in repo.
           Engineering's earlier BLOCKED status was incorrect — caused by a faulty
           glob pattern that missed the file. layout.tsx and coming-soon/index.html
           both correctly reference /og-image.png and https://kutumbkosh.com/og-image.png.
           Pending: Shubham to commit + deploy, then validate preview at opengraph.xyz
           or WhatsApp before marking launch complete.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Before Launch (coming-soon page is LIVE right now)
REQUEST:   The SEO meta tag handoff was only applied to app/layout.tsx. The
           coming-soon page (coming-soon/index.html) — the LIVE public URL on
           Cloudflare Pages — was not updated. Gaps that break WhatsApp/social sharing:

           - og:title → "KutumbKosh — Coming Soon" (wrong)
           - meta description → vague copy ("Something powerful is coming...")
           - og:description → different from approved copy
           - og:image → MISSING entirely (no tag)
           - Twitter Card tags → ALL MISSING
           - canonical → MISSING

           Required changes in <head>:

           <title>KutumbKosh — Your Family's Financial Vault</title>
           <meta name="description" content="Organize, protect, and pass on your
             family's financial legacy. Track bank accounts, insurance, FDs, PPF,
             and all nominees — in one secure vault." />
           <meta property="og:title" content="KutumbKosh — Your Family's Financial Vault" />
           <meta property="og:description" content="Organize, protect, and pass on your
             family's financial legacy. Track bank accounts, insurance, FDs, PPF,
             and all nominees — in one secure vault." />
           <meta property="og:image" content="https://kutumbkosh.com/og-image.png" />
           <meta property="og:image:width" content="1200" />
           <meta property="og:image:height" content="630" />
           <meta property="og:type" content="website" />
           <meta property="og:url" content="https://kutumbkosh.com" />
           <meta property="og:locale" content="en_IN" />
           <meta name="twitter:card" content="summary_large_image" />
           <meta name="twitter:title" content="KutumbKosh — Your Family's Financial Vault" />
           <meta name="twitter:description" content="Organize, protect, and pass on your
             family's financial legacy. Track bank accounts, insurance, FDs, PPF,
             and all nominees — in one secure vault." />
           <meta name="twitter:image" content="https://kutumbkosh.com/og-image.png" />
           <link rel="canonical" href="https://kutumbkosh.com" />

           og:image and twitter:image point to kutumbkosh.com/og-image.png
           (the Next.js app's public/og-image.png — no separate copy needed).

           After updating, re-upload coming-soon/index.html to Cloudflare Pages
           and validate the WhatsApp preview at https://www.opengraph.xyz.
DEADLINE:  Before launch day
STATUS:    Done — Fixed 2026-05-01. All 6 issues resolved in coming-soon/index.html:
           og:title → "KutumbKosh — Your Family's Financial Vault"; meta description
           and og:description → approved copy; og:image + dimensions added pointing to
           https://kutumbkosh.com/og-image.png; og:locale en_IN added; full Twitter Card
           block added (card, title, description, image); canonical added.
           Note: og-image.png must still be created by Marketing and deployed before
           WhatsApp preview will show the image. File currently missing from repo.
           Note: Shubham must re-upload coming-soon/index.html to Cloudflare Pages.
---

FROM:      Engineering
TO:        Legal / Compliance
PRIORITY:  High — For awareness
REQUEST:   coming-soon/index.html was replaced by Shubham (2026-05-01), reverting
           4 previously fixed DPDPA violations back to non-compliant text. Engineering
           has re-applied all fixes. Violations re-fixed:
           L965: "Designed with DPDPA 2023 in mind" (was reverted to "compliant with DPDPA 2023")
           L964: "Designed with Privacy in Mind" (was reverted to "DPDPA Compliant")
           L1017: "Indian Privacy Standards" (was reverted to "DPDPA 2023")
           L1018: "Designed with India's DPDPA in mind" (was reverted to "Fully compliant")
           Recommend Shubham note this file as a compliance-sensitive file going forward.
DEADLINE:  Awareness only
STATUS:    Open
STATUS:    Open
---

FROM:      Marketing
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Before Launch
REQUEST:   Pre-launch marketing activities requiring direct founder action:

           1. WAITLIST FORM — The coming-soon page has no email capture form,
              only a contact email. LAUNCH-TODO.md referenced Web3Forms but it
              was never implemented. Decision needed: add a Web3Forms form before
              launch, or keep email-only? If adding, share your Web3Forms access
              key with Engineering.

           2. SOCIAL MEDIA PROFILES — Instagram, LinkedIn, and Twitter/X profiles
              have not been created per LAUNCH-TODO.md. Set up @KutumbKosh (or
              best available handle) on all three before launch day.

           3. LAUNCH-DAY POSTS — Draft 3–5 posts (Instagram, LinkedIn, WhatsApp
              broadcast) using brand kit templates at
              docs/marketing/KutumbKosh-Brand-Kit-v2.pdf. Schedule in advance so
              launch day is not rushed.

           4. WAITLIST NOTIFICATION — If any subscribers signed up via the
              coming-soon page, draft a launch email and schedule it to go out
              on the same day as the production deploy.

           5. care@kutumbkosh.com — Confirm the inbox is live and monitored.
              It is the only contact point for users, grievance requests,
              and press.
DEADLINE:  Before launch day
STATUS:    Open
---

FROM:      Finance
TO:        Shubham (Founder — direct action required)
PRIORITY:  Critical — Launch Blocker
REQUEST:   The following 6 items are ALL required before KutumbKosh can legally
           accept payments. Every other Finance and Engineering payment task is
           blocked until these are complete.

           1. BUSINESS ENTITY REGISTRATION
              Register a legal entity (Pvt. Ltd. recommended for a financial trust
              product; LLP or Sole Proprietorship acceptable for soft launch).
              Register at: https://www.mca.gov.in

           2. BUSINESS CURRENT ACCOUNT
              Open a dedicated current account in the entity name at HDFC, ICICI,
              or Kotak. Required for Razorpay settlements. Cannot use a personal
              savings account for commercial transactions.

           3. GST REGISTRATION
              Register for GSTIN at https://www.gst.gov.in before accepting any
              payment. KutumbKosh's Pro subscription is a SaaS product attracting
              18% GST under SAC code 998314. Confirm SAC code with your CA.

           4. PRICING DECISION — GST-INCLUSIVE vs. EXCLUSIVE
              Confirm in writing whether ₹499/year is GST-inclusive (i.e., user
              pays ₹499 total, KutumbKosh keeps ₹423 + remits ₹76 GST) or
              GST-exclusive (user pays ₹499 + 18% = ₹589). This must be locked
              before the pricing page goes live. Finance recommendation:
              GST-inclusive for consumer clarity.

           5. RAZORPAY KYC + LIVE MODE
              Complete KYC in the Razorpay merchant dashboard and get live mode
              activated. Razorpay requires business registration documents for KYC.
              Link your business current account for settlements.

           6. ENGAGE A CA (Chartered Accountant)
              Engage a CA before the first GST filing period. CA will handle:
              monthly/quarterly GSTR-1 and GSTR-3B, advance tax (due quarterly
              from first profitable period), and annual ITR filing.

           Reference documents produced by Finance:
           - docs/FINANCE-TOS-PAYMENT-DRAFT.docx (pricing, GST, refund terms)
           - docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx (Razorpay config spec)
DEADLINE:  Before production deploy — all 6 items are hard blockers
STATUS:    Open
---

FROM:      Finance
TO:        Operations
PRIORITY:  High — Launch Blocker
REQUEST:   Finance has drafted the Payment, Subscription & Refund section of the
           Terms of Service. Operations owns legal/compliance/ToS per system-rules.
           Operations must coordinate external legal review (startup / IT lawyer)
           before the draft can be published. Finance cannot self-approve legal clauses.

           Draft file: docs/FINANCE-TOS-PAYMENT-DRAFT.docx
           (Also saved at: KutumbKosh/docs/FINANCE-TOS-PAYMENT-DRAFT.docx)

           The draft covers 10 clauses:
           1.  Subscription Plans & Pricing (Free vs Pro, ₹499/year)
           2.  Payment Processing (Razorpay as processor)
           3.  GST — SAC code 998314, 18% rate, GST-inclusive pricing
           4.  Auto-Renewal — annual cycle, 14-day reminder commitment
           5.  Refund Policy — 7-day window, eligibility conditions, method
           6.  Cancellation Policy — end-of-period access, no pro-rata refund
           7.  Failed Payments — retry + 7-day grace period before downgrade
           8.  Price Changes — 30-day advance notice required
           9.  Disputes & Chargebacks
           10. Free Plan Limits & Upgrade Prompts

           Shubham to arrange external review on:
           a) Refund clause (Clause 5) — confirm 7-day window meets any statutory
              minimum under Consumer Protection Act 2019
           b) GST treatment (Clause 3) — confirm SAC code 998314 is correct for
              SaaS with your CA / tax counsel
           c) Auto-renewal disclosure (Clause 4.2) — confirm wording satisfies
              RBI and consumer protection disclosure requirements
           d) Overall compliance with Consumer Protection (E-Commerce) Rules 2020

           Once reviewed and approved by external counsel, Shubham to integrate
           this section into the full Terms of Service and publish at
           kutumbkosh.com/terms before the first live payment is accepted.
           Closes LAUNCH-TODO.md item: "Draft and publish Terms of Service page."
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Finance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Full Razorpay go-live configuration is required before any live payment
           can be accepted. Finance has produced a detailed spec document:

           Spec file: docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx
           (Also saved at: KutumbKosh/docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx)

           CRITICAL items Engineering must complete (Finance cannot issue go-live
           clearance until all of these are confirmed):

           1. WEBHOOK SIGNATURE VERIFICATION (Section 3 of spec)
              Every incoming webhook POST must verify the X-Razorpay-Signature
              header using HMAC-SHA256 on the raw request body with
              RAZORPAY_WEBHOOK_SECRET. Use crypto.timingSafeEqual(). Reject
              unverified requests with HTTP 400. Reference implementation is
              in the spec document.
              ⚠️ Without this, a malicious actor can fake a payment.captured
              event and get Pro access for free.

           2. ALL 6 WEBHOOK EVENTS handled (Section 4 of spec):
              - payment.captured → activate Pro, generate GST invoice, send email
              - subscription.activated → store subscription_id, set status=active
              - subscription.charged → extend end_date, generate renewal invoice
              - subscription.cancelled → retain access to period end, send email
              - payment.failed → start 7-day grace period, send retry email
              - subscription.completed → downgrade to Free, set assets read-only

           3. GST-COMPLIANT INVOICE GENERATION (Section 5 of spec)
              On every payment.captured and subscription.charged event, generate
              and email a GST invoice. Razorpay's receipt is NOT a GST invoice.
              Required fields: KK GSTIN, SAC code 998314, IGST/CGST+SGST split
              based on customer state, sequential invoice number (KK-2026-0001).
              Finance will supply the invoice HTML/PDF template.

           4. DATABASE LOGGING (Section 6 of spec)
              Two tables required for Finance reconciliation and GST filing:
              - razorpay_events (full schema in spec) — all webhook events logged
              - subscriptions (required columns in spec) — includes grace_period_ends_at

           5. RENEWAL REMINDER EMAIL — 14 days before subscription.charged event

           6. FAILED PAYMENT GRACE PERIOD — 7 days after payment.failed before
              downgrade. Do NOT downgrade immediately on payment.failed.

           Also required from LAUNCH-TODO.md:
           - "Test Razorpay payment flow (Pro subscription)" — must pass all 14
             test scenarios listed in Section 7 of the spec before go-live.

           Finance go-live clearance will be issued once Engineering confirms
           all Section 3 (webhooks) and Section 7 (testing) items are complete.
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Finance
TO:        Shubham (Founder — process gap, action required)
PRIORITY:  Medium — Before any future departmental work
REQUEST:   Finance incorrectly reported the communication plan as missing.
           CORRECTION (2026-05-01): The communication plan IS defined in:
           - vault/project-knowledge/system-rules.md (departments, rule of precedence,
             handoff protocol, role isolation, session-end requirements)
           - vault/project-knowledge/chat-instructions.md (per-department scope,
             boundaries, and responsibilities)

           NO action required — this handoff was raised in error.
           Closing.
DEADLINE:  N/A
STATUS:    Closed — raised in error. Communication plan exists in system-rules.md
           and chat-instructions.md. No file needs to be created.
---

FROM:      Engineering
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Before production deploy
REQUEST:   Sentry and Plausible analytics have been wired up. Before committing,
           Shubham must:

           1. RUN NPM INSTALL
              @sentry/nextjs has been added to package.json dependencies.
              Before building or committing, run:
                npm install
              This resolves the @sentry/nextjs package and creates package-lock.json
              updates. Without this step the Vercel build will fail.

           2. SET UP SENTRY ACCOUNT
              a) Sign up at https://sentry.io (free plan is sufficient for early stage)
              b) Create a new project → select "Next.js"
              c) Copy the DSN from Project Settings → Client Keys (DSN)
              d) Set in Vercel production environment variables:
                 NEXT_PUBLIC_SENTRY_DSN=https://xxxx@oxxxxxx.ingest.sentry.io/xxxxxxx
                 SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxx  (for source map uploads)
                 SENTRY_ORG=<your-org-slug>
                 SENTRY_PROJECT=kutumbkosh-web

           3. SET UP CLOUDFLARE WEB ANALYTICS
              a) Go to Cloudflare Dashboard → Web Analytics → Add a site
              b) Enter kutumbkosh.com and copy the beacon token
              c) Set in Vercel production environment variables:
                 NEXT_PUBLIC_CF_BEACON_TOKEN=<your-beacon-token>

           IMPORTANT PRIVACY NOTES:
           - Sentry: IP addresses are stripped server-side (beforeSend in config).
             Replay is masked (maskAllText, maskAllInputs) — no vault content captured.
           - Cloudflare Web Analytics: cookieless, no personal data, DPDPA-friendly.
             The script only loads in production (NEXT_PUBLIC_APP_ENV=production).

           If NEXT_PUBLIC_SENTRY_DSN is not set, Sentry is silently disabled.
           If NEXT_PUBLIC_CF_BEACON_TOKEN is not set, analytics are silently disabled.
           Both are safe to deploy without the env vars — no crashes, no broken builds.
DEADLINE:  Before production deploy
STATUS:    Done — 2026-05-02. Sentry wired up (sentry.client.config.ts,
           sentry.server.config.ts, sentry.edge.config.ts, src/instrumentation.ts,
           next.config.mjs wrapped with withSentryConfig, tunnelRoute /monitoring,
           @sentry/nextjs added to package.json). Plausible replaced with Cloudflare
           Web Analytics (src/components/CloudflareAnalytics.tsx, CSP updated).
           PENDING (Shubham): npm install, create Sentry account + set DSN,
           get Cloudflare beacon token — see steps 1–3 above.
---

FROM:      Engineering
TO:        Shubham (review + commit)
PRIORITY:  Medium — product quality / UX polish
REQUEST:   8 product issues identified by Shubham have been fixed. Review and commit
           when satisfied. Changes across 5 files:

           1. MISSING BANKS (src/lib/asset-fields.ts)
              Added 15 missing banks to BANK_ACCOUNT suggestions: IDFC First Bank,
              Bandhan Bank, RBL Bank, AU/Jana/Ujjivan/Equitas/ESAF/Suryoday Small
              Finance Banks, South Indian Bank, Karur Vysya Bank, Dhanlaxmi Bank,
              J&K Bank, Nainital Bank, City Union Bank. Also added 6 to FIXED_DEPOSIT.

           2. VALIDATION WIRED (src/app/onboarding/page.tsx)
              Onboarding form now validates all fields on blur and on submit.
              validateFullName, validatePhone, validateDOB, validatePAN all wired up.
              FieldError component displayed under each field. Submit blocked if any
              field fails validation.

           3. FOOTER MOBILE (src/app/page.tsx)
              Footer inner div changed from flex-row to flex-col on mobile, stacking
              copyright above links. Uses flex-col sm:flex-row pattern.

           4. RECOMMENDATIONS SLIDER (src/app/page.tsx)
              "Recommended by experts" section converted from static list to
              auto-rotating carousel (5s interval). Navigation dots added below.
              Uses activeSlide state + CSS translateX transition. TESTIMONIALS array
              extracted to component scope.

           5. DOB OVERFLOW FIX (src/app/onboarding/page.tsx)
              Date of Birth input now has min-w-0 w-full to prevent overflow on
              narrow mobile screens.

           6. PAN VALIDATION (src/app/onboarding/page.tsx)
              PAN field now uses validatePAN() — inline error shown on blur and submit.
              HTML pattern attribute removed (replaced by JS validation).

           7. AMOUNT FIELDS AS NUMBER (src/lib/asset-fields.ts + dashboard/assets/add/page.tsx)
              5 amount fields changed from type "text" to type "number":
              interest_rate, sip_amount, premium_amount, emi_amount, annual_fee.
              Add asset page now renders <input type="number" min="0" step="any" />.

           8. TRUSTED CONTACTS EMPTY STATE (src/app/dashboard/page.tsx)
              Added "Manage" header button (matching Nominees card pattern) linking to
              /dashboard/emergency. Empty state replaced with CTA:
              "No trusted contacts set up yet." + "+ Add a trusted contact" link.
DEADLINE:  N/A
STATUS:    Done — 2026-05-02. All 8 fixes applied and TypeScript-verified clean
           (zero errors in product code; 2 Sentry pre-install warnings resolve
           automatically after npm install).
---

FROM:      Engineering
TO:        Finance
PRIORITY:  High — Blocks Razorpay Engineering work
REQUEST:   Engineering has reviewed the Finance → Engineering Razorpay handoff and
           is ready to begin implementation. Two items are blocking the start:

           1. SPEC FILE MISSING — docs/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx
              is referenced in the handoff but does NOT exist in the repo.
              The docs/ directory does not exist. Finance must place the spec file
              at that path before Engineering can implement webhook handler,
              DB schema, invoice template, or run the 14 test scenarios.

           2. LIVE RAZORPAY KEYS — Webhook signature verification and the full
              test suite require Shubham to complete Razorpay KYC + live mode
              activation first (Finance prerequisite item 5). Engineering can
              build the code against test keys, but cannot confirm production
              behaviour without live keys.

           Engineering can begin Steps 1–2 independently (Sentry + analytics)
           and will start webhook implementation as soon as the spec file is
           available. Please place the spec file and invoice HTML/PDF template
           in the repo and update this handoff.
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  Medium — Post-Launch
REQUEST:   Integrate Core Web Vitals monitoring from launch day.

           Add the web-vitals npm package to the Next.js app:
             npm install web-vitals

           Send metrics to Google Analytics 4 (or a logging endpoint):
             import { onCLS, onINP, onLCP } from 'web-vitals';
             onCLS(console.log); onINP(console.log); onLCP(console.log);

           Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.
           Core Web Vitals are a confirmed Google ranking signal.

           Reference: https://nextjs.org/docs/app/building-your-application/optimizing/analytics
DEADLINE:  First week after production launch
STATUS:    Open
---

FROM:      Marketing
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Before Launch
REQUEST:   Set up Google Search Console for kutumbkosh.com.

           Steps:
           1. Go to https://search.google.com/search-console
           2. Add property: https://kutumbkosh.com
           3. Verify ownership (recommended: DNS TXT record via Cloudflare)
           4. Once Engineering deploys sitemap.xml, submit it at:
              Search Console → Sitemaps → Enter: sitemap.xml

           Also add to Bing Webmaster Tools:
           https://www.bing.com/webmasters

           Reason: Without Search Console, there is zero visibility into crawl
           errors, indexation status, or keyword impressions. This is the
           foundational monitoring tool for all SEO work going forward.
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Product
TO:        Engineering
PRIORITY:  High — Required before public launch
REQUEST:   Mandatory field validation must be added across three forms. Each
           form has different rules — do not apply the same logic to all.

           Full spec: docs/PRODUCT-MANDATORY-FIELDS-ENGINEERING-HANDOFF.docx

           Summary of changes required:

           PROFILE SETUP FORM
           - Mobile Number: mandatory, 10-digit Indian number, OTP verified
           - Date of Birth: mandatory, user must be 18+ (show error if not)
           - Email: pre-filled from Supabase Auth, read-only (lock the field)
           - Name: already mandatory — no change needed

           NOMINEE FORM
           - Relationship: mandatory (dropdown — spouse, child, parent,
             sibling, grandchild, grandparent, in_law, other)
           - Mobile + Email: individually optional, but at least ONE required
             (validate on submit: "Please provide at least one contact method")
           - If Date of Birth entered and age < 18: show Guardian Name
             (mandatory) and Guardian Mobile (mandatory) dynamically

           TRUSTED CONTACT FORM
           - Relationship: mandatory (same dropdown as nominee)
           - Mobile Number: mandatory (no conditional rule — both required)
           - Email: mandatory (no conditional rule — both required)
           Note: Both mobile AND email are hard mandatory here — not "at least
           one." This is a deliberate Product decision for emergency reliability.

           DATABASE CHANGES REQUIRED
           profiles table: add mobile_number (text), mobile_verified (boolean,
           default false), date_of_birth (date), profile_complete (boolean,
           default false)
           nominees table: add relationship (text NOT NULL), mobile_number
           (text), email (text), date_of_birth (date), guardian_name (text),
           guardian_mobile (text)
           trusted_contacts table: add relationship (text NOT NULL),
           mobile_number (text NOT NULL), email (text NOT NULL)

           OTP: Profile Setup only. Provider: Supabase Phone Auth or MSG91.
           Set mobile_verified = true after successful OTP. Profile is not
           complete until mobile_verified = true.

           See spec doc for full validation rules, UI/UX notes, and DB
           migration guidance.
DEADLINE:  Before public launch
STATUS:    Open
---

FROM:      Product
TO:        Engineering
PRIORITY:  High — Required before public launch
REQUEST:   Assign a unique Kutumb ID (format: KK-XXXXXX) to every registered
           user at signup. This has DB, generation, and display requirements.

           Full spec: docs/PRODUCT-KUTUMB-ID-ENGINEERING-HANDOFF.docx

           WHAT IT IS
           A unique human-readable identifier for every vault holder.
           Example: KK-A4B7C2. Not a vanity feature — it has direct
           functional dependencies on support and emergency access flows.

           FORMAT
           Prefix "KK-" followed by 6 uppercase alphanumeric characters.
           Charset: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (excludes 0, 1, O, I
           to prevent visual ambiguity in print and handwriting).
           Over 1 billion possible unique IDs.

           DATABASE
           Add kutumb_id column to profiles table: text, NOT NULL, UNIQUE,
           indexed. Generate at signup. Immutable — users cannot change it.
           RLS: readable by the row owner, service role, and admin role.
           If existing users are present, backfill before applying NOT NULL.

           GENERATION LOGIC
           Generate random 6-char string from allowed charset + prepend
           "KK-". Check uniqueness against profiles table. Retry on
           collision (collision probability is negligible). Can be done at
           app layer or via Postgres trigger — either is acceptable.

           WHERE IT MUST BE DISPLAYED (all required at launch)
           1. Profile page — show "Your Kutumb ID: KK-XXXXXX" with a
              copy-to-clipboard button. Add tooltip: "Quote this when
              contacting support."
           2. Vault Dossier PDF export — print in header or footer as
              "Vault ID: KK-XXXXXX"
           3. Emergency Access UI — add input field "Enter the vault
              holder's Kutumb ID" (UI only at launch; backend logic is
              a future feature)

           See spec doc for reference TypeScript implementation, migration
           SQL, RLS policy guidance, and full implementation checklist.
DEADLINE:  Before public launch
STATUS:    Open
---

---

## Completed Handoffs

FROM:      Security
TO:        Engineering
PRIORITY:  CRITICAL — Launch Blocker
REQUEST:   Fix admin-views.sql (wrong admin email, missing log_admin_access function and PERFORM audit calls) and schema.sql (missing admin_access_log table).
DEADLINE:  Before production deploy
STATUS:    Done — Fixed 2026-05-01. admin-views.sql: is_admin() now uses shubham.git@gmail.com; log_admin_access() function added; PERFORM audit calls added to admin_overview_metrics() and admin_user_list(). schema.sql: admin_access_log table + RLS + indexes appended at bottom (section 10). Shubham SQL handoff is now UNBLOCKED.
---

FROM:      Security
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Fix vercel.json noindex rule — wrong host pattern and missing nofollow.
DEADLINE:  Before any next Vercel deploy
STATUS:    Done — Fixed 2026-05-01. Host pattern changed from .*staging.* to .*\.vercel\.app; value changed from noindex to noindex, nofollow.
---

FROM:      Security
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   Add UPDATE RLS policy on referrals table in channels.sql so Razorpay verify route can track conversions.
DEADLINE:  Before launch day
STATUS:    Done — Fixed 2026-05-01. "Users can mark own referral as converted" UPDATE policy added to channels.sql. Also run this policy in Dev, Staging, and Production SQL editors.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Verify robots.txt and create sitemap.xml (app/sitemap.ts).
DEADLINE:  Before production deploy
STATUS:    Done — 2026-05-01. public/robots.txt confirmed: no blanket Disallow, allows all crawlers, points to sitemap. src/app/sitemap.ts created using Next.js MetadataRoute API, includes homepage. Note: Shubham must submit sitemap.xml to Google Search Console once live.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Before Launch
REQUEST:   Add correct SEO title, meta description, Open Graph and Twitter Card tags to app/layout.tsx.
DEADLINE:  Before launch day
STATUS:    Done — Fixed 2026-05-01. layout.tsx updated: title, meta description, openGraph, twitter:card all added. Note: og-image.png still needs to be created by Marketing.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   Add canonical tags to all pages.
DEADLINE:  Before launch day
STATUS:    Done — Fixed 2026-05-01. alternates.canonical added to layout.tsx metadata export.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Fix DPDPA compliance claims in coming-soon/index.html.
DEADLINE:  Before coming-soon page is uploaded to Cloudflare Pages
STATUS:    Done — coming-soon/index.html updated. Implemented 2026-04-30.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Account deletion flow: send Resend confirmation email after deletion.
DEADLINE:  Before production deploy
STATUS:    Done — sendDeletionConfirmationEmail() added. Implemented 2026-04-30.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   /security page: add Internal Access Controls section; add Grievance Officer footer link.
DEADLINE:  Before production deploy
STATUS:    Done — Implemented 2026-04-30.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Add noindex header to Vercel staging / preview deployments.
DEADLINE:  Before production deploy
STATUS:    Done (re-fixed by Security 2026-05-01).
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Before Launch
REQUEST:   Add JSON-LD Organization schema to homepage.
DEADLINE:  Before launch day
STATUS:    Done — Organization schema added to src/app/layout.tsx. 2026-05-01.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   Fix manifest.json branding.
DEADLINE:  Before production deploy
STATUS:    Done — All 3 fields updated in public/manifest.json.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Full codebase DPDPA language scan — 9 violations across 6 files.
DEADLINE:  Before production deploy
STATUS:    Done — All 9 violations fixed 2026-04-30.
---
