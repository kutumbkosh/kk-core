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
ID:        1
---

FROM:      Engineering
TO:        Shubham (Founder — decision required before Engineering can proceed)
PRIORITY:  High — Required before mobile verification can be enabled
REQUEST:   Mobile OTP verification for Profile Setup is currently NOT active.
           The DB column (mobile_verified) exists and is set to false for all
           users. The profile saves correctly without OTP.

           To activate OTP verification, Shubham must first:

           1. CHOOSE AN SMS PROVIDER
              Option A: Twilio (global, most Supabase-documented)
                - Sign up at https://www.twilio.com
                - Get Account SID, Auth Token, and a phone number
              Option B: MSG91 (India-focused, lower cost for Indian numbers)
                - Sign up at https://msg91.com
                - Get API key and sender ID

           2. CONFIGURE IN SUPABASE DASHBOARD
              Go to: Project Settings → Auth → Phone
              Enable Phone provider, select Twilio or MSG91, enter credentials.

           3. CONFIRM GO-AHEAD TO ENGINEERING
              Once provider is set up and tested, confirm here. Engineering will
              then add the two-step OTP flow back to src/app/onboarding/page.tsx.
              Estimated effort: 2–3 hours once provider is live.

           CURRENT STATE: Profile Setup works end-to-end without OTP.
           mobile_verified = false for all users until this is enabled.
DEADLINE:  Before public launch (mobile verification is a trust signal for a
           financial vault, but not a hard blocker for internal testing)
STATUS:    BLOCKED — awaiting Shubham's SMS provider decision and setup
ID:        2
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
ID:        3
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
ID:        4
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
           Note: og-image.png IS present in repo at public/og-image.png (51KB, confirmed
           2026-05-04 via mid-review audit). Earlier note claiming "file missing" was
           incorrect — Engineering glob pattern missed the file. File is ready.
           Note: Shubham must commit public/og-image.png, deploy, and re-upload
           coming-soon/index.html to Cloudflare Pages, then validate at opengraph.xyz.
ID:        5
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
ID:        6
---

FROM:      Sales & Marketing
TO:        Tech
PRIORITY:  High — Before Launch
REQUEST:   "How KutumbKosh Works" infographic — implement in landing page and app.

           Marketing has designed and delivered the 6-step visual. The design
           file is at:
             docs/marketing/how-it-works-infographic.html

           The file is self-contained HTML/CSS with inline implementation notes.
           Read the yellow dev-notes box at the top before embedding.

           ACTION REQUIRED — implement in two places:

           1. coming-soon/index.html (Cloudflare Pages — live URL)
              Place the .hiw-section block after the hero/waitlist section,
              before the features grid.
              After updating, re-upload to Cloudflare Pages.

           2. src/app/page.tsx (Next.js app — Vercel)
              Extract the section as a <HowItWorks /> React component.
              Use Tailwind classes instead of the inline CSS where possible.
              Poppins font is already loaded — no new dependency.

           LOCKED STEP CONTENT (do not alter copy — per DECISIONS.md 2026-05-02):
             Step 1: Create your vault — "Set up your profile in minutes"
             Step 2: Add every asset — "Bank accounts, insurance, FDs, property and more"
             Step 3: Link your nominees — "Assign the right person to each asset"
             Step 4: Add a trusted contact — "Someone you trust to act on your behalf"
             Step 5: Export your vault dossier — "A complete record your family can refer to anytime"
             Step 6: Your family is never left guessing — "If the unexpected happens,
                     your trusted contact gets access — instantly"

           BRAND CONSTRAINTS:
             - Colours: #2563EB (primary), #1E40AF (dark), #DBEAFE (light), #16A34A (step 6 green)
             - Font: Poppins only
             - Step 6 uses positive framing — no fear-based language per DECISIONS.md
             - Static only — no animation at launch

           LAYOUT:
             - Desktop: horizontal 6-column grid with connector line
             - Mobile: vertical stack with left-side connector line
             - Reference design in docs/marketing/how-it-works-infographic.html
DEADLINE:  Before launch day
STATUS:    Done — 2026-05-03. Tech implementation complete in both surfaces.

           coming-soon/index.html: New .hiw-section added BEFORE the features
           section (per handoff spec). CSS uses .hiw-* classes to avoid conflicts.
           Marketing design faithfully implemented: 80px circle badges, step-number
           overlay badge (top-right), connector line (top:40px, gradient). Step 6
           uses green (#16A34A) border, background (#F0FDF4), and icon stroke.
           Mobile: vertical stack with left-side connector line (left:39px).
           Old 3-step section removed.

           src/app/page.tsx: Implemented as <HowItWorks /> component at
           src/components/HowItWorks.tsx. Marketing's custom SVG icons used
           verbatim. Connector line and mobile layout handled via scoped <style>
           tag in the component. Inserted between </main> and <footer>.
           TypeScript clean (0 product errors).
ID:        7
---

FROM:      Sales & Marketing
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Before Launch
REQUEST:   Pre-launch marketing activities requiring direct founder action:

           1. WAITLIST FORM — The coming-soon page has no email capture form,
              only a contact email. LAUNCH-TODO.md referenced Web3Forms but it
              was never implemented. Decision needed: add a Web3Forms form before
              launch, or keep email-only? If adding, share your Web3Forms access
              key with Engineering.
              Note (2026-05-04 mid-review): The project brief previously described
              Web3Forms as "live" — this was inaccurate. Web3Forms is NOT implemented.
              The decision and any implementation remain open.

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

           5. care@kutumbkosh.com — ✅ CONFIRMED live and monitored (2026-05-04,
              Shubham). It is the only contact point for users, grievance
              requests, and press. No action required on this item.
DEADLINE:  Before launch day
STATUS:    Open
ID:        8
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
           - docs/finance/FINANCE-TOS-PAYMENT-DRAFT.docx (pricing, GST, refund terms)
           - docs/finance/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx (Razorpay config spec)
DEADLINE:  Before production deploy — all 6 items are hard blockers
STATUS:    Open
ID:        9
---

FROM:      Finance
TO:        Operations
PRIORITY:  High — Launch Blocker
REQUEST:   Finance has drafted the Payment, Subscription & Refund section of the
           Terms of Service. Operations owns legal/compliance/ToS per system-rules.
           Operations must coordinate external legal review (startup / IT lawyer)
           before the draft can be published. Finance cannot self-approve legal clauses.

           Draft file: docs/finance/FINANCE-TOS-PAYMENT-DRAFT.docx
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
ID:        10
---

FROM:      Finance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Full Razorpay go-live configuration is required before any live payment
           can be accepted. Finance has produced a detailed spec document:

           Spec file: docs/finance/FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx
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
ID:        11
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
ID:        12
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
ID:        13
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
ID:        14
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
ID:        15
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
ID:        16
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
ID:        17
---

FROM:      Product
TO:        Engineering
PRIORITY:  High — Required before public launch
REQUEST:   Mandatory field validation must be added across three forms. Each
           form has different rules — do not apply the same logic to all.

           Full spec: docs/product/PRODUCT-MANDATORY-FIELDS-ENGINEERING-HANDOFF.docx

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
STATUS:    Done — 2026-05-02. All mandatory field validation implemented.

           DB MIGRATION: supabase/migrations/20260502_mandatory_fields_and_kutumb_id.sql
           covers all three tables — profiles (mobile_number, mobile_verified,
           date_of_birth, profile_complete), nominees (email, guardian_name,
           guardian_mobile; relation CHECK extended to 8 lowercase values),
           trusted_contacts (contact_phone + contact_email SET NOT NULL).

           PROFILE SETUP (src/app/onboarding/page.tsx): Single-step form.
           Mobile mandatory with 10-digit Indian validation. DOB mandatory with
           exact 18+ check (month/day precise). Profile saved with
           mobile_verified=false, profile_complete=true. OTP verification was
           built but reverted (2026-05-02) — SMS provider decision was an open
           blocker and should not have been built through. See open handoff below:
           "Engineering → Product/Shubham: OTP mobile verification — BLOCKED".

           NOMINEE FORM (src/app/dashboard/nominees/add/page.tsx): Full rewrite.
           Relationship uses 8-option card grid (spouse/child/parent/sibling/
           grandchild/grandparent/in_law/other). Contact section: mobile and email
           individually optional, but at-least-one enforced on submit. Minor
           guardian fields (name + mobile, both mandatory) shown dynamically when
           DOB entered and calculateAge(dob) < 18.

           TRUSTED CONTACT FORM (src/app/onboarding/emergency-contact/page.tsx):
           Full rewrite. Both mobile AND email are hard mandatory (deliberate
           Product decision). Relationship uses same 8-option dropdown.

           VALIDATION LIBRARY (src/lib/validations.ts): Added validateMobileRequired,
           validateMobileOptional, normaliseMobile, validateDOBMandatory,
           calculateAge, validateRelationshipDropdown.

           PENDING (Shubham): OTP flow requires Supabase Phone Auth with an SMS
           provider (Twilio or MSG91) configured in the Supabase Dashboard. Until
           a provider is set, the OTP step will return an error. Decision on SMS
           provider is open — Engineering defaults to Supabase Phone Auth + Twilio
           unless Shubham specifies otherwise.
ID:        18
---

FROM:      Product
TO:        Engineering
PRIORITY:  High — Required before public launch
REQUEST:   Unique Kutumb ID feature for every user vault.

           Full spec: docs/product/PRODUCT-KUTUMB-ID-ENGINEERING-HANDOFF.docx

           Summary:

           FORMAT: KK-XXXXXX (prefix "KK-" + 6 alphanumeric characters)
           CHARSET: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
           (Excludes 0, 1, O, I to prevent misreading)
           GENERATION: Server-side Postgres function with collision retry.

           DATABASE CHANGES:
           - Add kutumb_id column to profiles table (text NOT NULL UNIQUE)
           - Backfill existing users with generated IDs
           - Add generate_kutumb_id() Postgres function (retry on collision)
           - Add RLS policy: users can read their own kutumb_id only

           DISPLAY SURFACES:
           1. Settings/Profile page — show Kutumb ID with copy-to-clipboard button
           2. Vault Dossier PDF — print Kutumb ID in the PDF header
           3. Emergency Access UI — input field for "Enter Kutumb ID" to look
              up a vault (backend access logic is a future feature — UI only
              for now)

           CLIENT-SIDE UTILITY:
           - Add src/lib/kutumb-id.ts with formatKutumbId() helper

           See spec doc for full DB migration SQL, TypeScript reference
           implementation, and RLS policy.
DEADLINE:  Before public launch
STATUS:    Done — 2026-05-02. generate_kutumb_id() Postgres function added
           (charset excludes 0/1/O/I, retry on collision). kutumb_id column
           added to profiles (NOT NULL UNIQUE, backfilled for existing users
           via migration). Displayed in Settings with copy-to-clipboard.
           Printed in Vault Dossier PDF header. Emergency Access UI has
           Kutumb ID input field (backend logic deferred to post-launch).
           src/lib/kutumb-id.ts added for client-side use.
           DB migration: supabase/migrations/20260502_mandatory_fields_and_kutumb_id.sql
ID:        19
---

FROM:      Product
TO:        Engineering
PRIORITY:  High — Required before public launch
REQUEST:   Three UX issues found on the Emergency Access dashboard page
           (src/app/dashboard/emergency/page.tsx). All three must be fixed.

           --- ISSUE 1: NO DELETE OPTION FOR TRUSTED CONTACTS ---

           Current state: handleContactStatusChange() only handles ACTIVE and
           REVOKED transitions. There is no way for a user to permanently remove
           a trusted contact from their vault.

           Required change:
           a) Add deleted_at (timestamptz, nullable) column to trusted_contacts
              table in Supabase. No new migration file needed — add to existing
              or create a small patch migration.
           b) Add a RLS-compliant UPDATE policy allowing users to set deleted_at
              on their own trusted_contacts rows.
           c) Filter all queries on this page (and anywhere trusted_contacts is
              queried) with: .is("deleted_at", null) so deleted contacts are
              excluded from all reads.
           d) Add a "Remove" button (use Trash2 icon from lucide-react) to each
              contact card. On click, show an inline confirmation ("Are you sure?
              This will remove [Name] as a trusted contact.") before executing.
              On confirm, set deleted_at = now() — do NOT hard delete the row.

           Reason for soft delete: preserves audit trail, consistent with
           zero-routine-access policy, allows future recovery if needed.

           --- ISSUE 2: WARNING BADGE FOR CONTACTS WITH MISSING CONTACT INFO ---

           Current state: Line ~217 in emergency/page.tsx shows a silent
           fallback: contact.contact_email || contact.contact_phone || "No contact info"
           Users don't realise there's a data gap that affects emergency reachability.

           Required change:
           If a contact card has BOTH contact_email and contact_phone as null/empty,
           show an amber warning badge on that card:
             <span class="...amber badge...">⚠ Missing contact info</span>
           Style: amber background (bg-amber-100), amber border (border-amber-300),
           amber text (text-amber-800), small (text-xs), rounded pill, displayed
           below the relation line.

           Note: Per Product decision, both phone AND email are hard mandatory in
           the onboarding form (emergency-contact/page.tsx). However, records added
           before this enforcement may have gaps. The badge is a dashboard-level
           safeguard for those legacy records — do not remove the form-level
           mandatory validation.

           --- ISSUE 3: FIX TOGGLE UX — REPLACE HOVER-ONLY ICON BUTTONS ---

           Current state: The re-activate button uses RefreshCw icon (looks like
           page reload, not re-activation) with opacity-0 group-hover:opacity-100
           (invisible on mobile, confusing on desktop). Approve/Revoke buttons
           are also hidden behind hover state.

           Required change — replace all three action buttons with always-visible
           labeled pill buttons:

           PENDING contact:
             [✓ Approve]  — CheckCircle2 icon, green style
             (No revoke needed for PENDING — Approve or ignore)

           ACTIVE contact:
             [Shield Off  Revoke Access]  — ShieldOff icon, red/outline style

           REVOKED contact:
             [Shield Check  Restore Access]  — ShieldCheck icon, blue/outline style

           Remove all opacity-0 / group-hover:opacity-100 patterns from this page.
           Buttons must be visible at all times, including on mobile.

           Use consistent pill button style:
           - Approve: bg-green-50 text-green-700 border border-green-200
           - Revoke Access: bg-red-50 text-red-700 border border-red-200
           - Restore Access: bg-blue-50 text-blue-700 border border-blue-200
           All: text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5
DEADLINE:  Before public launch
STATUS:    Done — 2026-05-05. All three UX fixes implemented on
           src/app/dashboard/emergency/page.tsx:
           (1) Soft delete: Trash2 button + inline confirmation; deleted_at
               filter on all trusted_contacts queries; DB migration at
               supabase/migrations/20260505_trusted_contacts_soft_delete.sql.
           (2) Warning badge: amber pill shown on contact card when both
               contact_phone and contact_email are null/empty.
           (3) Always-visible pill buttons: PENDING→Approve (green, CheckCircle2),
               ACTIVE→Revoke Access (red, ShieldOff), REVOKED→Restore Access
               (blue, ShieldCheck). All hover-only opacity patterns removed.
ID:        20
---

FROM:      Engineering
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Required to fix "Other" relationship selection bug
REQUEST:   Run DB migration supabase/migrations/20260504_relation_other.sql in
           Supabase SQL Editor. Run staging first, then production.
           Migration adds: relation_other TEXT column to nominees and
           trusted_contacts — required for "Other" relationship bug fix
           shipped 2026-05-04.
DEADLINE:  Immediate
STATUS:    Done — 2026-05-05. Shubham confirmed migration run on both
           staging and production Supabase environments.
ID:        21
---

FROM:      Engineering
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Required for soft-delete feature to function
REQUEST:   Run DB migration supabase/migrations/20260505_trusted_contacts_soft_delete.sql
           in Supabase SQL Editor. Run staging first, then production.
           Migration adds: deleted_at TIMESTAMPTZ column to trusted_contacts,
           RLS UPDATE policy for soft delete, partial index for performance.
DEADLINE:  Immediate
STATUS:    Done — 2026-05-05. Shubham confirmed migration executed on both
           staging and production Supabase environments.
ID:        22
---

---
## Mid-Review Handoffs — 2026-05-04 (Shubham)
---

FROM:      Shubham - Mid Review
TO:        Product
PRIORITY:  High — Before pricing page and upgrade prompts go live
REQUEST:   Free vs Pro feature scope is inconsistently defined across project files.
           The project brief lists Free tier as "up to 3 assets, basic reminders,
           nominee linking, vault dossier PDF" but "basic reminders" is not defined
           anywhere. Product must:
           1. Define exactly which reminder types are Free vs Pro. Currently known
              Pro reminders: insurance expiry, FD maturity, vault review nudges.
              Are any reminders available on Free? If yes, which ones?
           2. Confirm whether Emergency Access (trusted contacts) is a Free or Pro
              feature — currently unspecified in all project docs.
           3. Confirm whether the Vault Dossier PDF export is fully available on
              Free, or limited in some way (e.g., exports only 3 assets).
           4. Document the confirmed tier map in DECISIONS.md and update the
              project brief so all departments work from the same definition.
           This directly impacts: upgrade prompt copy, pricing page, Engineering
           feature gates (useSubscription hook), and Sales & Marketing copy.
DEADLINE:  Before pricing page goes live
STATUS:    Open
ID:        23
---

FROM:      Shubham - Mid Review
TO:        Product
PRIORITY:  High — Before landing page copy is finalised
REQUEST:   Emergency Access workflow is ambiguous. The landing page infographic
           Step 6 says "your trusted contact gets access — instantly" — implying
           automation. But the current implementation is UI-only; the actual backend
           access logic is deferred post-launch (confirmed in Kutumb ID Done note,
           HANDOFFS.md). Product must:
           1. Define what "getting access" means in the current launch state.
              Is the flow: user manually exports and shares dossier PDF with trusted
              contact? Or is there a system-triggered notification?
           2. If it is manual, update Step 6 copy on the landing page so it does
              not over-promise automation. Raise a Sales & Marketing handoff with
              the corrected copy.
           3. Write a brief post-launch spec for the actual automated emergency
              access flow (what triggers it, what the trusted contact receives,
              how access is time-limited or revoked).
           This affects landing page copy (Sales & Marketing), product trust, and
           user expectation-setting at onboarding.
DEADLINE:  Before launch day
STATUS:    Open
ID:        24
---

FROM:      Shubham - Mid Review
TO:        Product
PRIORITY:  Medium — Before pricing page and Free tier onboarding are finalised
REQUEST:   Vault Dossier PDF scope for Free tier is undefined. The project brief
           lists "vault dossier PDF" as a Free tier feature, but it is unclear:
           1. Does the PDF export all assets a Free user has added (max 3)?
           2. Is the PDF template identical for Free and Pro users?
           3. Are any sections of the PDF gated on Pro (e.g., nominee summary,
              emergency instructions page, Kutumb ID header)?
           This must be confirmed before the pricing page copy and Free vs Pro
           comparison table are written, and before upgrade prompts reference
           the PDF as a Free feature.
DEADLINE:  Before pricing page goes live
STATUS:    Open
ID:        25
---

FROM:      Shubham - Mid Review
TO:        Operations
PRIORITY:  High — Compliance risk (file has been reverted twice already)
REQUEST:   coming-soon/index.html has been reverted to non-compliant DPDPA language
           twice (2026-04-30 and 2026-05-01). Engineering re-fixed it both times.
           There is no process preventing a third revert. Operations must:
           1. Create a compliance-sensitive files list. Minimum scope:
              - coming-soon/index.html (DPDPA language on lines ~964, ~965, ~1017, ~1018)
              - src/app/privacy/page.tsx
              - Supabase Auth email templates (magic-link.html, confirm-signup.html)
           2. Write a mandatory pre-upload checklist step for coming-soon/index.html:
              "Before re-uploading to Cloudflare Pages, verify DPDPA language
              against DECISIONS.md entries dated 2026-04-28 and 2026-04-30."
           3. Recommend adding a comment block at the top of coming-soon/index.html
              listing compliance-sensitive lines and the approved replacement text,
              so any editor knows what must be preserved.
           Raise an Engineering handoff if code changes are required.
DEADLINE:  Before next coming-soon/index.html upload to Cloudflare Pages
STATUS:    Open
ID:        26
---

FROM:      Shubham - Mid Review
TO:        Operations
PRIORITY:  High — Launch Blocker (must be live before first production user)
REQUEST:   Full Privacy Policy and non-payment Terms of Service sections have not
           been drafted. LAUNCH-TODO.md marks both as NOT DONE.
           Finance has drafted only the Payment, Subscription & Refund section of
           the ToS (docs/FINANCE-TOS-PAYMENT-DRAFT.docx).
           Operations must:
           1. Draft a full Privacy Policy for /privacy covering: categories of data
              collected, purpose and legal basis, storage location (Supabase,
              India-region), retention periods, user rights (access, correction,
              erasure), grievance mechanism, DPDPA 2023 alignment, and contact info.
           2. Draft the non-payment sections of the Terms of Service (account
              eligibility, acceptable use, intellectual property, disclaimers,
              limitation of liability, governing law, dispute resolution).
           3. Integrate Finance's Payment/Subscription/Refund draft into the full ToS.
           4. Send both documents to external legal counsel (startup/IT lawyer) for
              review before publishing.
           5. Publish at /privacy and /terms before the first user signs up on
              production. Existing page routes already exist (src/app/privacy/ and
              src/app/terms/).
DEADLINE:  Before production deploy
STATUS:    Open
ID:        27
---

FROM:      Shubham - Mid Review
TO:        Operations
PRIORITY:  Medium — Before production deploy
REQUEST:   Cookie consent banner has no owner, no Engineering task, and no draft.
           Operations must:
           1. Assess whether a cookie consent banner is legally required given
              KutumbKosh's current stack. Known cookie usage:
              - Cloudflare Web Analytics: cookieless, no consent required.
              - Supabase: sets session/auth cookies for logged-in users.
              - Razorpay: may set third-party cookies during checkout flow.
           2. If consent is required: write the banner copy in KutumbKosh brand
              voice, define accept/decline behaviour, and raise an Engineering
              handoff to implement it before production deploy.
           3. If consent is NOT required for the current stack: document the
              rationale in DECISIONS.md to close this item permanently.
DEADLINE:  Before production deploy
STATUS:    Open
ID:        28
---

FROM:      Shubham - Mid Review
TO:        Engineering
PRIORITY:  High — Compliance requirement (DECISIONS.md 2026-04-28)
REQUEST:   DECISIONS.md (2026-04-28, Legal) requires Engineering to publish a
           /grievance page linked from the /privacy footer. No handoff has
           confirmed this page was ever built or verified.
           Engineering must:
           1. Check if a /grievance route exists at src/app/grievance/.
           2. If it does NOT exist, create a simple static page at /grievance
              containing:
              - Grievance Officer: Shubham (Founder)
              - Contact: care@kutumbkosh.com
              - Acknowledgement SLA: 48 hours
              - Resolution SLA: 30 days
              - Submission method: mailto link to care@kutumbkosh.com with
                subject pre-filled as "Grievance: [Brief Description]"
           3. Confirm the /privacy page footer links to /grievance.
           4. Update DECISIONS.md 2026-04-28 with confirmation that /grievance
              is live, and mark this handoff Done.
DEADLINE:  Before production deploy
STATUS:    Open
ID:        29
---

FROM:      Shubham - Mid Review
TO:        Operations
PRIORITY:  Medium — Before ToS is published
REQUEST:   Consumer Protection Act 2019 compliance review is unresolved. The Finance
           ToS draft (docs/FINANCE-TOS-PAYMENT-DRAFT.docx) proposes a 7-day refund
           window (Clause 5) and an auto-renewal disclosure (Clause 4.2).
           Operations must:
           1. Confirm with external legal counsel whether the 7-day refund window
              meets or exceeds any statutory minimum under the Consumer Protection
              Act 2019 and Consumer Protection (E-Commerce) Rules 2020 for SaaS
              annual subscriptions.
           2. Confirm whether the auto-renewal wording in Clause 4.2 satisfies RBI
              and consumer protection disclosure requirements.
           3. Relay findings to Finance to update the draft accordingly before the
              ToS is published at /terms.
DEADLINE:  Before ToS is published (pre-production deploy)
STATUS:    Open
ID:        30
---

FROM:      Shubham - Mid Review
TO:        Shubham (Founder — action required before next Vercel deploy)
PRIORITY:  High — Vercel build will fail without this
REQUEST:   @sentry/nextjs was added to package.json (Done 2026-05-02) but
           `npm install` has not been run since. The package-lock.json is out of
           sync with package.json.
           Action required:
           1. In the vault/ project directory, run: npm install
           2. This resolves @sentry/nextjs and updates package-lock.json.
           3. Commit the updated package-lock.json along with any other pending
              changes before the next Vercel deploy.
           Without this step the Vercel production build will fail.
DEADLINE:  Before next Vercel deploy
STATUS:    Open
ID:        31
---

FROM:      Shubham - Mid Review
TO:        Engineering
PRIORITY:  Medium — Before production deploy
REQUEST:   Resend transactional email provider is not configured. README.md lists
           RESEND_API_KEY as a production variable. Without it, all transactional
           emails (magic link login, subscription confirmation, 14-day renewal
           reminder, failed payment notification) will use Supabase's default email
           sender — which is rate-limited (4/hour on free tier) and unbranded.
           Engineering must:
           1. Confirm which transactional emails currently go through Supabase
              default vs. a custom provider.
           2. Set up a Resend account at https://resend.com, verify the
              kutumbkosh.com domain, and obtain the API key.
           3. Configure Resend as the email provider — either via Supabase Dashboard
              → Auth → SMTP (for magic links) or via Next.js API routes (for
              subscription and payment emails).
           4. Test all email types in staging: magic link, subscription confirmation,
              renewal reminder, failed payment.
           5. Add RESEND_API_KEY to Vercel production environment variables.
           6. Raise a handoff to Shubham to supply the API key if account creation
              requires founder credentials.
DEADLINE:  Before production deploy
STATUS:    Open
ID:        32
---

FROM:      Shubham - Mid Review
TO:        Shubham (Founder — decision required, critical pricing dependency)
PRIORITY:  Critical — Pricing page and Razorpay order amount cannot be finalised without this
REQUEST:   GST treatment for ₹499/year Pro subscription is undecided. DECISIONS.md
           locks the price at ₹499/year but explicitly defers the GST treatment.
           This single decision blocks: (1) pricing page copy, (2) Razorpay order
           amount in Engineering, (3) GST invoice template (CGST+SGST vs IGST split).
           Options:
           Option A — GST-inclusive (Finance recommendation):
             User pays ₹499 total. KutumbKosh keeps ₹423.73 + remits ₹75.27 GST.
             Simpler for the consumer; no surprise at checkout.
           Option B — GST-exclusive:
             User pays ₹499 + 18% = ₹589 total. Higher gross per transaction.
             Less common for consumer SaaS in India.
           Action: Confirm your decision in a reply, then Finance will update
           DECISIONS.md and Engineering will set the Razorpay order amount.
DEADLINE:  Before pricing page goes live
STATUS:    Open
ID:        33
---

FROM:      Shubham - Mid Review
TO:        Shubham (Founder — action required with CA)
PRIORITY:  High — Required before GST registration
REQUEST:   SAC code 998314 has been used throughout Finance documents as the GST
           classification for KutumbKosh's Pro subscription (SaaS). This code has
           not been formally confirmed by a CA. An incorrect SAC code affects:
           (1) the applicable GST rate (18% assumed), (2) IGST vs CGST+SGST
           split on invoices, and (3) all future GSTR filings.
           Action required:
           1. Share the KutumbKosh product description with your CA.
           2. Get written confirmation that SAC code 998314 is correct for a SaaS
              digital vault annual subscription.
           3. Record the CA's confirmation in DECISIONS.md with the date.
DEADLINE:  Before GST registration
STATUS:    Open
ID:        34
---

FROM:      Shubham - Mid Review
TO:        Finance
PRIORITY:  Low — Post-launch planning item
REQUEST:   Monthly billing is excluded at launch (DECISIONS.md 2026-04-28: annual
           only, no monthly option). No post-launch plan or evaluation exists.
           Finance must:
           1. Evaluate whether a monthly billing option makes sense post-launch for
              user acquisition (e.g., ₹59/month = ₹708/year effective, or ₹49/month
              = ₹588/year) — lower barrier to trial, higher annual effective rate.
           2. If recommended, assess Razorpay subscription plan configuration
              changes required and the GST/invoice impact.
           3. Add a post-launch roadmap item to DECISIONS.md or a product roadmap
              doc so this is tracked rather than lost.
           No action required before launch.
DEADLINE:  First post-launch review (no rush)
STATUS:    Open
ID:        35
---
