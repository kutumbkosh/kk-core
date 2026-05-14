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

FROM:      Engineering
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
STATUS:    In Progress — Operations assessment below (2026-05-01)

           OPERATIONS ASSESSMENT (2026-05-01):
           Risk Score: YELLOW (9) — Moderate (3) x Possible (3) after pseudonymisation.

           Assessment of "personal data" question: With UUIDs replaced, auth headers
           stripped, IPs not captured, and no PII in URLs, the transmitted telemetry
           is very likely anonymous data under DPDPA 2023 S.2(t) definition, which
           requires data to be "capable of identifying" an individual. Scrubbed error
           telemetry with no identifiers does not meet this threshold.

           Assessment of S.16 cross-border transfer question: Since transfer rules
           under DPDPA 2023 S.16 have NOT yet been notified by the Government of India
           (as of May 2026), the restriction is not yet enforceable. The pseudonymisation
           provides a secondary technical safeguard regardless.

           OPERATIONS CLEARANCE: Sentry is CLEARED for production subject to:
           (a) Engineering maintains the pseudonymisation config permanently
           (b) Any future change to Sentry config that re-enables identifiers
               requires fresh Operations review before deploy
           (c) This clearance is reviewed if/when S.16 transfer rules are notified
           Engineering may set NEXT_PUBLIC_SENTRY_DSN in Vercel production env vars.
ID:        1
---

FROM:      Operations
TO:        Shubham (Founder — critical action required before launch)
PRIORITY:  CRITICAL — Launch Blocker
REQUEST:   Terms of Service has NOT been drafted or published. This is a
           CRITICAL legal risk (Risk Score: 25 — RED) identified in the
           Operations legal risk assessment (2026-05-01).

           Without a ToS at launch:
           - No limitation of liability for KutumbKosh
           - No acceptable use policy — cannot remove abusive users
           - No IP ownership clause — user-generated content ownership unclear
           - No dispute resolution mechanism or governing law clause
           - No disclaimer of financial advice
           - Users have no contractual framework governing the service
           - LAUNCH-TODO.md has this as an unchecked item

           Required actions:
           1. Draft a Terms of Service covering:
              - Acceptance mechanism (click-wrap at signup)
              - Service description and limitations
              - User obligations and acceptable use
              - Limitation of liability and disclaimer of financial advice
              - IP ownership (user data vs. platform IP)
              - Governing law: India / jurisdiction: courts of [city]
              - Termination and account deletion rights
              - Changes to ToS (notice period)
           2. Add a ToS acceptance checkbox to the signup/onboarding flow
              (Engineering task — Operations to raise handoff once ToS is drafted)
           3. Publish at /terms in the app (Engineering already has a Terms link
              in the footer — it just needs a page)

           Legal note: KutumbKosh handles financial asset data. The ToS must
           explicitly disclaim that KutumbKosh is NOT a financial advisor,
           investment manager, or regulated financial services provider.
DEADLINE:  Before production deploy — DO NOT launch without ToS
STATUS:    Open
---

FROM:      Operations
TO:        Shubham (Founder — direct action required)
PRIORITY:  High — Before production deploy
REQUEST:   Supabase email templates (confirm-signup.html and magic-link.html)
           have been fixed in code (DPDPA language corrected 2026-04-30) but
           have NOT been manually re-uploaded to Supabase Dashboard.

           Until re-uploaded, Supabase is still sending the old templates with
           "DPDPA 2023 Compliant" language — directly violating the
           2026-04-28 Legal decision prohibiting all compliance claims.

           This affects all three environments separately:

           Steps for EACH environment (Dev, Staging, Production):
           1. Go to Supabase Dashboard → [project] → Authentication → Email Templates
           2. Select "Confirm signup" → paste contents of
              supabase/email-templates/confirm-signup.html → Save
           3. Select "Magic Link" → paste contents of
              supabase/email-templates/magic-link.html → Save
           4. Send a test email to verify the template renders correctly

           Do this for: Dev ☐  Staging ☐  Production ☐
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Operations
TO:        Shubham (Founder — decision required)
PRIORITY:  High — Before production deploy
REQUEST:   Sub-processor DPA review has NOT been completed for KutumbKosh's
           three critical data processors. Under DPDPA 2023, KutumbKosh (as
           Data Fiduciary) must ensure Data Processors provide adequate
           contractual protections (Risk Score: 12 — ORANGE).

           The three sub-processors handling personal data are:

           1. SUPABASE (primary data processor — stores all vault data)
              - Review Supabase DPA at: https://supabase.com/legal/dpa
              - Key checks: data deletion obligations, breach notification
                timeline, sub-processor chain, data location (AWS ap-south-1
                for Indian data residency)
              - Action: Accept Supabase DPA and confirm data location is
                ap-south-1 (Mumbai)

           2. VERCEL (application hosting — processes data in transit)
              - Review Vercel DPA at: https://vercel.com/legal/dpa
              - Key checks: data processing locations, breach notification
              - Action: Accept Vercel DPA

           3. RAZORPAY (payment processor — processes payment data)
              - Razorpay is a PCI DSS certified Indian payment processor
                regulated by RBI. Review their privacy policy and data
                processing terms.
              - Action: Confirm Razorpay's standard merchant agreement
                covers data processing obligations

           For each: review, accept the DPA, and document the acceptance
           date in DECISIONS.md.
DEADLINE:  Before production deploy
STATUS:    Open
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
STATUS:    Done
ID:        6
---

FROM:      Sales & Marketing
TO:        Engineering
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
              ✅ RESOLVED — Finance decision locked 2026-05-07 in DECISIONS.md.
              ₹499/year is GST-INCLUSIVE. User pays ₹499 total. KutumbKosh
              remits ₹76 GST and retains ₹423 net. Razorpay order = ₹49900
              paise. See DECISIONS.md 2026-05-07 for full breakdown and
              impact on Engineering, Marketing, and Operations.

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
STATUS:    Done
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
STATUS:    Done
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
STATUS:    Done — 2026-05-11. web-vitals@4.2.4 installed (package.json). 
           src/components/WebVitals.tsx created — onCLS, onINP, onLCP captured 
           and sent to /api/vitals route for server-side logging. Component 
           mounted in src/app/layout.tsx. TypeScript clean (0 errors).
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
STATUS:    Done — 2026-05-12. Full tier map locked in DECISIONS.md 2026-05-12 | Product.
           Reminders: Free = annual vault review nudge only; Pro = all types (insurance
           expiry, FD maturity, vault review, future types). Emergency Access: Free = 1
           contact, manual approval only; Pro = 2 contacts, all modes (Manual/V2/V3).
           Vault Dossier PDF: Free = full template, max 3 assets (natural limit, no gating);
           Pro = full template, unlimited assets. Downstream handoffs raised to Engineering
           and Sales & Marketing.
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
STATUS:    Done — 2026-05-12. V2+V3 confirmed for launch (DECISIONS.md 2026-05-07 | Product)
           resolves the over-promise concern entirely. Step 6 copy "gets access — instantly"
           stands as locked — accurate for V3 (pre-authorized, truly instant) and defensible
           for V2 (automatic, no owner intervention needed). Post-launch automation spec
           superseded by HANDOFFS.md ID 40 (full Engineering V2+V3 build spec). No copy
           changes required. Decision recorded in DECISIONS.md 2026-05-12 | Product.
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
STATUS:    Done — 2026-05-11. /grievance page confirmed live at src/app/grievance/page.tsx.
           /privacy footer updated to include "Grievance Officer" link pointing to /grievance.
           TypeScript clean (0 errors). Awaiting Shubham commit and deploy.
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
STATUS:    In Progress — 2026-05-11. Engineering work complete:
           1. src/lib/resend.ts created — shared Resend utility (sendEmail fn +
              templates: subscriptionConfirmation, renewalReminder, failedPayment).
              Uses Resend REST API directly (no SDK), fire-and-forget pattern,
              consistent with delete/route.ts.
           2. src/app/api/razorpay/verify/route.ts updated — subscription
              confirmation email fired after successful payment verification.
           3. Renewal reminder and failed payment templates built and ready —
              require a cron job or webhook trigger to fire (separate handoff needed).
           BLOCKED on Shubham:
           - RESEND_API_KEY: Shubham must create Resend account, verify kutumbkosh.com
             domain, and add RESEND_API_KEY + RESEND_FROM_EMAIL to Vercel env vars.
           - Magic link SMTP: Must be configured in Supabase Dashboard → Auth → SMTP
             (Engineering cannot do this — requires Supabase project access).
           - Cron job for renewal reminders: Not yet implemented — needs a separate
             handoff to Engineering once Shubham confirms infrastructure preference
             (Vercel Cron, Supabase Edge Functions, or external scheduler).
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
STATUS:    Done
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

FROM:      Product
TO:        Operations
PRIORITY:  High — Required before Engineering can build emergency access trigger
REQUEST:   Product has decided to implement a full inactivity-based emergency
           access trigger (V2) and pre-authorized access (V3) as part of the
           launch feature set. Before Engineering can build either mechanism,
           Operations must formally assess and clear two related DPDPA concerns.

           BACKGROUND:
           KutumbKosh emergency access flow (current): A user adds a trusted
           contact → contact is PENDING → owner approves → contact becomes
           ACTIVE → owner can revoke → contact becomes REVOKED.

           PROPOSED V2 — INACTIVITY TIMER:
           If the vault owner has not logged in for a configurable number of
           days (e.g., 30 / 60 / 90 / 180 days, owner's choice), the system
           automatically notifies the trusted contact that they may request
           access. After the contact requests, the owner gets a grace period
           (e.g., 7 / 14 / 30 days, owner's choice) to deny. If the owner
           does not deny within the grace period, access is automatically
           granted by the system.

           PROPOSED V3 — PRE-AUTHORIZED ACCESS:
           The vault owner explicitly pre-authorises a trusted contact to view
           the vault at any time without needing to request or wait for a timer.
           Access is granted immediately and remains active until the owner
           revokes it.

           DPDPA QUESTIONS OPERATIONS MUST ANSWER:

           Question 1 — Inactivity timer auto-grant (V2):
           Under DPDPA 2023, KutumbKosh is a Data Fiduciary processing
           sensitive personal financial data. The inactivity timer would cause
           the system to share a user's personal financial data with a third
           party (trusted contact) without real-time, active consent from the
           owner at the point of sharing. The owner configured the timer
           upfront, but is not actively consenting at the moment of grant.

           Is this mechanism permissible under DPDPA 2023?
           Specifically:
           a) Does upfront configuration of the timer constitute valid consent
              under DPDPA S.6 for the subsequent data sharing event?
           b) Does auto-granting access to a third party based on inactivity
              comply with the purpose limitation obligations under DPDPA?
           c) Are there any notice or disclosure obligations to the trusted
              contact (as a data principal whose data may also be processed)
              at the point of access grant?
           d) Does DPDPA S.16 cross-border transfer rules apply here if the
              trusted contact accesses the vault from outside India?

           Question 2 — Pre-authorized access (V3):
           The owner explicitly pre-authorises a contact. This is closer to
           active consent. However:
           a) Is a one-time pre-authorization in a settings screen sufficient
              ongoing consent for repeated vault access over an indefinite
              period?
           b) Are there any obligations around informing the trusted contact
              that they have been granted access and what data they can see?
           c) Should there be a mandatory expiry or review period for
              pre-authorized access (e.g., owner must re-confirm annually)?

           WHAT OPERATIONS NEEDS TO DELIVER:
           1. Written clearance (or rejection) for V2 inactivity auto-grant,
              with any conditions attached (e.g., required consent language,
              notice to trusted contact, mandatory grace period minimums).
           2. Written clearance (or rejection) for V3 pre-authorized access,
              with any conditions attached.
           3. If either mechanism requires specific consent language or user
              notices, provide the exact copy for Engineering to implement.
           4. Recommend whether an external legal advisor should be consulted
              before build, given the sensitivity of financial data involved.

           NOTE: Engineering will not begin building V2 or V3 until this
           clearance is received. Product will not raise the Engineering
           handoff until Operations responds to this one.

DEADLINE:  Before Engineering begins emergency access trigger build
STATUS:    Done — 2026-05-07. Operations/Legal assessment below.
           See DECISIONS.md 2026-05-07 | Legal + Operations for full record.

           ═══════════════════════════════════════════════════════
           OPERATIONS / LEGAL RESPONSE TO HANDOFF ID 36
           Date: 2026-05-07
           ═══════════════════════════════════════════════════════

           EXTERNAL LEGAL REVIEW RECOMMENDATION (answer this first):
           YES — Operations strongly recommends engaging an external
           startup/IT lawyer to review V2 and V3 before Engineering
           begins building. KutumbKosh processes financial SPDI under
           IT (SPDI) Rules 2011 (a higher-protection category than
           general personal data), and both mechanisms involve
           automatically sharing that data with a third party. The
           consent questions below are answered to the best of
           Operations' legal assessment, but a qualified legal opinion
           should be obtained before production deploy of either feature.
           This does not block Engineering from starting the build —
           but the feature should not go live without external sign-off.

           ───────────────────────────────────────────────────────
           V2 — INACTIVITY TIMER AUTO-GRANT: CONDITIONAL CLEARANCE
           ───────────────────────────────────────────────────────

           VERDICT: CONDITIONALLY CLEARED — Engineering may build V2
           subject to ALL conditions below being implemented.

           Q1(a) — Is upfront timer configuration valid S.6 consent?

           YES, with conditions. DPDPA S.6 requires consent to be
           "free, specific, informed, unconditional, and unambiguous."
           A conditional, forward-looking consent ("if I am inactive
           for X days and do not deny during grace period, grant
           access") is legally defensible as long as:
           (1) The user takes a clear affirmative action to set it up
               (not pre-ticked, not default-on).
           (2) The consent screen gives full disclosure of what will
               happen, to whom, and over what timeline.
           (3) The user can cancel the trigger at any time before it
               fires.

           CRITICAL RISK: Auto-grant happens by inaction (not denying),
           which under a strict reading conflicts with the DPDPA
           principle that silence does not constitute consent. This
           is mitigated by the upfront explicit setup AND by a genuine
           grace period notification through confirmed channels — but
           this is the single most important reason to obtain external
           legal review before go-live.

           CONDITION 1 — Mandatory grace period minimum:
           The grace period must be a minimum of 14 days. Do not allow
           the owner to set a shorter grace period at setup.

           CONDITION 2 — Grace period notification channels:
           When the inactivity trigger fires and the grace period
           begins, KutumbKosh must notify the owner through BOTH:
           (a) Email (to the registered email address), AND
           (b) In-app notification (shown on next login, if any).
           A single in-app-only notification is insufficient — the
           owner may be unable to log in (which is the scenario).

           CONDITION 3 — Consent screen language (LOCKED — use exact
           copy; do not paraphrase):

             "Inactivity Access Grant

             If I have not logged into my KutumbKosh vault for [X]
             days, I authorise KutumbKosh to notify [Contact Name]
             that they may request access to my vault.

             After [Contact Name] requests access, I will receive
             [Y] days' notice by email to deny. If I do not deny
             within this period, [Contact Name] will be granted
             read-only access to my vault.

             I understand:
             • [Contact Name] will be notified immediately when
               access is granted.
             • I can turn this off at any time from my vault
               settings before the inactivity timer fires.
             • This is designed for my family's emergency readiness.

             [✓ I confirm this is my choice — Save Setting]"

           CONDITION 4 — Trusted contact notification at designation:
           (see also Q1(c) below) — this notification MUST be sent
           when the owner saves the inactivity trigger setting, not
           only when access is eventually granted.

           Q1(b) — Does auto-grant comply with purpose limitation?

           YES — CLEARED. Emergency access for a nominated trusted
           contact is a core stated purpose of KutumbKosh ("your
           family is never left guessing"). This must be explicitly
           listed as a processing purpose in the Privacy Policy before
           V2 is launched. Operations will ensure this is included
           when drafting the Privacy Policy (HANDOFFS.md ID 27).

           Q1(c) — Notice obligations to the trusted contact?

           YES — REQUIRED (not optional). The trusted contact must
           receive two notifications:
           (i) At designation: When the owner saves the inactivity
               trigger, the trusted contact must receive an email
               (use exact copy below):

             "You have been added as a trusted contact on KutumbKosh
             by [Owner Name].

             What this means: If [Owner Name] is inactive on
             KutumbKosh for an extended period, you may be contacted
             to request access to their financial vault. You will
             always receive advance notice before any access is
             granted, and [Owner Name] will have the opportunity to
             deny your request.

             Your contact details are held securely and used only
             for this purpose. If you have any questions, write to
             us at care@kutumbkosh.com"

           (ii) At access grant: When the grace period expires and
               access is auto-granted, send the trusted contact an
               access notification email with login instructions.

           Q1(d) — Does S.16 apply if trusted contact is outside India?

           S.16 cross-border transfer rules are NOT YET notified or
           enforceable by the Government of India as of May 2026.
           No hard legal blocker today.

           CONDITION 5 — Future S.16 compliance readiness:
           Engineering must capture the trusted contact's country
           (at designation time, via a "Country of residence" field
           — optional, free-text or dropdown). This enables Operations
           to assess S.16 exposure when transfer rules are eventually
           notified. This field is for internal compliance tracking
           only and is not displayed in the vault.

           ───────────────────────────────────────────────────────
           V3 — PRE-AUTHORIZED ACCESS: CONDITIONAL CLEARANCE
           ───────────────────────────────────────────────────────

           VERDICT: CONDITIONALLY CLEARED — Engineering may build V3
           subject to ALL conditions below being implemented.

           V3 has a cleaner consent basis than V2 (explicit, active
           pre-authorization by the owner). The risks are lower but
           not zero, primarily around indefinite standing access
           and the trusted contact's right to know.

           Q2(a) — Is one-time pre-auth sufficient ongoing consent?

           YES, with conditions. DPDPA S.6 allows consent to cover
           ongoing processing as long as the user can withdraw it
           at any time. The owner's ability to revoke (changing
           status from PRE-AUTHORIZED back to REVOKED) satisfies
           the S.6(6) withdrawal requirement.

           The primary risk is "forgotten access" — the owner granted
           pre-authorization, then forgot about it. This is not a
           hard legal barrier but creates a practical and reputational
           risk, especially if the owner's circumstances change (e.g.,
           relationship breakdown with the trusted contact).

           CONDITION 6 — Annual re-confirmation nudge:
           Engineering must implement an annual reminder to the vault
           owner for each active V3 pre-authorization:

             "Reminder: [Contact Name] has pre-authorized access to
             your vault. Is this still your intention?
             [✓ Yes, keep access active]  [Revoke access]"

           This is not legally mandatory under DPDPA today but is
           required as a KutumbKosh product policy for accountability
           and to manage reputational risk. Log re-confirmations in
           the audit trail.

           CONDITION 7 — Consent screen language (LOCKED — use exact
           copy; do not paraphrase):

             "Pre-Authorised Vault Access

             I authorise [Contact Name] to view my KutumbKosh vault
             at any time. This access is immediate and remains active
             until I revoke it.

             I understand:
             • [Contact Name] will receive a notification with access
               instructions immediately.
             • I can revoke this access at any time from my vault
               settings.
             • I will receive an annual reminder to review this
               setting.

             [✓ I authorise this access — Save Setting]"

           Q2(b) — Obligations to inform the trusted contact?

           YES — REQUIRED. At the moment V3 access is granted (when
           the owner saves the setting), the trusted contact must
           receive an email notification (use exact copy below):

             "[Owner Name] has granted you access to their
             KutumbKosh vault.

             You can now view their financial records whenever you
             need to. Sign in at kutumbkosh.com to access the vault.

             This access was authorised by [Owner Name] on [date].
             They can revoke it at any time. If you have any
             questions, write to us at care@kutumbkosh.com"

           Q2(c) — Should there be a mandatory expiry or review period?

           No mandatory DPDPA expiry requirement. However, as noted
           in Condition 6, an annual re-confirmation nudge is required
           as KutumbKosh policy. Engineering must implement this.

           ───────────────────────────────────────────────────────
           SUMMARY OF CONDITIONS (7 total, all mandatory):
           ───────────────────────────────────────────────────────

           V2 conditions:
           1. Minimum 14-day grace period — no shorter option allowed
           2. Grace period notification via email AND in-app
           3. V2 consent screen — use locked copy above exactly
           4. Trusted contact notification email at designation
           5. Capture trusted contact country (optional field) for
              future S.16 compliance readiness

           V3 conditions:
           6. Annual re-confirmation nudge for owner
           7. V3 consent screen + trusted contact notification email
              — use locked copy above exactly

           Product may now raise the Engineering handoff for V2 and V3.
           Reference this handoff ID 36 in the Engineering handoff.
           All 7 conditions above must appear as engineering requirements
           in that handoff — do not summarise or paraphrase them.

           External legal review is strongly recommended before
           production go-live of either feature (see recommendation
           at the top of this response).

ID:        36
---

FROM:      Finance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   GST-inclusive pricing decision is now locked (DECISIONS.md 2026-05-07).
           Engineering must apply this decision in the following specific ways:

           1. RAZORPAY ORDER AMOUNT
              Set amount = 49900 (paise) — the full ₹499 inclusive amount.
              Do NOT set amount = 42373 (base only) and add GST separately.
              Do NOT set amount = 58982 (₹499 + 18% GST-exclusive formula).
              The user is charged ₹499 total. This is the only correct value.

           2. GST INVOICE BACK-CALCULATION (CRITICAL)
              On payment.captured and subscription.charged webhook events, the
              GST invoice must back-calculate from the collected amount.
              Use this formula — NOT ₹499 × 18%:
                base_amount  = ₹499 × 100/118 = ₹423.73  → round to ₹424
                gst_amount   = ₹499 × 18/118  = ₹75.27   → round to ₹75
                total        = ₹499 (collected)
              ⚠ Using ₹499 × 18% = ₹89.82 is the GST-exclusive formula and
              will over-state GST liability on every invoice. This is a legal
              and financial error.

           3. IGST vs CGST+SGST SPLIT
              The split depends on KutumbKosh's registered state (to be confirmed
              with CA at GSTIN registration):
              - Customer in SAME state as KK's GSTIN → CGST (₹37.50) + SGST (₹37.50)
              - Customer in DIFFERENT state → IGST (₹75)
              Engineering must make this field dynamic based on customer's state
              of billing address collected at checkout.

           Reference: DECISIONS.md 2026-05-07 | Finance for full breakdown.
           Cross-reference: FINANCE-RAZORPAY-ENGINEERING-HANDOFF.docx Section 5
           (GST Invoice Generation) — update that spec to reflect the confirmed
           back-calculation formula.
DEADLINE:  Before production deploy
STATUS:    Done — 2026-05-11. All three items implemented:
           1. RAZORPAY ORDER AMOUNT: order/route.ts now server-enforces amount.
              Client no longer sends amount — only cycle. Server maps cycle to
              PLAN_PRICES (ANNUAL=49900 paise). Any client-side manipulation
              of amount is completely ignored.
           2. GST BACK-CALCULATION: src/lib/gst.ts created with calculateGst()
              using the correct formula (base = collected×100/118, gst = collected×18/118).
              The incorrect ₹499×18% formula is explicitly documented and guarded against.
           3. IGST/CGST+SGST SPLIT: Dynamic based on KUTUMBKOSH_GST_STATE env var
              vs customer billing state. Defaults to IGST (safer) until GSTIN is
              registered and env var is set.
           Also: verify/route.ts updated — amount_paid is now server-enforced
           (was previously trusted from client). checkout/page.tsx cleaned up to
           not send amount in either order or verify calls. TypeScript clean (0 errors).
           NOTE: GST invoice generation (per-webhook) is part of ID #11 (webhook
           infrastructure). src/lib/gst.ts is ready for that integration.
ID:        37
---

FROM:      Finance
TO:        Sales & Marketing
PRIORITY:  High — Before pricing page goes live
REQUEST:   GST-inclusive pricing decision is now locked (DECISIONS.md 2026-05-07).
           The pricing page and all marketing copy must reflect this correctly.

           1. PRICING PAGE DISPLAY
              Show: ₹499/year
              Add label directly below the price: "Inclusive of GST"
              Do NOT show: ₹499 + GST  or  ₹499 + 18% GST  or  ₹589
              The label "Inclusive of GST" is also required under Consumer
              Protection (E-Commerce) Rules 2020 for consumer-facing platforms.

           2. ALL MARKETING COPY
              Every instance of the Pro price must read "₹499/year" with no
              additional tax qualifier. The GST-inclusive label belongs on the
              pricing page only — not in every social post or ad.

           3. WHAT NOT TO SAY
              Do not write "₹499 + taxes" — this implies GST-exclusive pricing
              and contradicts the locked decision.
              Do not write "starting at ₹499" — there is only one Pro tier.

           Reference: DECISIONS.md 2026-05-07 | Finance.
DEADLINE:  Before pricing page goes live / before launch day
STATUS:    Done — 2026-05-07. Sales & Marketing created locked copy spec at
           docs/marketing/pricing-copy-lock.md (single source of truth for all
           channels). Three violations identified in pricing/page.tsx; Engineering
           fixed all three via HANDOFFS.md ID 41 (Done 2026-05-12). S&M scope
           fully closed.
ID:        38
---

FROM:      Finance
TO:        Operations
PRIORITY:  High — Before ToS is sent for external legal review
REQUEST:   The GST-inclusive pricing decision (DECISIONS.md 2026-05-07) confirms
           that ₹499/year is GST-inclusive, with ₹76 GST remitted per transaction
           under SAC code 998314.

           Operations must pass this specific decision to the external legal
           reviewer as additional context for ToS Clause 3 (GST treatment) in
           the Finance draft (docs/FINANCE-TOS-PAYMENT-DRAFT.docx):

           1. Clause 3 of the Finance ToS draft states GST-inclusive pricing —
              confirm with the reviewer that this clause correctly reflects
              the Consumer Protection (E-Commerce) Rules 2020 requirement to
              display total price inclusive of taxes.

           2. Ask the reviewer to confirm the back-calculation formula used
              for GST invoices (₹499 × 18/118 = ₹76) is compliant with GST
              invoice rules under the CGST Act.

           3. The GST-inclusive treatment must be explicitly stated in the
              published ToS so users are not surprised. Confirm the current
              Clause 3 wording is sufficient or request redline.

           Operations to relay reviewer's findings back to Finance before
           the ToS is published.
DEADLINE:  Before ToS is sent to external legal reviewer
STATUS:    Open
ID:        39
---

FROM:      Product
TO:        Engineering
PRIORITY:  High — Required before public launch
REQUEST:   Build emergency access V2 (inactivity timer auto-grant) and V3
           (pre-authorized access). This is a confirmed launch scope item per
           DECISIONS.md 2026-05-07 | Product. Operations/Legal has conditionally
           cleared both mechanisms — see DECISIONS.md 2026-05-07 | Legal+Operations
           and HANDOFFS.md ID 36. All 7 conditions from Operations are MANDATORY
           engineering requirements. Do not ship either feature without them.

           External legal review is required before either feature goes live in
           production. Build may begin immediately; go-live is gated on legal sign-off.

           ═══════════════════════════════════════════════════════════════
           OVERVIEW — WHAT TO BUILD
           ═══════════════════════════════════════════════════════════════

           Extend the existing trusted contacts system (trusted_contacts table,
           src/app/dashboard/emergency/page.tsx) with two new access grant modes.

           Current trusted contact statuses: PENDING → ACTIVE → REVOKED
           New statuses to add: INACTIVITY_CONFIGURED, PRE_AUTHORIZED

           ACCESS LEVEL FOR BOTH V2 AND V3:
           Summary view only — asset types, institution names, nominee names.
           No account numbers, no passwords, no full financial details.
           This matches the existing stated design. Per-contact tiered access
           levels are deferred to post-launch.

           ═══════════════════════════════════════════════════════════════
           V2 — INACTIVITY TIMER AUTO-GRANT
           ═══════════════════════════════════════════════════════════════

           USER FLOW:
           1. Owner opens emergency access settings and selects a trusted contact.
           2. Owner configures:
              (a) Inactivity window — days before trusted contact is notified
                  that they can request access. Options: 30 / 60 / 90 / 180 days.
              (b) Grace period — days after contact requests before access is
                  auto-granted. Options: 14 / 21 / 30 days.
                  CONDITION 1: Minimum grace period is 14 days. Do not offer
                  any option shorter than 14 days.
           3. Owner sees V2 consent screen and taps confirm (see CONDITION 3 below).
           4. Trusted contact receives a designation notification email
              (see CONDITION 4 below).
           5. Status of trusted contact is set to INACTIVITY_CONFIGURED in DB.

           INACTIVITY DETECTION (background job):
           - Track last_login_at on the profiles table (add column if not present).
              Update last_login_at on every successful auth session.
           - Run a daily background job (Supabase pg_cron or Vercel cron):
              For each trusted contact with status INACTIVITY_CONFIGURED:
              - If (now - owner.last_login_at) >= inactivity_window_days:
                  AND contact.access_request_sent_at IS NULL:
                  → Send notification email to trusted contact (see below).
                  → Set access_request_sent_at = now() on trusted_contacts row.
                  → Send grace period start notification to owner via email
                    AND show in-app notification on next login. (CONDITION 2)

           TRUSTED CONTACT NOTIFICATION (when inactivity timer fires):
           Email to trusted contact:
             Subject: "Action available — [Owner Name]'s KutumbKosh vault"
             Body: "You have been listed as a trusted contact for [Owner Name]
             on KutumbKosh. [Owner Name] has not been active for
             [inactivity_window_days] days.
             You can now request access to their vault at kutumbkosh.com.
             [Owner Name] will be notified and will have [grace_period_days] days
             to respond. If they do not respond, access will be granted automatically.
             If you have any questions, write to us at care@kutumbkosh.com"

           OWNER GRACE PERIOD NOTIFICATIONS (CONDITION 2 — both required):
           (a) Email to owner (registered email address):
             Subject: "Action required — [Contact Name] has requested vault access"
             Body: "[Contact Name] has requested access to your KutumbKosh vault.
             You have [grace_period_days] days to deny this request.
             If you take no action, access will be granted automatically on [date].
             [Deny access] [No action needed — I approve]
             Manage your vault settings at kutumbkosh.com"
           (b) In-app notification: shown as a banner on the owner's dashboard
             on next login: "[Contact Name] has requested vault access. You have
             [N] days to deny. [Deny] [Dismiss]"

           AUTO-GRANT LOGIC:
           - Run daily background job:
              For each trusted contact with access_request_sent_at IS NOT NULL:
              - If (now - access_request_sent_at) >= grace_period_days:
                  AND status != ACTIVE AND status != REVOKED:
                  → Set status = ACTIVE, access_granted_at = now()
                  → Send access granted email to trusted contact (see below).
                  → Send access granted notification to owner.

           ACCESS GRANTED EMAIL TO TRUSTED CONTACT (after auto-grant):
             Subject: "You now have access to [Owner Name]'s KutumbKosh vault"
             Body: "Access to [Owner Name]'s KutumbKosh vault has been granted.
             Sign in at kutumbkosh.com to view their financial records.
             If you have any questions, write to us at care@kutumbkosh.com"

           DATABASE CHANGES FOR V2:
           - profiles table: add last_login_at (timestamptz, nullable).
             Update on every successful Supabase auth session via trigger or
             middleware.
           - trusted_contacts table: add columns:
               access_mode           text (values: 'MANUAL', 'INACTIVITY', 'PRE_AUTH')
               inactivity_window_days integer (nullable)
               grace_period_days      integer (nullable, minimum 14)
               access_request_sent_at timestamptz (nullable)
               access_granted_at      timestamptz (nullable)
               contact_country        text (nullable) — see CONDITION 5 below

           V2 CONSENT SCREEN — CONDITION 3 (LOCKED COPY — DO NOT PARAPHRASE):
           Display this screen when the owner saves the inactivity timer setting.
           Owner must tap the confirm button for the setting to be saved.

             "Inactivity Access Grant

             If I have not logged into my KutumbKosh vault for [X]
             days, I authorise KutumbKosh to notify [Contact Name]
             that they may request access to my vault.

             After [Contact Name] requests access, I will receive
             [Y] days' notice by email to deny. If I do not deny
             within this period, [Contact Name] will be granted
             read-only access to my vault.

             I understand:
             • [Contact Name] will be notified immediately when
               access is granted.
             • I can turn this off at any time from my vault
               settings before the inactivity timer fires.
             • This is designed for my family's emergency readiness.

             [✓ I confirm this is my choice — Save Setting]"

           TRUSTED CONTACT DESIGNATION EMAIL — CONDITION 4 (LOCKED COPY):
           Send immediately when the owner saves the inactivity trigger setting.

             Subject: "You've been added as a trusted contact on KutumbKosh"
             Body:
             "You have been added as a trusted contact on KutumbKosh
             by [Owner Name].

             What this means: If [Owner Name] is inactive on
             KutumbKosh for an extended period, you may be contacted
             to request access to their financial vault. You will
             always receive advance notice before any access is
             granted, and [Owner Name] will have the opportunity to
             deny your request.

             Your contact details are held securely and used only
             for this purpose. If you have any questions, write to
             us at care@kutumbkosh.com"

           CONDITION 5 — TRUSTED CONTACT COUNTRY FIELD:
           Add an optional "Country of residence" field (free-text or dropdown)
           to the trusted contact form (both onboarding and dashboard add flows).
           Store in trusted_contacts.contact_country. This field is for internal
           Operations compliance tracking only — do not display it in any
           user-facing vault view. Label: "Country (optional)" with helper text:
           "Used for internal compliance purposes only."

           ═══════════════════════════════════════════════════════════════
           V3 — PRE-AUTHORIZED ACCESS
           ═══════════════════════════════════════════════════════════════

           USER FLOW:
           1. Owner opens emergency access settings and selects a trusted contact.
           2. Owner selects "Pre-authorise access" option.
           3. Owner sees V3 consent screen and taps confirm (see CONDITION 7 below).
           4. Trusted contact status is set to PRE_AUTHORIZED in DB.
           5. Trusted contact receives an immediate notification email
              (see CONDITION 7 below).
           6. Trusted contact can sign in to kutumbkosh.com and view the summary
              vault immediately — no timer, no request, no approval step.

           OWNER REVOCATION:
           Owner can change status from PRE_AUTHORIZED back to REVOKED at any
           time from emergency access settings. On revocation, trusted contact
           loses access immediately and receives a notification email:
             "Your access to [Owner Name]'s KutumbKosh vault has been revoked."

           ANNUAL RE-CONFIRMATION NUDGE — CONDITION 6:
           Run annual background job (or pg_cron scheduled yearly):
           For each trusted contact with status PRE_AUTHORIZED where
           (now - access_granted_at) >= 365 days:
           → Send reminder email to owner:

             Subject: "Reminder — [Contact Name] has access to your vault"
             Body:
             "Reminder: [Contact Name] has pre-authorized access to
             your vault. Is this still your intention?
             [✓ Yes, keep access active]  [Revoke access]
             Manage settings at kutumbkosh.com"

           Log re-confirmation action (or inaction) in the audit trail
           (admin_access_log or a new trusted_contact_audit_log table).

           V3 CONSENT SCREEN — CONDITION 7a (LOCKED COPY — DO NOT PARAPHRASE):
           Display this screen when the owner selects pre-authorized access.
           Owner must tap the confirm button for the setting to be saved.

             "Pre-Authorised Vault Access

             I authorise [Contact Name] to view my KutumbKosh vault
             at any time. This access is immediate and remains active
             until I revoke it.

             I understand:
             • [Contact Name] will receive a notification with access
               instructions immediately.
             • I can revoke this access at any time from my vault
               settings.
             • I will receive an annual reminder to review this
               setting.

             [✓ I authorise this access — Save Setting]"

           V3 TRUSTED CONTACT NOTIFICATION — CONDITION 7b (LOCKED COPY):
           Send immediately when owner saves the pre-authorized setting.

             Subject: "[Owner Name] has given you access to their vault"
             Body:
             "[Owner Name] has granted you access to their
             KutumbKosh vault.

             You can now view their financial records whenever you
             need to. Sign in at kutumbkosh.com to access the vault.

             This access was authorised by [Owner Name] on [date].
             They can revoke it at any time. If you have any
             questions, write to us at care@kutumbkosh.com"

           ═══════════════════════════════════════════════════════════════
           SUMMARY OF ALL 7 MANDATORY CONDITIONS (from Operations ID 36)
           ═══════════════════════════════════════════════════════════════

           CONDITION 1 — V2: Minimum 14-day grace period. No option shorter
                         than 14 days may be offered to the owner.
           CONDITION 2 — V2: Grace period start notification sent via BOTH
                         email (to owner's registered address) AND in-app
                         banner (shown on next login).
           CONDITION 3 — V2: Consent screen uses the locked copy above exactly.
                         Owner must take explicit affirmative action (tap confirm).
                         Setting must NOT be pre-ticked or default-on.
           CONDITION 4 — V2: Trusted contact receives designation notification
                         email at the moment the owner saves the setting (locked
                         copy above). Not deferred — sent immediately on save.
           CONDITION 5 — V2+V3: Trusted contact country field (optional, free-text
                         or dropdown) captured at designation for future S.16
                         compliance readiness. Internal only, not user-facing.
           CONDITION 6 — V3: Annual re-confirmation nudge email sent to owner.
                         Re-confirmation (or inaction) logged in audit trail.
           CONDITION 7 — V3: Consent screen and trusted contact notification email
                         use the locked copy above exactly.

           ═══════════════════════════════════════════════════════════════
           UI — SETTINGS SCREEN DESIGN GUIDANCE
           ═══════════════════════════════════════════════════════════════

           On the emergency access dashboard (or a new "Access Settings" sub-page
           per trusted contact), show three options the owner can select:

           Option 1: "I'll approve manually" (default — existing MANUAL flow)
           Option 2: "Grant access if I'm unreachable" (V2 inactivity timer)
             → Show inactivity window selector + grace period selector on select
           Option 3: "Trust them fully — access anytime" (V3 pre-authorized)

           Use warm, non-technical labels consistent with brand voice. Avoid
           "inactivity timer," "auto-grant," "pre-authorization" in the UI copy.
           Example label for Option 2: "If I haven't been active for [90 days ▾]
           and don't respond within [30 days ▾] of their request, grant access."

           ═══════════════════════════════════════════════════════════════
           GO-LIVE GATE
           ═══════════════════════════════════════════════════════════════

           Build may proceed immediately. However, V2 and V3 must NOT be enabled
           in production until Operations confirms external legal review is complete.
           Use a feature flag or environment variable to gate V2/V3 in production
           until Operations gives the go-live signal.

           Reference: HANDOFFS.md ID 36 (Operations clearance), DECISIONS.md
           2026-05-07 | Product and 2026-05-07 | Legal+Operations.

DEADLINE:  Before public launch (go-live gated on external legal review)
STATUS:    In Progress — 2026-05-11. Full V2+V3 build complete. All 7 DPDPA
           conditions from ID #36 implemented. Feature-flagged behind
           NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3=true (server-enforced on API route too).
           Files created/modified:
           1. supabase/migrations/20260511_emergency_access_v2_v3.sql — adds
              access_mode, inactivity_days, grace_period_days, inactivity_trigger_fired_at,
              inactivity_grace_ends_at, v2_consent_at, v3_consent_at,
              v3_last_reconfirmed_at, country_of_residence to trusted_contacts.
              Creates emergency_access_log table with full audit trail.
           2. src/types/database.ts — TrustedContact and AccessMode types updated.
           3. src/lib/resend.ts — 4 new email templates: v2DesignationNotification
              (Condition 4 locked copy), v3DesignationNotification (Condition 7 locked
              copy), v2GracePeriodStarted (Condition 2 — email channel), 
              v3AnnualReconfirmation (Condition 6).
           4. src/app/api/emergency/access-mode/route.ts — POST endpoint validates
              consent, enforces Condition 1 (min 14-day grace), records consent
              timestamps, writes audit log, fires designation notification emails.
           5. src/app/dashboard/emergency/page.tsx — AccessModePanel component added
              to each trusted contact card (feature-flagged). Shows V1/V2/V3 radio
              selector; V2 shows inactivity window + grace period dropdowns; V2/V3
              show exact locked consent copy from HANDOFFS.md ID #36 with checkbox
              before save. Country of residence field (Condition 5) included.
           UPDATE 2026-05-12: DB migration run in dev + stage by Shubham.
           Code committed. NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3=true set in Vercel
           dev + stage. Feature live and testable on dev/stage.
           BLOCKED on production go-live only: Operations must confirm external
           legal review is complete before flag is set to true in Vercel production.
           Once Operations clears → Shubham sets production env var → mark Done.
ID:        40
---

FROM:      Sales & Marketing (via DECISIONS.md 2026-05-07)
TO:        Engineering
PRIORITY:  High — Before pricing page goes live
REQUEST:   Three pricing violations in src/app/dashboard/pricing/page.tsx identified
           in DECISIONS.md 2026-05-07 | Sales & Marketing. Fix required before
           launch — violations contradict locked pricing decisions and Consumer
           Protection (E-Commerce) Rules 2020.
           1. Line 126: "or ₹79/month" — monthly billing does not exist at launch
              (contradicts DECISIONS.md 2026-04-28 Finance).
           2. Missing "Inclusive of GST" label below ₹499/year price — required
              under Consumer Protection (E-Commerce) Rules 2020.
           3. Line 237 FAQ: "Can I switch between monthly and annual?" — references
              non-existent monthly billing.
DEADLINE:  Before pricing page goes live
STATUS:    Done — 2026-05-12. All three violations fixed:
           1. "or ₹79/month" replaced with "Inclusive of GST" label (line 126).
           2. "Inclusive of GST" label now displays below ₹499/year in Pro card.
           3. FAQ entry replaced: "Is billing annual only?" with accurate annual-only
              copy. TypeScript clean (0 errors). No commits made.
ID:        41
---

FROM:      Product
TO:        Engineering
TASK:      Update useSubscription hook — feature gates per locked tier map
CONTEXT:   DECISIONS.md 2026-05-12 | Product locked the Free vs Pro tier map
           (resolved HANDOFFS.md ID 23). Engineering must update the
           useSubscription hook and all related feature-gate checks to match
           the following:

           FREE TIER:
           - Trusted contacts: max 1
           - Emergency access modes: Manual only (V2/V3 must be hidden/disabled
             for Free users even after the NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 flag
             is enabled in production)
           - Reminders: Annual vault review reminder only. All other reminder
             types (insurance expiry, FD maturity, etc.) must be gated — upgrade
             prompt shown.
           - Vault Dossier PDF: No gating — full template generated for all tiers
             (content is naturally limited since Free users have ≤3 assets).
           - Asset limit: 3 (already gated — no change needed)

           PRO TIER:
           - Trusted contacts: max 2
           - Emergency access modes: Manual, V2 (inactivity timer), V3
             (pre-authorized) — all three available once V2V3 flag live in prod
           - Reminders: All types (annual vault review, insurance expiry,
             FD maturity, scheduled vault review nudges)
           - Vault Dossier PDF: No gating — same full template as Free

           IMPLEMENTATION NOTES:
           - Check useSubscription hook at src/hooks/useSubscription.ts (or
             equivalent). Confirm all gated features reference the hook rather
             than hardcoded checks scattered in components.
           - For V2/V3 mode selector on Emergency page: gate on BOTH Pro tier
             AND NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 flag. Do not show V2/V3 to
             Free users even after flag is live.
           - Reminder gating: check where reminder creation UI is rendered and
             confirm upgrade prompts are shown for Free users on gated types.
           - No DB schema changes required — this is UI/logic gating only.
           - Reference: DECISIONS.md 2026-05-12 | Product (Free vs Pro tier map)
             and HANDOFFS.md ID 40 (V2/V3 feature flag requirement).
PRIORITY:  High — Must be complete before public launch
STATUS:    Done — 2026-05-14. All sub-items resolved:
           C3: AccessModePanel now gated on isPro (banner UpgradePrompt for Free users).
           C4: API route /api/emergency/access-mode enforces Pro check server-side.
           H1: review_nudge ungated — uses basic_reminders (Free + Pro), threshold 180 days.
           H2: Page-level UpgradePrompt removed; Free users can use emergency page normally.
           H3: PLAN_LIMITS.maxTrustedContacts added (Free: 1, Pro: 2); isAtTrustedContactLimit
               added to useSubscription hook.
           H4: Add button gated on isAtTrustedContactLimit — shows emergency_contact_limit
               inline UpgradePrompt when at limit.
           M1: review_nudge threshold corrected 30 → 180 days.
           M2: V3 copy corrected — "pre-authorised → instant; otherwise notified to approve".
           M3: Pricing page features array replaced with accurate tier data per DECISIONS.md
               2026-05-12 | Product.
ID:        42
---

FROM:      Product
TO:        Sales & Marketing
TASK:      Update pricing page copy with confirmed tier definitions
CONTEXT:   DECISIONS.md 2026-05-12 | Product locked the Free vs Pro tier map
           (resolved HANDOFFS.md ID 23). The pricing page at
           src/app/dashboard/pricing/page.tsx (and any public-facing pricing
           section) must reflect the exact tier contents. Note: three pricing
           violations (monthly billing, missing GST label, monthly FAQ) were
           already fixed by Engineering per HANDOFFS.md ID 41. This handoff
           is about tier feature copy, not pricing/billing copy.

           CONFIRMED FREE TIER — use this language:
           - "Up to 3 assets"
           - "1 trusted contact"
           - "Manual emergency access approval"
           - "Annual vault review reminder"
           - "Vault Dossier PDF (up to 3 assets)"

           CONFIRMED PRO TIER — use this language:
           - "Unlimited assets"
           - "Up to 2 trusted contacts"
           - "Manual, automatic, and pre-authorized emergency access"
             (do NOT say "V2" or "V3" in user-facing copy — use plain labels)
           - "All reminder types" or list: "Annual vault review, insurance
             expiry, FD maturity, and more"
           - "Full Vault Dossier PDF"

           COPY GUIDANCE:
           - Replace any occurrence of "basic reminders" with "Annual vault
             review reminder" for Free tier.
           - V2/V3 automation (automatic and pre-authorized access modes) is the
             key Pro differentiator for emergency access — make this visible in
             the Pro feature list.
           - Do not use technical terms (inactivity timer, pre-authorization,
             V2, V3) in user-facing copy.
           - Raise an Engineering handoff if copy changes require code edits
             to pricing/page.tsx — do not edit the file directly.
PRIORITY:  Medium — Before public launch; pricing page must be accurate
STATUS:    Done — 2026-05-12. Sales & Marketing finalised copy per brand voice
           rules and Product's locked tier map. Engineering handoff raised as
           HANDOFFS.md ID 50 with exact replacement features array.
ID:        43
---

FROM:      Product
TO:        Engineering
TASK:      Reminders + Emergency Access code audit — 8 bugs to fix before launch
CONTEXT:   Full audit of reminders/page.tsx, emergency/page.tsx,
           onboarding/emergency-contact/page.tsx, api/emergency/access-mode/route.ts,
           and src/types/database.ts against DECISIONS.md 2026-05-12 | Product
           (Free vs Pro tier map) and HANDOFFS.md ID 40 (V2/V3 spec).
           Issues are ordered by severity. Fix all CRITICAL and HIGH items before
           any production deploy. MEDIUM items noted separately.

           ═══════════════════════════════════════════════════════════════
           CRITICAL — Fix before any commit that touches these files
           ═══════════════════════════════════════════════════════════════

           C1 — Email field missing from onboarding trusted contact form
           File: src/app/onboarding/emergency-contact/page.tsx
           The "Mobile + Email — both mandatory" section (lines ~292–315)
           renders only the phone <input>. The email <input> is missing from
           the JSX. Mail icon is imported but unused. validateEmail("") returns
           "Email is required" at submit time, so any user who fills in a
           contact name cannot submit the form and is permanently blocked.
           Onboarding can only be completed by leaving the name blank and
           skipping. Fix: add the email <input> field (with Mail icon, same
           pattern as phone field) inside the space-y-3 div, before the
           closing </div> of the bg-blue-50 section.

           C2 — Phone field FieldError references email variables (copy-paste bug)
           File: src/app/onboarding/emergency-contact/page.tsx, lines ~308–311
           The phone <input> className condition and its FieldError both check
           contactTouched[index]?.email and contactErrors[index]?.email instead
           of .phone. Phone field errors never display. Fix: replace all .email
           references in the phone field block with .phone.

           C3 — V2/V3 AccessModePanel not gated on isPro
           File: src/app/dashboard/emergency/page.tsx, line ~596
           Current:  {V2V3_ENABLED && (<AccessModePanel contact={contact} onSaved={loadData} />)}
           Required: {V2V3_ENABLED && isPro && (<AccessModePanel contact={contact} onSaved={loadData} />)}
           When the feature flag is enabled in production, Free users currently
           see and interact with V2/V3 mode options. This violates DECISIONS.md
           2026-05-12 (Free = manual only).

           C4 — API route has no Pro tier check
           File: src/app/api/emergency/access-mode/route.ts
           After authenticating the user and validating the V2V3 flag, the route
           does not verify the user is on a Pro subscription. A Free user can
           bypass the UI and call POST /api/emergency/access-mode to set
           INACTIVITY or PRE_AUTHORIZED modes.
           Fix: after fetching the user, query the subscriptions table:
             select status, plan, current_period_end where user_id = user.id
             and status in ('ACTIVE','CANCELLED') order by created_at desc limit 1
           If plan != PRO or period has expired, return 403 for any access_mode
           that is not MANUAL.

           ═══════════════════════════════════════════════════════════════
           HIGH — Logic bugs contradicting DECISIONS.md 2026-05-12
           ═══════════════════════════════════════════════════════════════

           H1 — review_nudge gated on Pro; must be available to Free
           File: src/app/dashboard/reminders/page.tsx, line ~172
           Current: if (hasAllReminders && assets.length > 0)
           Required: if (assets.length > 0)   [ungated — all users]
           DECISIONS.md 2026-05-12 explicitly assigns the annual vault review
           nudge to Free tier. The current gate (hasAllReminders = Pro only)
           means Free users never see it.
           NOTE: See MEDIUM issue M1 about the 30-day trigger threshold —
           Product decision pending on final threshold before fixing this.
           For now, ungate the check; threshold adjustment is a follow-up.

           H2 — UpgradePrompt on Emergency page misleads Free users
           File: src/app/dashboard/emergency/page.tsx, lines ~489–491
           Current: {!isPro && !subLoading && (<UpgradePrompt feature="emergency_access" variant="card" />)}
           The "Emergency Access is a Pro feature" prompt blocks the page for
           Free users — but Free users ARE entitled to 1 trusted contact with
           manual mode per DECISIONS.md 2026-05-12. This prompt is factually
           wrong and will confuse Free users who reach the page after onboarding.
           Fix: remove the page-level UpgradePrompt entirely. Replace with:
           (a) A contextual upgrade prompt on the V2/V3 mode options when isPro
               is false (e.g. "Upgrade to Pro to configure automatic access")
           (b) A contextual upgrade prompt on the Add button when the contact
               count limit is reached (see H4 below)

           H3 — No maxTrustedContacts in PLAN_LIMITS
           File: src/types/database.ts, lines ~150–161
           PLAN_LIMITS currently defines maxAssets and maxNominees but not
           maxTrustedContacts. Without this, the useSubscription hook cannot
           expose the limit and components cannot enforce it.
           Fix: add maxTrustedContacts to the type and both plan objects:
             FREE:  { maxAssets: 3, maxNominees: 2, maxTrustedContacts: 1, features: [...] }
             PRO:   { maxAssets: Infinity, maxNominees: Infinity, maxTrustedContacts: 2, features: [...] }
           Also expose maxTrustedContacts from useSubscription return type and
           return value (alongside limits.maxAssets, limits.maxNominees).

           H4 — Add button on Emergency page has no tier-based limit check
           File: src/app/dashboard/emergency/page.tsx, line ~514
           The UserPlus "Add" button always navigates to /onboarding/emergency-contact
           regardless of contacts.length or tier. Free users with 1 contact can
           click Add and reach the onboarding form, exceeding the Free limit.
           Fix: use maxTrustedContacts from useSubscription (added in H3).
           When contacts.length >= maxTrustedContacts:
             - If Free: replace Add button with an inline upgrade prompt
               "Add up to 2 contacts with Pro — Upgrade"
             - If Pro: hide the Add button (already at Pro limit)
           Same fix needed in onboarding/emergency-contact/page.tsx addContact()
           function at line ~79: currently hardcodes contacts.length < 2.
           Must be tier-aware. Pass max via prop or check subscription in the
           onboarding page. For onboarding, since the user's tier is set, the
           Pro limit of 2 is correct for Pro users; Free users should only be
           able to fill in 1 contact form panel (not add a second row).

           ═══════════════════════════════════════════════════════════════
           MEDIUM — UX clarity; fix before production but not blocking staging
           ═══════════════════════════════════════════════════════════════

           M1 — review_nudge fires at 30 days; must be 180 days — UNBLOCKED
           File: src/app/dashboard/reminders/page.tsx, line ~178
           Change: daysSinceUpdate > 30  →  daysSinceUpdate > 180
           Decision locked: DECISIONS.md 2026-05-12 | Product (Founder Decision).
           180-day threshold confirmed for launch. Server-side annual email
           is post-launch scope — no cron work needed now.

           M2 — "Access Someone's Vault" description inaccurate for V3
           File: src/app/dashboard/emergency/page.tsx, lines ~787–789
           "The vault holder will be notified and must approve your request
           before you can see anything." — inaccurate once V2/V3 are live
           (V3 = pre-authorized, no approval needed).
           Fix when V2V3 flag goes live in production: update text to:
           "If the vault holder has pre-authorized you, you'll get access
           immediately. Otherwise, they'll be notified to approve your request."

           M3 — basic_reminders feature key defined but never checked
           File: src/types/database.ts, line ~154
           features: ["basic_reminders"] is in FREE PLAN_LIMITS but
           canUseFeature("basic_reminders") is never called anywhere.
           After H1 is fixed, use canUseFeature("basic_reminders") as the
           explicit gate for review_nudge (rather than ungating completely),
           to keep the pattern consistent with how all_reminders is used.
           This makes the feature key meaningful and future-proof.

           M4 — nominee_gap and draft_asset shown to Free users
           File: src/app/dashboard/reminders/page.tsx, lines ~86–121
           ✅ RESOLVED — Founder decision confirmed 2026-05-12 (DECISIONS.md).
           nominee_gap and draft_asset are UX safety/data-quality alerts and
           are NOT gated on subscription tier. Show to ALL users always.
           Current behaviour is correct. No code change required.

PRIORITY:  High — CRITICAL and HIGH items are launch blockers
STATUS:    Partially resolved — 2026-05-12. C1 (email field missing) and C2
           (phone FieldError wrong key) fixed — see HANDOFFS.md ID 51.
           C3, C4, H1, H2, H3, H4, M1, M2, M3 resolved — see HANDOFFS.md ID 42 Done note
           (2026-05-14). All items in this audit are now closed.
ID:        44
---

FROM:      Product
TO:        Sales & Marketing
TASK:      Update two UpgradePrompt copy blocks — emergency_access and all_reminders
CONTEXT:   The audit (HANDOFFS.md ID 44) and DECISIONS.md 2026-05-12 | Product
           (Free vs Pro tier map) changed the boundaries for two features.
           The UpgradePrompt component at src/components/UpgradePrompt.tsx
           has hardcoded featureMessages that are now factually wrong for both.
           Sales & Marketing must draft corrected copy; Engineering will
           implement it in the component file.

           ─── CHANGE 1: emergency_access featureMessage ──────────────────

           CURRENT (wrong):
             title: "Emergency Access is a Pro feature"
             desc:  "Set up trusted contacts and emergency dossiers to protect
                    your family. Available with KutumbKosh Pro."

           WHY WRONG: Free users ARE entitled to 1 trusted contact with manual
           approval mode. Telling them Emergency Access is Pro-only is factually
           incorrect and will confuse them immediately after onboarding.

           WHAT'S NEEDED: Two separate contextual messages (both to be added
           as new featureMessage keys — do not overwrite emergency_access):

           Key: "emergency_access_v2v3"
           Context: Shown when a Free user selects the V2 or V3 mode option
           in the emergency access panel.
           Draft the title + 1-line description that conveys:
             "Automatic and pre-authorised access are Pro features. Upgrade to
             configure how your trusted contact gets access — even if you can't
             respond."
           Tone: warm, empowering. Not fear-based.

           Key: "emergency_contact_limit"
           Context: Shown when a Free user tries to add a second trusted contact
           (already has 1, which is the Free limit).
           Draft the title + 1-line description that conveys:
             "Free plan includes 1 trusted contact. Upgrade to Pro to add a
             second contact and configure automatic access settings."
           Tone: calm, informational.

           ─── CHANGE 2: all_reminders featureMessage ─────────────────────

           CURRENT (wrong):
             title: "Advanced reminders are a Pro feature"
             desc:  "Get alerts for insurance expiry, FD maturity, and vault
                    review nudges. Available with KutumbKosh Pro."

           WHY WRONG: Vault review nudge is now confirmed as a Free tier
           feature (DECISIONS.md 2026-05-12). Listing it in the Pro-only
           description is inaccurate.

           WHAT'S NEEDED: Remove "vault review nudges" from the description.
           Revised desc should convey:
             "Get timely alerts for insurance policy expiry and FD maturity
             dates. Available with KutumbKosh Pro."
           Title can stay as is, or be refined.

           ─── INSTRUCTIONS FOR SALES & MARKETING ─────────────────────────
           Draft final copy for all three messages and raise an Engineering
           handoff with the exact strings to be placed in UpgradePrompt.tsx.
           Do not edit UpgradePrompt.tsx directly — that is Engineering scope.
           Copy must follow brand voice: warm, simple, confident, empowering.
           No fear-based language. No jargon (no "V2", "V3", "inactivity timer").

PRIORITY:  Medium — Before public launch; these prompts are user-facing on live pages
STATUS:    Done — 2026-05-12. Sales & Marketing drafted all three copy blocks
           per brand voice rules. Engineering handoff raised as HANDOFFS.md ID 48
           with exact strings ready for UpgradePrompt.tsx implementation.
ID:        45
---

FROM:      Product
TO:        Operations
TASK:      Formally engage external legal reviewer for V2/V3 emergency access go-live
CONTEXT:   DECISIONS.md 2026-05-07 | Legal+Operations (Operations conditional
           clearance for V2/V3) explicitly states:
           "External legal review is strongly recommended before production
           go-live of either feature, given that both mechanisms involve
           automated sharing of financial SPDI."
           DECISIONS.md 2026-05-07 | Product and HANDOFFS.md ID 40 both confirm:
           "Build may proceed; go-live requires external sign-off."
           Engineering has completed the V2/V3 build (HANDOFFS.md ID 40 status,
           updated 2026-05-12). The feature is live on dev/staging behind the
           NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 flag.
           Production go-live is now solely blocked on Operations completing the
           external legal review and sending the go-live signal to Engineering.

           OPERATIONS ACTION REQUIRED:
           1. Engage an external startup / IT law firm with DPDPA 2023 and
              IT (SPDI) Rules 2011 experience to review the V2 and V3 designs.
           2. Share the following with the reviewer:
              - HANDOFFS.md ID 36 (Operations conditional clearance + all 7
                conditions)
              - HANDOFFS.md ID 40 (full Engineering spec with consent language
                and notification copy)
              - DECISIONS.md 2026-05-07 | Legal+Operations
              - The V2/V3 consent screens and notification emails as built
                (accessible on staging: NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3=true)
           3. Once external reviewer confirms the implementation is compliant:
              - Update this handoff to Done
              - Notify Engineering to set NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3=true
                in Vercel production
              - Update LAUNCH-TODO.md emergency access item to Done

           Note: This is a hard go-live gate. V2/V3 must NOT be enabled in
           production without this clearance, even if all other launch items
           are complete.

PRIORITY:  High — Hard production go-live blocker for V2/V3
STATUS:    Open
ID:        46
---

FROM:      Product
TO:        Sales & Marketing
TASK:      Draft all FAQ and contextual explainer copy for launch
CONTEXT:   DECISIONS.md 2026-05-12 | Product locked the FAQ strategy.
           Two sets of copy are needed. Engineering (HANDOFFS.md ID 48) is
           blocked on this handoff — provide copy before Engineering begins
           implementation.

           ═══════════════════════════════════════════════════════════════
           DELIVERABLE 1 — Landing page FAQ (5–7 questions)
           ═══════════════════════════════════════════════════════════════

           Audience: Prospective users on the coming-soon / landing page.
           Goal: Remove hesitation and build enough trust to sign up.
           Format: Question + plain-language answer (2–4 sentences each).
           Tone: Warm, simple, confident. No jargon. No fear framing.

           Required topic coverage (Product-specified — copy is S&M's job):

           1. Security / encryption
              Cover: AES-256 encryption at rest, TLS in transit, zero-access
              policy (KutumbKosh employees cannot read your vault).
              Claim permitted: "Your data is protected with 256-bit encryption
              — the same standard used by banks." (DECISIONS.md 2026-04-28 | Engineering)
              Do NOT claim: "DPDPA 2023 Compliant" (DECISIONS.md 2026-04-28 | Legal)
              Use instead: "Designed with Indian data privacy standards in mind"

           2. Passwords and sensitive data
              Cover: KutumbKosh does NOT store passwords, PINs, or full account
              numbers. Only asset names, institution names, last 4 digits (optional),
              and nominee/contact information.

           3. Nominee vs Trusted Contact — what is the difference?
              This is the most important FAQ. Cover clearly:
              - Nominee = legal beneficiary linked to a specific asset (who
                inherits it). Set by you with the institution (bank, insurer, etc.)
              - Trusted Contact = someone who can see your vault summary in an
                emergency, so they know what exists and who to contact. They
                cannot claim assets — only view the summary.
              - They can be the same person, or different people entirely.

           4. Pricing — what is free, what is paid?
              Cover: Free tier (3 assets, 1 trusted contact, manual access,
              vault review reminder). Pro tier (₹499/year inclusive of GST,
              unlimited assets, 2 trusted contacts, automatic access modes,
              all reminder types, full PDF).

           5. What happens to my data if I stop using KutumbKosh / delete
              my account?
              Cover: Data is permanently deleted on account closure. No residual
              copies retained. (Align with zero-access policy and future privacy
              policy — do not over-promise on specific timelines without legal
              sign-off.)

           6. Is my family's financial information visible to anyone at
              KutumbKosh?
              Cover: Zero-routine-access policy — no employee has standard
              access to vault contents. (DECISIONS.md 2026-04-28 | Legal)

           7. (Optional) How does emergency access work?
              Cover at a high level: the owner controls who can request access
              and under what conditions. Trusted contacts see a summary only —
              no passwords, no full account numbers.

           ═══════════════════════════════════════════════════════════════
           DELIVERABLE 2 — In-app contextual card: Nominee vs Trusted Contact
           ═══════════════════════════════════════════════════════════════

           Audience: Active users on the nominees screen inside the app.
           Goal: Pre-empt the single most likely confusion point before it
           causes a support email or data error.
           Format: Short card (matches existing "What is this?" card on the
           emergency page). Heading + 2–3 sentences max. No bullet lists.
           Tone: Warm, plain, reassuring.

           Required content (Product-specified):
           - A nominee is the person who legally inherits a specific asset.
             You register nominees directly with your bank, insurer, or fund.
             KutumbKosh records this — it does not create the legal nomination.
           - A trusted contact is someone who can see your full vault summary
             in an emergency. They know what exists and who to contact.
             They cannot claim your assets.
           - These can be the same person, or completely different people.

           ═══════════════════════════════════════════════════════════════
           OUTPUT FORMAT
           ═══════════════════════════════════════════════════════════════
           Deliver both sets of copy as a document in docs/marketing/.
           Then raise an Engineering handoff (referencing HANDOFFS.md ID 48)
           with the final copy ready to implement.
           Do NOT implement in HTML or code — that is Engineering's scope.

PRIORITY:  High — Engineering (ID 49) is blocked on this
STATUS:    Done — 2026-05-12. Sales & Marketing drafted all copy per brand voice
           rules and Product's coverage requirements. Deliverable at
           docs/marketing/faq-copy.md. Engineering may now proceed with ID 49.
           7 landing page Q&As + in-app nominee vs trusted contact card complete.
ID:        47
---

FROM:      Product
TO:        Engineering
TASK:      Implement landing page FAQ section and in-app nominee explainer card
CONTEXT:   DECISIONS.md 2026-05-12 | Product locked the FAQ strategy.
           Sales & Marketing (HANDOFFS.md ID 47) will deliver all copy.
           Engineering must NOT begin implementation until ID 47 is Done
           and copy is confirmed.

           ═══════════════════════════════════════════════════════════════
           TASK 1 — Landing page collapsible FAQ section
           ═══════════════════════════════════════════════════════════════

           Files to modify:
           - coming-soon/index.html — add collapsible FAQ section
           - src/app/page.tsx (or src/components/ if componentised)
             — add the same section to the main app landing page

           Placement: After the "How KutumbKosh Works" infographic section
           (added 2026-05-03) and before the final CTA / footer.

           Implementation requirements:
           - Collapsible accordion pattern: question visible, answer
             expands on click/tap. One open at a time preferred.
           - 5–7 items (exact count per S&M copy from ID 47).
           - Mobile-first. Must work without JS in coming-soon/index.html
             (use <details>/<summary> HTML pattern for the static page).
           - For src/app/page.tsx: React state or Tailwind peer pattern.
           - Use brand colours (Primary Blue #2563EB, Gray-900 headings,
             Gray-500 body text). Consistent with existing page styling.
           - Section heading: "Common questions" or as specified in S&M copy.
           - Add FAQ schema markup (JSON-LD) to the landing page <head>
             for SEO — use the same Q&A pairs from the accordion.

           ═══════════════════════════════════════════════════════════════
           TASK 2 — In-app nominee vs trusted contact explainer card
           ═══════════════════════════════════════════════════════════════

           File to modify: the nominees list/management page.
           Locate the correct file (likely src/app/dashboard/nominees/
           or similar) — check codebase.

           Placement: At the top of the nominees section, above the list
           of existing nominees. Use the same card pattern as the "What
           is this?" card on the emergency access page (src/app/dashboard/
           emergency/page.tsx lines ~494–506): white card, icon, heading,
           paragraph text.

           Icon suggestion: Users icon (already imported in emergency page).
           Copy: Use exactly what S&M provides in ID 47 Deliverable 2.
           No bullet lists inside the card — prose only.

           ═══════════════════════════════════════════════════════════════
           NOTES
           ═══════════════════════════════════════════════════════════════
           - Do not create a standalone /faq page — deferred post-launch
             per DECISIONS.md 2026-05-12 | Product.
           - Commit message should reference HANDOFFS.md ID 47 + ID 49.

PRIORITY:  Medium — Before public launch; blocked on HANDOFFS.md ID 47
STATUS:    Done — 2026-05-14.
           TASK 1 (Landing page FAQ):
           - coming-soon/index.html: FAQ JSON-LD schema added to <head>;
             FAQ CSS (details/summary accordion, no JS) added; 7-item FAQ section
             inserted between trust-section and CTA section.
           - src/app/page.tsx: imports src/components/FAQ.tsx (React accordion,
             useState, one-open-at-a-time); renders between <HowItWorks /> and footer.
           - src/components/FAQ.tsx: new component created.
           TASK 2 (In-app explainer card):
           - src/app/dashboard/nominees/page.tsx: explainer card added at top of
             <main>, above coverage alert. Uses Users icon, exact copy from
             docs/marketing/faq-copy.md Part 2. Matches emergency page card pattern.
           TypeScript: clean (0 errors).
           Copy: verbatim from docs/marketing/faq-copy.md. No paraphrasing.
ID:        49
---

FROM:      Sales & Marketing
TO:        Engineering
PRIORITY:  Medium — Before public launch; pricing page must show accurate tier info
REQUEST:   Replace the `features` array in src/app/dashboard/pricing/page.tsx
           (lines 22–31) with the corrected version below. This resolves four
           factual errors identified when Product locked the Free vs Pro tier map
           (DECISIONS.md 2026-05-12 | Product, HANDOFFS.md ID 43).

           WHAT CHANGED AND WHY:
           1. "Smart reminders" Free value: was "Nominee gaps only" → incorrect
              after tier map lock. Free tier gets "Annual vault review" reminder.
           2. "Emergency access": was Free false → incorrect. Free users get 1
              trusted contact with manual approval mode. Only V2/V3 are Pro-only.
           3. "PDF export" / "Trusted contacts & dossier": both showed Free false
              → incorrect. Free gets Vault Dossier PDF (limited to 3 assets) and
              1 trusted contact. Row names also updated to match product terminology.

           EXACT REPLACEMENT — replace lines 22–31 with this verbatim:

           const features = [
             { name: "Assets", free: "Up to 3", pro: "Unlimited", icon: FileText },
             { name: "Nominees", free: "Up to 2", pro: "Unlimited", icon: Users },
             { name: "Asset-nominee linking", free: "Basic", pro: "With share %", icon: Percent },
             { name: "Smart reminders", free: "Annual vault review", pro: "Insurance expiry, FD maturity & more", icon: Bell },
             { name: "Trusted contacts", free: "1 contact", pro: "Up to 2 contacts", icon: Shield },
             { name: "Emergency access", free: "Manual approval", pro: "Manual, automatic & pre-authorised", icon: AlertTriangle },
             { name: "Vault Dossier PDF", free: "Up to 3 assets", pro: "Full vault", icon: Download },
             { name: "Priority support", free: false, pro: true, icon: Headphones },
           ];

           ADDITIONAL CLEANUP (optional but recommended):
           - Remove `Infinity` from the lucide-react import (line 19) — it is
             imported but unused in the current file and was unused before this
             change too.

           NO OTHER CHANGES NEEDED. The JSX that renders the features array
           (plan cards + comparison table) handles string vs boolean values
           dynamically — no template changes required.

           Reference: HANDOFFS.md ID 43 (Product → S&M, Done), DECISIONS.md
           2026-05-12 | Product (Free vs Pro tier map).
DEADLINE:  Before public launch
STATUS:    Done — 2026-05-14. features array in pricing/page.tsx replaced with accurate
           tier data: Free = "Up to 3" assets, "Up to 2" nominees, "1 contact", "Manual
           approval" emergency; Pro = "Unlimited" assets/nominees, "Up to 2 contacts",
           "Manual, automatic & pre-authorised" emergency. All values match DECISIONS.md
           2026-05-12 | Product.
ID:        50
---

FROM:      Sales & Marketing
TO:        Engineering
PRIORITY:  Medium — Before public launch; these prompts show on live user-facing pages
REQUEST:   Update three featureMessage entries in src/components/UpgradePrompt.tsx.
           Product audit (HANDOFFS.md ID 44, ID 45) found two entries factually
           wrong after the tier map lock (DECISIONS.md 2026-05-12 | Product) and
           one new entry needed for the V2/V3 gating UI.

           ── ADD: key "emergency_access_v2v3" (new key) ──────────────────────
           Context: Shown when a Free user selects the V2 (automatic) or V3
           (pre-authorised) mode option in the Emergency Access panel. Must
           not imply that ALL emergency access is Pro — Free users have manual
           approval mode and 1 trusted contact.

           title: "Automatic access is a Pro feature"
           desc:  "With Pro, your trusted contact can get access automatically —
                  no need for you to approve it in the moment."

           ── ADD: key "emergency_contact_limit" (new key) ─────────────────────
           Context: Shown when a Free user tries to add a second trusted contact
           (Free plan limit is 1).

           title: "Add more trusted contacts with Pro"
           desc:  "Your free plan includes 1 trusted contact. Upgrade to Pro to
                  add a second and configure how they access your vault."

           ── UPDATE: key "all_reminders" (existing key — fix desc only) ────────
           CURRENT (wrong — vault review nudge is a Free feature):
             title: "Advanced reminders are a Pro feature"
             desc:  "Get alerts for insurance expiry, FD maturity, and vault
                    review nudges. Available with KutumbKosh Pro."

           REPLACE desc WITH (title unchanged):
             title: "Advanced reminders are a Pro feature"
             desc:  "Get timely alerts for insurance policy expiry and FD
                    maturity dates. Available with KutumbKosh Pro."

           DO NOT TOUCH: "emergency_access" key — Product's handoff ID 45
           confirms no change is needed to the existing emergency_access entry
           once the new emergency_access_v2v3 key is added.

           Reference: HANDOFFS.md ID 45 (Product → S&M, Done), DECISIONS.md
           2026-05-12 | Product (Free vs Pro tier map).
DEADLINE:  Before public launch
STATUS:    Done — 2026-05-14. Two new keys added to UpgradePrompt.tsx:
           emergency_access_v2v3 and emergency_contact_limit. all_reminders description
           updated. emergency_access key left untouched per instruction.
ID:        48
---

FROM:      Shubham (Bug Report)
TO:        Engineering
PRIORITY:  High — UX/data integrity bug on a core form
REQUEST:   Trusted contact form (onboarding) had multiple bugs:
           1. Email field missing from JSX — user reported only one field visible
              despite form collecting both phone and email.
           2. Phone field error display referenced wrong key (email) — phone
              validation errors were silently dropped.
           3. Dashboard contact card showed only first truthy of email/phone
              instead of both.
DEADLINE:  Immediate
STATUS:    Done — 2026-05-12. All bugs fixed:
           1. src/app/onboarding/emergency-contact/page.tsx — Email Address field
              added to JSX with Mail icon, type="email", inputMode="email",
              proper validation wiring and FieldError display.
           2. Phone field className and FieldError corrected to reference "phone"
              key (was incorrectly referencing "email" key on both).
           3. src/app/dashboard/emergency/page.tsx — contact card now displays
              phone AND email separately (· phone · email) instead of first-truthy.
           TypeScript clean (0 errors). No commits made.
           NOTE: Resolves C1 and C2 from HANDOFFS.md ID 44 audit.
ID:        51
---
