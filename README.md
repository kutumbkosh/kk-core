# KutumbKosh

**Your Family's Financial Safety Net**

A secure vault for Indian families to organize financial assets, map nominees, detect gaps, and enable emergency access for trusted contacts.

Built with Next.js 14, Supabase (PostgreSQL + Auth), Tailwind CSS, and TypeScript.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Multi-Environment Strategy](#multi-environment-strategy)
5. [Local Development](#local-development)
6. [Database Setup](#database-setup)
7. [Deploying to Staging](#deploying-to-staging)
8. [Deploying to Production](#deploying-to-production)
9. [Environment Variables Reference](#environment-variables-reference)
10. [Git Workflow](#git-workflow)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
User Browser
    |
    v
Vercel (Next.js 14 — App Router)
    |
    v
Supabase
  ├── PostgreSQL (data)
  ├── Auth (magic link login)
  └── Row Level Security (data isolation)
```

Three environments, three separate Supabase projects, one Vercel project with branch-based deployments:

| Environment | Branch    | URL                         | Supabase Project    |
|-------------|-----------|-----------------------------|--------------------|
| Development | `feature/*` / local | `localhost:3000`  | `kutumbkosh-dev`    |
| Staging     | `staging` | `staging.kutumbkosh.com`      | `kutumbkosh-staging`|
| Production  | `main`    | `kutumbkosh.com`              | `kutumbkosh-prod`   |

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** 18.17 or later — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)
- **Supabase account** — [Sign up free](https://supabase.com/)
- **Vercel account** — [Sign up free](https://vercel.com/)
- **Domain** (for production) — `kutumbkosh.com` recommended

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/kutumbkosh.git
cd kutumbkosh
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your local environment file

```bash
cp .env.example .env.local
```

### 4. Fill in your Supabase credentials

Open `.env.local` and set:

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MOCK_PAYMENTS=true
```

Get the URL and Anon Key from: **Supabase Dashboard > Settings > API**

---

## Multi-Environment Strategy

### Why three environments?

- **Dev** — Break things freely. Test with fake data. Local only.
- **Staging** — Mirror of production. Test the full flow before going live. Catch bugs here, not in prod.
- **Production** — Real users, real data. Only tested code reaches here.

### Supabase: Three separate projects

Create three projects in Supabase (all can be on the free tier initially):

| Project Name       | Purpose              |
|--------------------|----------------------|
| `kutumbkosh-dev`    | Local development    |
| `kutumbkosh-staging`| Staging environment  |
| `kutumbkosh-prod`   | Production           |

Run `supabase/schema.sql` in each project's SQL Editor to set up the database.

For dev and staging, also run `supabase/seed.sql` to populate test data (see [Database Setup](#database-setup)).

### Vercel: Branch-based deployments

Vercel automatically deploys based on Git branches:

| Push to branch | Deploys to              | Uses env vars scoped to |
|----------------|-------------------------|-------------------------|
| `main`         | `kutumbkosh.com` (production) | Production            |
| `staging`      | `staging.kutumbkosh.com`  | Preview                 |
| Any other      | Preview URL (auto-generated) | Preview              |

---

## Local Development

### Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll see a green "DEV" badge in the bottom-left corner.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (development mode) |
| `npm run dev:staging` | Start dev server simulating staging |
| `npm run build` | Build for deployment |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

### Environment badge

In development and staging, a small floating badge appears in the bottom-left corner showing which environment you're on (green "DEV" or amber "STAGING"). This is automatically hidden in production.

---

## Database Setup

### Initial setup (all environments)

1. Go to your Supabase project's **SQL Editor**
2. Open and run `supabase/schema.sql`
3. This creates all tables, RLS policies, indexes, and triggers

### Seed data (dev/staging only)

1. Sign up in the app using email: `test@kutumbkosh.dev`
2. Go to **Supabase Dashboard > Authentication > Users**
3. Copy the user's UUID
4. Open `supabase/seed.sql`, replace `REPLACE_WITH_USER_UUID` with the actual UUID
5. Run the script in SQL Editor

This creates a fully populated test account with: 5 assets (bank, FD, mutual fund, insurance, EPF), 3 nominees (spouse, child, parent), asset-nominee mappings with share percentages, a trusted contact, an emergency dossier with instructions, and audit log entries.

### Schema changes

When you need to modify the database schema:

1. Write the migration SQL
2. Test in dev first
3. Apply to staging and verify
4. Then apply to production

Keep a `supabase/migrations/` folder for versioned changes (e.g., `001_add_family_vaults.sql`).

---

## Deploying to Staging

### First-time setup

1. **Create the staging branch:**

```bash
git checkout -b staging
git push -u origin staging
```

2. **Set up Vercel environment variables:**

Go to **Vercel Dashboard > Your Project > Settings > Environment Variables**. Add these for the **Preview** environment:

```
NEXT_PUBLIC_APP_ENV = staging
NEXT_PUBLIC_SUPABASE_URL = https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-staging-anon-key
NEXT_PUBLIC_APP_URL = https://staging.kutumbkosh.com
NEXT_PUBLIC_MOCK_PAYMENTS = true
```

3. **Add custom domain (optional):**

In Vercel, go to **Domains** and add `staging.kutumbkosh.com` linked to the `staging` branch.

### Deploying updates to staging

```bash
# From your feature branch
git checkout staging
git merge feature/your-feature
git push origin staging
```

Vercel auto-deploys. Check the deployment at your staging URL.

---

## Deploying to Production

### First-time setup

1. **Set up Vercel environment variables:**

Go to **Vercel Dashboard > Settings > Environment Variables**. Add these for the **Production** environment:

```
NEXT_PUBLIC_APP_ENV = production
NEXT_PUBLIC_SUPABASE_URL = https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-prod-anon-key
NEXT_PUBLIC_APP_URL = https://kutumbkosh.com
NEXT_PUBLIC_MOCK_PAYMENTS = false
```

2. **Add your production domain:**

In Vercel, go to **Domains** and add `kutumbkosh.com`. Update your domain registrar's DNS:
   - Type: `CNAME`
   - Name: `@` (or `kutumbkosh.com`)
   - Value: `cname.vercel-dns.com`

Vercel provisions SSL automatically.

3. **Update Supabase redirect URLs:**

In your production Supabase project, go to **Authentication > URL Configuration** and set:
   - Site URL: `https://kutumbkosh.com`
   - Redirect URLs: `https://kutumbkosh.com/auth/callback`

### Deploying updates to production

```bash
# Only deploy tested code from staging
git checkout main
git merge staging
git push origin main
```

Vercel auto-deploys to production. Verify at `kutumbkosh.com`.

### Production checklist

Before your first production deploy, verify:

- [ ] Supabase production project created with schema.sql applied
- [ ] RLS is enabled on ALL tables (check Supabase dashboard)
- [ ] Auth email templates customized with KutumbKosh branding
- [ ] Redirect URLs set correctly in Supabase Auth settings
- [ ] All Vercel env vars set for Production scope
- [ ] Domain DNS configured and SSL active
- [ ] Tested full flow: signup > onboarding > add asset > add nominee > settings
- [ ] Mock payments disabled (`NEXT_PUBLIC_MOCK_PAYMENTS=false`)
- [ ] Razorpay API keys configured (when ready to monetize)
- [ ] Email provider (Resend) configured for custom transactional emails
- [ ] Google Search Console set up for SEO

---

## Environment Variables Reference

| Variable | Required | Dev | Staging | Production | Description |
|----------|----------|-----|---------|------------|-------------|
| `NEXT_PUBLIC_APP_ENV` | Yes | `development` | `staging` | `production` | Current environment |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Dev project URL | Staging project URL | Prod project URL | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Dev anon key | Staging anon key | Prod anon key | Supabase public key |
| `NEXT_PUBLIC_APP_NAME` | No | KutumbKosh | KutumbKosh | KutumbKosh | App display name |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | `https://staging.kutumbkosh.com` | `https://kutumbkosh.com` | App base URL |
| `NEXT_PUBLIC_MOCK_PAYMENTS` | No | `true` | `true` | `false` | Use mock payment flow |
| `RAZORPAY_KEY_ID` | Prod only | - | - | Your key | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Prod only | - | - | Your secret | Razorpay secret |
| `RESEND_API_KEY` | No | - | - | Your key | For custom emails |

---

## Git Workflow

### Branch strategy

```
main (production)
  |
  └── staging (pre-production testing)
        |
        ├── feature/add-family-vaults
        ├── feature/razorpay-integration
        └── fix/nominee-validation-bug
```

### Daily workflow

```bash
# 1. Create a feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/your-feature

# 2. Develop and commit
git add -A
git commit -m "Add your feature"

# 3. Push and create PR to staging
git push -u origin feature/your-feature
# Create PR: feature/your-feature → staging

# 4. After review, merge to staging
# Test on staging.kutumbkosh.com

# 5. When ready, merge staging to main
git checkout main
git merge staging
git push origin main
# Production auto-deploys
```

### Hotfix workflow (urgent production fix)

```bash
# 1. Branch from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix and push
git commit -m "Fix critical bug"
git push -u origin hotfix/critical-bug

# 3. Merge to main AND staging
# PR: hotfix/critical-bug → main (deploy to prod)
# PR: hotfix/critical-bug → staging (keep in sync)
```

---

## Troubleshooting

### "Missing required environment variable" error

You're missing a value in `.env.local`. Check `.env.example` for all required variables. For Vercel deployments, check Settings > Environment Variables.

### Magic link emails not arriving

1. Check Supabase Dashboard > Authentication > Email Templates
2. Verify the Site URL matches your deployment URL
3. Check spam folder
4. Supabase free tier has email rate limits (4 emails/hour for development)

### RLS policy errors (row-level security)

If you see "new row violates row-level security policy", the authenticated user's ID doesn't match the `user_id` in the data. Check that you're passing the auth session correctly through Supabase client.

### Build fails on Vercel

1. Run `npm run build` locally first to catch errors
2. Run `npm run typecheck` to find TypeScript issues
3. Check that all env vars are set in Vercel for the correct scope (Production vs Preview)

### Staging shows "DEV" badge instead of "STAGING"

Make sure `NEXT_PUBLIC_APP_ENV=staging` is set in Vercel's Preview environment variables, not just in your local `.env.local`.

---

## Project Structure

```
kutumbkosh/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Login / landing page
│   │   ├── auth/callback/     # Magic link auth handler
│   │   ├── dashboard/         # Main app (protected)
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── assets/        # Asset management
│   │   │   ├── nominees/      # Nominee management
│   │   │   ├── emergency/     # Emergency access
│   │   │   ├── reminders/     # Smart reminders
│   │   │   ├── export/        # PDF export
│   │   │   ├── settings/      # Profile & settings
│   │   │   ├── pricing/       # Plan comparison
│   │   │   ├── checkout/      # Payment flow
│   │   │   └── subscription/  # Subscription management
│   │   ├── onboarding/        # New user setup flow
│   │   ├── security/          # Trust & Security page
│   │   ├── privacy/           # Privacy Policy
│   │   └── terms/             # Terms of Service
│   ├── components/            # Shared UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities
│   │   ├── supabase/          # Supabase client & middleware
│   │   ├── validations.ts     # Form validation helpers
│   │   ├── security.ts        # Security utilities
│   │   └── env.ts             # Environment config
│   └── types/                 # TypeScript definitions
├── supabase/
│   ├── schema.sql             # Full database schema
│   └── seed.sql               # Dev/staging test data
├── .env.example               # Environment variable template
├── vercel.json                # Vercel deployment config
└── README.md                  # This file
```

---

Built with care for Indian families.
