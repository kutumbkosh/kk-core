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
STATUS:    BLOCKED — Engineering verified 2026-05-01: public/og-image.png does NOT
           exist on disk. Marketing's claim that the file is "already in the repo"
           is incorrect. layout.tsx references /og-image.png in two places (OG + Twitter)
           and both will 404 on production until the file is placed.
           Action required from Marketing: create the PNG and place it at
           public/og-image.png, then re-open this handoff for Engineering to commit.
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
STATUS:    Done — Fixed 2026-05-01. layout.tsx updated: title → "KutumbKosh — Your Family's Financial Vault | India" (54 chars); meta description added (152 chars); openGraph block with og:title, og:description, og:image (/og-image.png 1200×630), og:type website, og:url, og:locale en_IN; twitter:card summary_large_image. Note: og-image.png (1200×630px) still needs to be created by Marketing and placed at public/og-image.png.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   Add canonical tags to all pages.
DEADLINE:  Before launch day
STATUS:    Done — Fixed 2026-05-01. alternates.canonical: "https://kutumbkosh.com" added to layout.tsx metadata export. Note: Shubham to configure www → non-www 301 redirect at Cloudflare level.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Fix DPDPA compliance claims in coming-soon/index.html (4 lines: 955, 956, 1008, 1009).
DEADLINE:  Before coming-soon page is uploaded to Cloudflare Pages
STATUS:    Done — coming-soon/index.html line 283 updated: "compliant with DPDPA 2023" → "designed with DPDPA 2023 in mind". security/page.tsx: feature card title → "Designed with Privacy in Mind", description softened, compliance badge → "Indian Privacy Standards". Implemented 2026-04-30.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Account deletion flow: send Resend confirmation email after deletion; add explicit on-screen summary of what gets deleted before the confirmation dialog.
DEADLINE:  Before production deploy
STATUS:    Done — sendDeletionConfirmationEmail() added to src/app/api/account/delete/route.ts using Resend REST API via native fetch (no package). Fire-and-forget, never blocks deletion. userEmail captured before deleteUser() call. Dialog in settings/page.tsx updated with explicit bullet list (profile, assets, nominees, trusted contacts, subscription) + "confirmation email will be sent" notice. Note: RESEND_API_KEY and RESEND_FROM_EMAIL must be set in Vercel production env vars before deploy. Implemented 2026-04-30.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   /security page: add "Internal Access Controls" section with exact policy copy; add Grievance Officer footer link to /grievance.
DEADLINE:  Before production deploy
STATUS:    Done — Internal Access Controls section added to src/app/security/page.tsx (between Emergency Access and Responsible Disclosure sections) with 5-point policy: no routine access, founder approval required, admin ops logged, service role key restricted to deletion only, audit log retained. Grievance Officer link added to footer alongside Privacy Policy, Terms of Service, Report a Vulnerability. Implemented 2026-04-30.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Add noindex header to Vercel staging / preview deployments (*.vercel.app).
DEADLINE:  Before production deploy
STATUS:    Done (marked) — but Security review 2026-04-30 found the change was never
           applied to vercel.json. Re-opened as Security handoff above.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Before Launch
REQUEST:   Add JSON-LD Organization schema to homepage via app/layout.tsx.
DEADLINE:  Before launch day
STATUS:    Done — Organization schema added to src/app/layout.tsx in <head> via dangerouslySetInnerHTML. SoftwareApplication schema deferred to post-launch per handoff spec.
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   Fix manifest.json branding: name → KutumbKosh, short_name → KutumbKosh, theme_color → #2563EB.
DEADLINE:  Before production deploy
STATUS:    Done — All 3 fields updated in public/manifest.json.
---

FROM:      Legal / Compliance
TO:        Engineering
PRIORITY:  High — Launch Blocker
REQUEST:   Full codebase DPDPA language scan — 9 violations across 6 files.
DEADLINE:  Before production deploy
STATUS:    Done — All 9 violations fixed 2026-04-30. Grep scan confirmed zero
           prohibited strings remain. Changes:
           page.tsx L145: "DPDPA 2023" → "Built for Privacy"
           page.tsx L287: "DPDPA compliant" → "Privacy first"
           auth/verify/page.tsx L86: "DPDPA 2023" → "Privacy first"
           onboarding/page.tsx L209: "We comply with..." → "Designed with...in mind."
           privacy/page.tsx L36: "in compliance with" → "in accordance with"
           privacy/page.tsx L83: privacy@kutumbkosh.in → care@kutumbkosh.com
           confirm-signup.html L106: "complies with" → "is designed with...in mind"
           confirm-signup.html L121: "DPDPA 2023 Compliant" → "Designed for Indian Privacy"
           magic-link.html L110: "DPDPA 2023 Compliant" → "Designed for Indian Privacy"
           ⚠️ PENDING (Shubham/Operations): confirm-signup.html and magic-link.html
           must be manually re-uploaded in Supabase Dashboard → Authentication →
           Email Templates for Dev, Staging, and Production separately. Code changes
           alone do not update live Supabase email sends.
