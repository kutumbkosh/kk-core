# KutumbKosh — Launch Checklist

## Legal & Compliance
- [ ] Verify DPDPA 2023 compliance — consult a legal advisor, draft a formal privacy policy, set up consent mechanisms, and data deletion flows.
  - [x] Landing page copy softened — "DPDPA Compliant" replaced in coming-soon/index.html and security/page.tsx per DECISIONS.md
- [ ] Draft and publish Privacy Policy page
- [ ] Draft and publish Terms of Service page
- [ ] Add cookie consent banner (if applicable)

## Landing Page
- [ ] Upload updated `coming-soon/index.html` to Cloudflare Pages
- [ ] Test Web3Forms waitlist end-to-end (submit test email, confirm delivery)
- [ ] Remove `google-apps-script.js` from coming-soon folder before uploading
- [ ] Set up a custom domain on Cloudflare (if not already done)

## Product
- [ ] Final QA pass on all dashboard flows (assets, nominees, reminders)
- [ ] Test Razorpay payment flow (Pro subscription)
- [ ] Vault Dossier PDF generation — verify output quality
- [ ] Emergency access feature — test invite and access flow
- [ ] Mobile responsiveness check across devices

## Infrastructure
- [ ] Vercel production deployment (currently staging only)
- [ ] Set up production Supabase environment (separate from staging)
- [ ] Configure production environment variables on Vercel
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Set up analytics (Plausible, PostHog, or similar)

## Branding & Marketing
- [ ] Finalize social media profiles (Instagram, LinkedIn, Twitter/X)
- [ ] Prepare launch-day social posts using brand kit templates
- [ ] Set up care@kutumbkosh.com email (if not already)
- [ ] Notify waitlist subscribers on launch day
