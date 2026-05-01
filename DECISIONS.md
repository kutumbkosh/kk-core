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

_Add new decisions above this line, following the format._
