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

           Before the production Supabase environment is used by real users, run
           both scripts in the Production Supabase SQL Editor:
           1. The admin_access_log table block from the bottom of supabase/schema.sql
           2. The full supabase/admin-views.sql (recreates is_admin() with
              shubham.git@gmail.com and adds log_admin_access() function)

           This is required for the Internal Access Policy to be technically enforced
           in production. Until this is done, the audit trail does not exist in prod.
DEADLINE:  Before production deploy
STATUS:    Open
---

---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Launch Blocker
REFERENCE: docs/marketing/seo-audit-apr-2026.html (full audit with context for all items below)
REQUEST:   Verify and fix robots.txt and sitemap.xml before launch.

           1. Confirm kutumbkosh.com/robots.txt exists and allows all crawlers.
              It must NOT contain "Disallow: /". Cloudflare Pages may auto-generate
              a restrictive one — verify this explicitly.

           2. Generate sitemap.xml via Next.js metadata API (app/sitemap.ts).
              Include the homepage and all future /blog/* pages.
              Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

           3. Once sitemap is live, submit it to Google Search Console.
              (Shubham to verify Google Search Console ownership if not yet done.)

           Reason: kutumbkosh.com has zero Google-indexed pages as of April 2026.
           This is the single highest-impact SEO action before launch.
DEADLINE:  Before production deploy
STATUS:    Open
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  High — Before Launch
REQUEST:   Update the coming-soon page (and app) with correct SEO meta tags.

           Homepage title tag (50–60 chars):
             KutumbKosh — Your Family's Financial Vault | India

           Meta description (150–160 chars):
             Organize, protect, and pass on your family's financial legacy.
             Track bank accounts, insurance, FDs, PPF, and all nominees —
             in one secure vault.

           Also add Open Graph and Twitter Card tags:
             og:title    → KutumbKosh — Your Family's Financial Vault
             og:description → (same as meta description above)
             og:image    → /og-image.png (1200×630px — see Design handoff below)
             og:type     → website
             og:url      → https://kutumbkosh.com
             twitter:card → summary_large_image
             twitter:title → KutumbKosh — Your Family's Financial Vault
             twitter:description → (same as meta description above)
             twitter:image → /og-image.png

           In Next.js 14, use the Metadata API in app/layout.tsx or
           app/page.tsx. Reference: https://nextjs.org/docs/app/api-reference/functions/generate-metadata

           Reason: Without a proper title/meta, Google and social platforms show
           garbled or empty previews. OG tags are critical for WhatsApp sharing,
           which is the primary word-of-mouth channel for this product.
DEADLINE:  Before launch day
STATUS:    Open
---

FROM:      Marketing
TO:        Engineering
PRIORITY:  Medium — Before Launch
REQUEST:   Add self-referencing canonical tags to all pages.

           In Next.js 14, set canonical in the Metadata API:
             export const metadata = {
               alternates: { canonical: 'https://kutumbkosh.com' }
             }
           For blog posts, use the full post URL as the canonical.

           Also ensure www.kutumbkosh.com redirects to kutumbkosh.com (or vice versa)
           with a 301 at the Cloudflare level — not both serving the same content.

           Reason: Prevents duplicate content signals from www vs non-www, and from
           any URL parameter variations.
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
STATUS:    Done — vercel.json updated. Header rule now matches .*\.vercel\.app (covers all preview and staging Vercel URLs). Value updated to "noindex, nofollow". Previous rule only matched .*staging.* and used "noindex" only.
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
 