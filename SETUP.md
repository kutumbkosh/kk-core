# Financial Vault - Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
cd vault
npm install
```

## Step 2: Set Up Supabase

### 2a. Create the Database Schema

1. Open your Supabase dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql` and paste it
5. Click **Run** (or Ctrl+Enter)
6. You should see "Success. No rows returned" - that means it worked!

### 2b. Configure Auth

1. Go to **Authentication** > **Providers** > **Email**
2. Make sure **Enable Email provider** is ON
3. Under **Email Auth**, make sure **Confirm email** is ON (enables magic links)

### 2b-2. Configure Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Under **Redirect URLs**, click **Add URL**
3. Add: `http://localhost:3000/auth/callback`
4. For production later, add your actual domain too

### 2c. Update Environment Variables

1. Go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Open `.env.local` in the project root
4. Replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Test the Flow

1. Enter your email on the landing page
2. Check your email for the magic link (check spam if needed!)
3. Click the link - you'll be redirected to the onboarding flow
4. Fill in your profile and add an emergency contact
5. You'll land on the dashboard

## Project Structure

```
vault/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page + login
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Tailwind + custom styles
│   │   ├── auth/callback/      # Magic link callback handler
│   │   ├── onboarding/         # Profile setup flow
│   │   │   ├── page.tsx        # Step 1: Profile
│   │   │   └── emergency-contact/
│   │   │       └── page.tsx    # Step 2: Emergency contacts
│   │   └── dashboard/
│   │       └── page.tsx        # Main dashboard
│   ├── lib/
│   │   └── supabase/           # Supabase client setup
│   │       ├── client.ts       # Browser client
│   │       ├── server.ts       # Server client
│   │       └── middleware.ts   # Auth middleware
│   ├── types/
│   │   └── database.ts         # TypeScript types
│   └── middleware.ts            # Next.js middleware (auth guard)
├── supabase/
│   └── schema.sql              # Database schema (run in SQL Editor)
├── public/
│   └── manifest.json           # PWA manifest
└── .env.local                  # Environment variables (edit this!)
```

## What's Built (Module 1)

- [x] Landing page with email magic link auth
- [x] Auth callback handling
- [x] Middleware for route protection
- [x] Onboarding Step 1: Profile setup (name, phone, DOB, PAN)
- [x] Onboarding Step 2: Emergency contact setup (skip-able)
- [x] Dashboard with stats, asset list, nominee summary, quick actions
- [x] Complete database schema with RLS policies
- [x] TypeScript types for all entities

## Next: Module 2 (Asset Vault)

The dashboard is ready but needs the "Add Asset" page. That's the next module to build.
