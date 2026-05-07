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

### 2026-05-04 | Product
**Decision:** Three UX issues identified and approved for fix on the Emergency Access dashboard page (src/app/dashboard/emergency/page.tsx):
1. **Soft delete for trusted contacts** — Add `deleted_at` timestamptz column to `trusted_contacts` table. All queries must filter `.is("deleted_at", null)`. UI must offer a "Remove" button with inline confirmation. Hard delete is not permitted (preserves audit trail, consistent with zero-routine-access policy).
2. **Warning badge for incomplete contact records** — If a trusted contact record has both `contact_phone` and `contact_email` null/empty, show an amber "⚠ Missing contact info" badge on that card in the dashboard. This is a safeguard for records created before mandatory field enforcement; it does not replace form-level mandatory validation in onboarding.
3. **Always-visible labeled action buttons** — Replace `RefreshCw` icon + `opacity-0 group-hover:opacity-100` pattern with always-visible pill buttons: "Approve" (CheckCircle2, green) for PENDING, "Revoke Access" (ShieldOff, red) for ACTIVE, "Restore Access" (ShieldCheck, blue) for REVOKED. Hover-only patterns are broken on mobile and must be removed entirely.
**Rationale:** Delete is standard expected behaviour for any list UI; its absence is a usability gap. Silent "No contact info" fallback masked a data quality risk affecting emergency reachability. Hover-only buttons are inaccessible on touch devices.
**Impact:** Engineering (three changes to emergency/page.tsx + DB migration for deleted_at — see HANDOFFS.md).

---

### 2026-05-01 | Operations
**Decision:** Operations legal risk assessment completed using risk-severity matrix. Four risks identified. Sentry cross-border transfer cleared for production (YELLOW/9 after pseudonymisation mitigations — anonymous data, S.16 rules not yet notified). Three new HANDOFFS raised: (1) Terms of Service — CRITICAL/RED must exist before launch; (2) Supabase email template re-upload — HIGH, blocking wrong DPDPA language from being sent; (3) Sub-processor DPA review — HIGH/ORANGE for Supabase, Vercel, Razorpay.
**Rationale:** No ToS at launch = no liability protection, no governing law, no disclaimer of financial advice. This is a RED risk (25). Sub-processor DPAs are required under DPDPA 2023 for Data Fiduciaries. Email template re-upload is a direct violation of the 2026-04-28 Legal decision prohibiting DPDPA compliance claims.
**Impact:** Shubham (three direct action items); Engineering (ToS acceptance checkbox + /terms page once ToS is drafted); Legal (ToS draft).

---

### 2026-05-07 | Finance
**Decision:** ₹499/year Pro pricing is **GST-inclusive**. The user pays ₹499 total — no additional GST is charged at checkout. KutumbKosh collects ₹499, remits ₹76 GST, and retains ₹423 net revenue per Pro subscriber per year.
**GST breakdown per transaction:** Base value = ₹423.73 (₹499 × 100/118), GST @ 18% = ₹76.27 (₹499 × 18/118). Round to ₹423 base + ₹76 GST = ₹499 on the GST invoice. SAC code 998314 applies. IGST for out-of-state customers; CGST + SGST for same-state customers — confirm KutumbKosh's state of registration with CA at time of GSTIN registration.
**Rationale:** (1) The original ₹499 pricing decision (2026-04-28) was made on the basis of accessibility for Indian middle-class families — GST-exclusive would make the effective checkout price ₹589, directly contradicting that intent. (2) Consumer Protection (E-Commerce) Rules 2020 require displaying the total price inclusive of all applicable taxes on consumer-facing platforms. (3) Indian consumer SaaS convention is GST-inclusive display — a ₹499 + 18% GST format creates checkout confusion for the target demographic. (4) Pricing page simplicity: one number, no surprises for the user.
**Impact:** Engineering (Razorpay order amount must be set to ₹49900 paise — the full ₹499 inclusive amount; GST invoice generated on payment.captured must back-calculate base and GST, not add GST on top of ₹499); Marketing (pricing page shows ₹499/year with a "GST inclusive" label — do NOT show ₹499 + GST); Finance (reconciliation uses ₹76 GST per Pro transaction — do not use ₹499 × 18% = ₹89.82, which is the GST-exclusive formula); Operations (pass this decision to the external legal reviewer for ToS Clause 3 — the GST-inclusive confirmation must appear in the published Terms of Service).

---

### 2026-05-07 | Legal + Operations
**Decision:** DPDPA 2023 compliance assessment completed for emergency access V2 (inactivity timer auto-grant) and V3 (pre-authorized access). Both mechanisms are CONDITIONALLY CLEARED for Engineering to build, subject to 7 mandatory conditions.

**V2 Clearance — Inactivity Timer Auto-Grant:**
Upfront consent configuration satisfies DPDPA S.6 provided: (1) owner takes explicit affirmative action to set up the trigger; (2) the consent screen uses the locked copy in HANDOFFS.md ID 36; (3) grace period minimum is 14 days; (4) grace period notification is sent via both email AND in-app; (5) trusted contact is notified at designation with the locked copy in ID 36; (6) trusted contact's country of residence is captured (optional field) for future S.16 readiness. Purpose limitation is satisfied (emergency access is a core stated KutumbKosh purpose — must be listed in the Privacy Policy). S.16 cross-border transfer rules are not yet notified and present no hard legal blocker today.

**V3 Clearance — Pre-Authorized Access:**
Explicit pre-authorization satisfies DPDPA S.6 — cleaner consent basis than V2. Owner's ability to revoke at any time satisfies S.6(6) withdrawal requirement. Required: (1) V3 consent screen uses the locked copy in HANDOFFS.md ID 36; (2) trusted contact receives immediate notification email (locked copy in ID 36); (3) Engineering implements annual re-confirmation nudge for owner (KutumbKosh policy, not DPDPA mandate).

**External Legal Review:** Strongly recommended before production go-live of either feature, given that both mechanisms involve automated sharing of financial SPDI (IT SPDI Rules 2011) with a third party. Build may proceed; go-live requires external sign-off.

**Rationale:** Both mechanisms are defensible under DPDPA 2023 as conditional/pre-authorized consent models, provided the implementation follows the locked consent language and notification requirements. The weakest legal point in V2 is that auto-grant occurs by inaction (silence), which requires the explicit upfront setup and multi-channel grace period notification to be legally sound.
**Impact:** Product (may now raise Engineering handoff for V2 and V3 — all 7 conditions in HANDOFFS.md ID 36 must be engineering requirements); Engineering (build per conditions); Operations (ensure Privacy Policy draft in HANDOFFS.md ID 27 lists emergency access as an explicit data processing purpose); Legal (engage external legal reviewer before production go-live of V2/V3).

---

### 2026-05-07 | Product
**Decision:** Emergency access V2 (inactivity timer auto-grant) and V3 (pre-authorized access) are confirmed for implementation before public launch. V1 manual-only access is insufficient to deliver the core product promise ("your family is never left guessing" — infographic step 6). Both V2 and V3 are required for the product to honestly support that claim.
**Scope locked:**
- V2: Configurable inactivity timer (owner selects window: 30/60/90/180 days). System notifies trusted contact when timer fires. Owner receives grace period (minimum 14 days, owner selects up to 30 days) to deny. If no denial, access is auto-granted.
- V3: Owner explicitly pre-authorizes a trusted contact for immediate, open-ended vault access. Access remains active until owner revokes. Annual re-confirmation nudge from system.
- Access level for both V2 and V3: summary view only (asset types, institution names, nominee names — no account numbers, no passwords). This matches the existing stated design; per-contact tiered access levels are deferred post-launch.
- All 7 Operations conditions (HANDOFFS.md ID 36 / DECISIONS.md 2026-05-07 Legal+Operations) are mandatory engineering requirements — not optional enhancements.
- External legal review is required before either feature goes live in production. Build may proceed immediately.
**Rationale:** Users will not pay ₹499/year for a promise. The inactivity trigger is the mechanism that makes the emergency promise real — without it, the product is a financial organizer, not an emergency vault. Operations has conditionally cleared both mechanisms under DPDPA 2023.
**Impact:** Engineering (full V2+V3 build — see HANDOFFS.md ID 37); Operations (ensure Privacy Policy lists emergency access as an explicit data processing purpose per HANDOFFS.md ID 27; engage external legal reviewer before go-live); Legal (external review required before V2/V3 production deploy).

---

### 2026-05-07 | Sales & Marketing
**Decision:** Pricing copy locked for all channels. Violations in src/app/dashboard/pricing/page.tsx identified and escalated to Tech via HANDOFFS.md ID 40.
**Copy locked:**
- Pricing page Pro card: `₹499` (large bold) | `/year` (muted) | `Inclusive of GST` (text-xs text-gray-400, new line below /year)
- All other channels (social, WhatsApp, email, ads): `₹499/year` — no GST qualifier
- Launch-day headline: "Protect your family's financial legacy for ₹499/year."
- Single source of truth at docs/marketing/pricing-copy-lock.md
**Prohibited phrases (all channels, all future sessions):** `₹499 + GST`, `₹499 + 18% GST`, `₹589`, `₹499 + taxes`, `starting at ₹499`, `₹79/month`, `Annual saves you X% compared to monthly.`
**Violations found in pricing/page.tsx (Tech to fix — HANDOFFS.md ID 40):**
1. Line 126: `or ₹79/month` — monthly billing does not exist at launch (contradicts DECISIONS.md 2026-04-28 Finance)
2. Lines 122–125: Missing `Inclusive of GST` label below price (required per Consumer Protection (E-Commerce) Rules 2020)
3. Line 237 FAQ: "Can I switch between monthly and annual?" references non-existent monthly billing
**Rationale:** Consumer Protection (E-Commerce) Rules 2020 require total price inclusive of taxes to be displayed. ₹79/month reference and monthly FAQ create false user expectations — no monthly billing exists at launch per DECISIONS.md 2026-04-28 Finance. Locking copy now prevents violations spreading across GTM assets.
**Impact:** Tech (three fixes in pricing/page.tsx — see HANDOFFS.md ID 40 for exact code changes); Shubham (review pricing-copy-lock.md before any future pricing copy is created — it supersedes all prior pricing references).

---

_Add new decisions above this line, following the format._
