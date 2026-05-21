# KutumbKosh — Compliance-Sensitive Files Registry

**Owner:** Operations  
**Created:** 2026-05-21  
**Authority:** DECISIONS.md 2026-04-28 | Legal, 2026-04-30 | Legal  
**Purpose:** Prevent accidental revert of DPDPA-compliant language during routine edits or re-deploys.

---

## Why This File Exists

`coming-soon/index.html` was reverted to non-compliant DPDPA language twice (2026-04-30 and 2026-05-01). Each time, Engineering had to re-fix it. This registry provides a single reference so any editor — human or AI — knows exactly which lines must be preserved and what the approved replacement text is.

---

## Registry of Compliance-Sensitive Files

### 1. `coming-soon/index.html` — Cloudflare Pages (live)

**Risk level:** HIGH — this is the live public URL; any revert is immediately visible to all visitors.  
**Last verified compliant:** 2026-05-21

| Line (approx.) | Sensitive content | Constraint | Approved text |
|---|---|---|---|
| ~1336 | DPDPA claim in feature card | Must NOT say "DPDPA 2023 Compliant" | `Built for India, designed with DPDPA 2023 in mind. 256-bit encryption. Zero data sharing with third parties.` |

**DPDPA rule:** DECISIONS.md 2026-04-28 \| Legal — Do not claim "DPDPA 2023 Compliant" anywhere. Use "designed with DPDPA 2023 in mind" or "designed with Indian data privacy standards in mind".

---

### 2. `src/app/privacy/page.tsx` — App privacy page

**Risk level:** HIGH — published at kutumbkosh.com/privacy, directly legal-facing.  
**Last verified compliant:** 2026-04-30 (Engineering fix applied)

| Section | Constraint | Approved approach |
|---|---|---|
| DPDPA compliance claim | Must NOT state "fully DPDPA compliant" | Use "designed with Indian data privacy standards in mind" |
| Grievance Officer section | Must name Shubham, care@kutumbkosh.com, 48h ack / 30-day resolution | Per DECISIONS.md 2026-04-28 \| Legal |
| Data processing purposes | Must list emergency access as an explicit purpose once V2/V3 go live | Per HANDOFFS.md ID 36 clearance condition |

---

### 3. Supabase Auth Email Templates — `confirm-signup.html` and `magic-link.html`

**Risk level:** HIGH — code changes alone do NOT update what Supabase sends. Templates must be manually re-uploaded in the Supabase Dashboard for Dev, Staging, and Production separately.  
**Violation history:** Both templates contained non-compliant DPDPA language (DECISIONS.md 2026-04-30).

| File | Constraint | Action on change |
|---|---|---|
| `confirm-signup.html` | Must NOT contain "DPDPA Compliant" claims | Re-upload in Supabase Dashboard → Authentication → Email Templates for each environment |
| `magic-link.html` | Must NOT contain "DPDPA Compliant" claims | Same as above |

**Important:** After any code edit to these templates, Shubham must manually re-upload them. This is a Shubham direct action — it cannot be automated.

---

### 4. `src/app/auth/verify/page.tsx` — Verification page

**Risk level:** MEDIUM  
**Last verified compliant:** 2026-04-30 (Engineering fix applied)

| Constraint | Approved approach |
|---|---|
| Any DPDPA or compliance claims | Use "designed with Indian data privacy standards in mind" only |

---

### 5. `src/app/onboarding/page.tsx` — Onboarding flow

**Risk level:** MEDIUM — user-facing, seen at first login.  
**Last verified compliant:** 2026-04-30 (Engineering fix applied)

| Constraint | Approved approach |
|---|---|
| Any DPDPA or compliance claims | Use "designed with Indian data privacy standards in mind" only |
| Data collection disclosures | Must align with Privacy Policy stated purposes |

---

## Pre-Upload Checklist — `coming-soon/index.html` to Cloudflare Pages

**Mandatory — complete this checklist before every upload. Do not skip any step.**

```
KUTUMBKOSH — CLOUDFLARE PAGES PRE-UPLOAD CHECKLIST
coming-soon/index.html
Date of upload: _______________
Uploaded by: _______________

DPDPA LANGUAGE CHECKS (required — cannot skip)
□ 1. Search file for "DPDPA 2023 Compliant" — must return 0 results.
□ 2. Search file for "DPDPA compliant" (case-insensitive) — must return 0 results.
□ 3. Search file for "designed with DPDPA 2023 in mind" — must return exactly 1 result at the feature card.
     Exact approved text: "Built for India, designed with DPDPA 2023 in mind. 256-bit encryption.
     Zero data sharing with third parties."
□ 4. Search file for "256-bit encryption" — confirm this claim is present (approved per DECISIONS.md 2026-04-28 | Engineering).
□ 5. Search file for "compliant" — review every match. None may claim formal legal compliance with any regulation.

CONTENT INTEGRITY CHECKS
□ 6. Verify the waitlist form Web3Forms key is still present and correct.
□ 7. Verify OG tags (og:title, og:description, og:image) are intact — check lines 6–19.
□ 8. Verify canonical URL is set to https://kutumbkosh.com.

SIGN-OFF
□ All checks above passed.
Signature / initials: _______________ Date: _______________
```

---

## Recommended Comment Block for `coming-soon/index.html`

Add the following comment immediately after the opening `<html>` tag (or at the very top of the `<head>`) so any editor opening the file sees the compliance constraints immediately.

```html
<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║  KUTUMBKOSH — COMPLIANCE-SENSITIVE FILE                             ║
  ║  Do NOT upload to Cloudflare Pages without completing the           ║
  ║  pre-upload checklist in:                                           ║
  ║  vault/operations/compliance-sensitive-files.md                     ║
  ║                                                                     ║
  ║  DPDPA LANGUAGE RULES (DECISIONS.md 2026-04-28 | Legal):           ║
  ║  ✗ FORBIDDEN: "DPDPA 2023 Compliant" or "DPDPA compliant"         ║
  ║  ✓ APPROVED:  "designed with DPDPA 2023 in mind"                  ║
  ║  ✓ APPROVED:  "designed with Indian data privacy standards in mind" ║
  ║                                                                     ║
  ║  Compliance-sensitive line (approx.):                               ║
  ║  Feature card ~line 1336 — DPDPA privacy claim                     ║
  ║  Approved text: "Built for India, designed with DPDPA 2023 in      ║
  ║  mind. 256-bit encryption. Zero data sharing with third parties."   ║
  ╚══════════════════════════════════════════════════════════════════════╝
-->
```

---

## Engineering Handoff Requirement

The comment block above must be added to `coming-soon/index.html` by Engineering. This is a code change — Operations cannot make it directly. An Engineering handoff has been raised (see HANDOFFS.md).

---

## Change Log

| Date | Change | By |
|---|---|---|
| 2026-05-21 | Registry created | Operations |
