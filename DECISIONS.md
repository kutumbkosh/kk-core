# KutumbKosh — Decision Log

A record of key decisions made across all departments. This prevents contradictions between departments and gives every AI session the "why" behind choices already made.

## Format

Each entry has:
- **Date** — when the decision was made
- **Department** — who made it
- **Decision** — what was decided (be specific)
- **Rationale** — why (brief)
- **Impact** — which other departments are affected

---

## Decisions

### 2026-04-28 | Legal
**Decision:** Do not claim "DPDPA 2023 Compliant" anywhere in the product or marketing.
**Rationale:** Formal legal verification has not been done. Risk of misrepresentation.
**Impact:** Marketing (landing page copy), Engineering (remove any compliance badges from UI), Product (no compliance claims in feature descriptions).

---

### 2026-04-28 | Engineering
**Decision:** Use Supabase 256-bit AES encryption at rest + TLS in transit as the stated security posture.
**Rationale:** This is factually accurate — Supabase provides this by default. Safe to claim publicly.
**Impact:** Marketing (can use this claim in copy), Legal (approved security language).

---

### 2026-04-28 | Finance
**Decision:** Pro tier priced at ₹499/year.
**Rationale:** Annual billing simplicity, accessible price point for Indian middle-class families. No monthly billing option at launch.
**Impact:** Engineering (Razorpay order creation uses annual amount), Marketing (pricing copy), Product (upgrade prompts reference ₹499/year).

---

### 2026-04-28 | Operations
**Decision:** Department coordination via HANDOFFS.md (async) + DECISIONS.md (shared context).
**Rationale:** Solo founder managing all departments via AI — a lightweight file-based system beats any heavyweight tool.
**Impact:** All departments (read HANDOFFS.md at the start of every session).

---

### 2026-04-28 | Legal
**Decision:** Shubham (Founder) is appointed as the Grievance Officer under DPDPA 2023 S.13. Contact: care@kutumbkosh.com. Response SLA: 48-hour acknowledgement, 30-day resolution.
**Rationale:** DPDPA S.13 requires a named Grievance Officer. As sole founder, Shubham is the only viable appointee at this stage.
**Impact:** Engineering (publish /grievance page and link from /privacy footer), Marketing (include grievance contact in any user-facing communications).

---

### 2026-04-28 | Legal
**Decision:** KutumbKosh operates a zero-routine-access policy — no team member has standard access to user vault contents. Formally documented in Internal Access Policy v1.0.
**Rationale:** DPDPA 2023 purpose limitation and accountability obligations. Also required to truthfully claim "we cannot view your data."
**Impact:** Engineering (service role key restricted to account deletion only; admin_access_log table added; audit logging on all admin DB functions), Operations (any support request touching vault data requires founder approval and must be logged).

---

### 2026-04-28 | Legal
**Decision:** Supabase service role key is approved for use in exactly one location: `src/app/api/account/delete/route.ts`. Any new use requires explicit founder approval and must be documented in the Internal Access Policy before deployment.
**Rationale:** Service role key bypasses RLS — unrestricted use would invalidate the zero-access policy.
**Impact:** Engineering (no new uses of the service role key without Legal/Founder sign-off).

---

### 2026-04-30 | Legal
**Decision:** Full DPDPA compliance language scan completed across all src/, coming-soon/, and supabase/ files. 9 violations found across 6 files (page.tsx ×2, auth/verify/page.tsx, onboarding/page.tsx, privacy/page.tsx ×2, confirm-signup.html ×2, magic-link.html). All raised to Engineering via HANDOFFS.md with exact replacement text.
**Rationale:** Prior Engineering fix only addressed coming-soon/index.html and security/page.tsx. Email templates, login page, onboarding, and privacy policy contained unchecked violations.
**Impact:** Engineering (fix 9 instances per HANDOFFS.md); Operations (after code fix, Supabase email templates must be manually re-uploaded in Dashboard for Dev, Staging, and Production separately — code changes alone do not update what Supabase sends).

---

### 2026-04-30 | Security
**Decision:** Security launch readiness audit completed. Go/No-Go verdict: NO-GO. Three Engineering blockers found before production deploy is safe.
**Rationale:** Systematic scan of API auth, RLS coverage, secrets, security headers, and error handling. Critical finding: prior session's code changes to admin-views.sql and schema.sql were never saved to disk. The open HANDOFF directing Shubham to run SQL in production references files that still contain wrong content (admin@kutumbkosh.com as admin, no audit logging, no admin_access_log table). Running those files in production as-is would be a security regression.
**Impact:** Engineering (three new HANDOFFS raised — see HANDOFFS.md Security section); Shubham (existing SQL handoff blocked until Engineering confirms fixes); all departments (production deploy date pushed until blockers resolved).

---

### 2026-05-01 | Security
**Decision:** Re-verification audit completed. Go/No-Go verdict: GO — cleared for production deploy (with two Shubham action items below).
**Rationale:** All three Engineering blockers confirmed fixed in code: (1) admin-views.sql uses shubham.git@gmail.com in is_admin(), log_admin_access() function added, PERFORM audit calls in admin_overview_metrics() and admin_user_list(); (2) schema.sql has admin_access_log table + RLS + indexes; (3) vercel.json host pattern is .*\.vercel\.app with "noindex, nofollow". Also confirmed: referrals RLS UPDATE policy added, robots.txt correct, sitemap.ts present, layout.tsx has full SEO meta + OG + Twitter + canonical. One open item: public/og-image.png does not exist yet — Marketing must create and deploy before launch to enable WhatsApp/social sharing previews.
**Impact:** Shubham — two pre-production actions required: (1) run Production SQL migrations (admin_access_log table + admin-views.sql) in Supabase Production SQL editor; (2) set up Google Search Console. Marketing — og-image.png (1200×630px) must be created before launch.

---

### 2026-05-01 | Marketing
**Decision:** Pre-launch marketing audit completed. coming-soon/index.html SEO/OG tags were not updated by the prior Engineering handoff — only app/layout.tsx was updated. Two new handoffs raised by Marketing: Engineering to fix coming-soon page OG/Twitter/meta; Shubham to action waitlist, social profiles, launch posts, and email verification.
**Rationale:** The coming-soon page is the live public URL. Missing og:image and Twitter Card tags means WhatsApp shares (primary word-of-mouth channel) show no preview image. og:title "Coming Soon" will appear on every WhatsApp share, weakening brand recognition pre-launch.
**Impact:** Engineering (fix coming-soon/index.html before launch day); Shubham (five marketing action items before launch day — see HANDOFFS.md).

---

### 2026-05-02 | Tech
**Decision:** Sentry (error monitoring) stores data in US/EU. Under DPDPA 2023 S.16, cross-border transfer of personal data is subject to restrictions once transfer rules are notified by the Indian government. Until a self-hosted India-region alternative is in place, Sentry is approved for use **only** with mandatory pseudonymisation applied at source in `sentry.client.config.ts` and `sentry.server.config.ts`:
- User context (`user.id`, `user.email`, `user.ip_address`) deleted from all events before transmission
- UUIDs in request URLs replaced with `[id]` (e.g. `/assets/abc-uuid` → `/assets/[id]`)
- Cookies and `Authorization`/`Cookie` headers stripped from request context
- All fetch/XHR breadcrumbs dropped (may contain auth tokens)
- Sentry Replay masks all text, inputs, and media — no vault content ever captured

Sentry is restricted to **dev and staging only** until Operations formally clears it for production under DPDPA S.16.

**Rationale:** DPDPA 2023 S.16 cross-border transfer rules not yet notified — no hard legal blocker today. However system-rules.md Rule 12 requires third-party tools to comply with DPDPA in spirit. Pseudonymisation ensures no user-identifiable data leaves India via Sentry. Full remediation (self-hosted in India) is the long-term goal and is tracked in HANDOFFS.md.
**Impact:** Engineering (sentry configs updated with pseudonymisation — both client and server); Operations (open handoff: formal DPDPA S.16 assessment required before production enable); Shubham (do not set `NEXT_PUBLIC_SENTRY_DSN` in Vercel **production** env vars until Operations clears this — dev/staging env vars are fine).

---

### 2026-05-02 | Product
**Decision:** "How KutumbKosh Works" infographic — 6-step linear flow (Option A), landing page first, in-app onboarding deferred to post-launch.
**Step content locked:**
1. Create your vault — "Set up your profile in minutes"
2. Add every asset — "Bank accounts, insurance, FDs, property and more"
3. Link your nominees — "Assign the right person to each asset"
4. Add a trusted contact — "Someone you trust to act on your behalf"
5. Export your vault dossier — "A complete record your family can refer to anytime"
6. Your family is never left guessing — "If the unexpected happens, your trusted contact gets access — instantly"
**Format:** Static illustrated steps (horizontal/vertical flow). Animated or scroll-triggered deferred to post-launch.
**Rationale:** Landing page is live and has no product explainer — this directly impacts waitlist conversion. Linear 6-step flow is mobile-friendly and scannable. Emergency access scenario included as step 6 to communicate the product's key differentiator. Step 6 headline uses positive framing per brand voice rules (no fear-based language).
**Impact:** Marketing (design the 6-step visual using brand colours and icon set — see HANDOFFS.md); Tech (implement HTML/CSS section in coming-soon/index.html and src/app/page.tsx — see HANDOFFS.md); LAUNCH-TODO.md updated.

---

### 2026-05-02 | Sales & Marketing
**Decision:** Pre-launch Sales & Marketing task audit completed. Pending items identified and prioritised. Three items actioned this session:
1. "How KutumbKosh Works" 6-step infographic designed and delivered to docs/marketing/how-it-works-infographic.html. Copy is locked per DECISIONS.md 2026-05-02 (Product). Tech handoff written in HANDOFFS.md.
2. coming-soon/index.html OG/Twitter/meta tags — verified correct (lines 6–19 confirmed). DECISIONS.md 2026-05-01 gap closed; duplicate STATUS line in HANDOFFS.md removed.
3. Shubham 5-item marketing handoff — confirmed present and correctly written in HANDOFFS.md (Open). Department label corrected from "Marketing" to "Sales & Marketing" per system-rules.md.
**Rationale:** Rule 2 (mandatory context load), Rule 7 (definition of done), Rule 10 (file updates before session end) all applied. No work done outside Sales & Marketing scope.
**Impact:** Tech (implement infographic in coming-soon/index.html and src/app/page.tsx — see HANDOFFS.md); Shubham (5 marketing pre-launch actions remain open — see HANDOFFS.md).

---

_Add new decisions above this line, following the format._
