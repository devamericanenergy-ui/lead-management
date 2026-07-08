# AE Leads — Lead Management PWA (MVP)

Lead management for American Energy salespeople. Each salesperson sees only
their own leads (enforced by Supabase Row Level Security); admins see all
leads. Push notifications for follow-up reminders are **not wired up yet**
— that's the next step, once this core CRUD flow is confirmed working.

## What's in this MVP 

- Email/password login (accounts created manually for now — see below)
- Lead list scoped to the logged-in salesperson via RLS, sorted so overdue
  and soonest follow-ups float to the top, leads with no follow-up date
  sink to the bottom
- Filter chips: All / Follow-up due / Scheduled / Won / Lost
- Add, edit, delete leads
- Status + follow-up urgency badges (overdue / today / upcoming / won / lost)
- Installable as a PWA (manifest + basic offline app-shell caching)

## Setup

1. **Create a Supabase project** at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`. This creates the
   `profiles` and `leads` tables, RLS policies, and a trigger that
   auto-creates a profile row whenever a new auth user signs up.
3. Copy `.env.example` to `.env` and fill in your project's URL and anon
   key (Project Settings → API in the Supabase dashboard):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Install dependencies and run:
   ```
   npm install
   npm run dev
   ```

## Creating salesperson accounts

There's no public signup screen in this MVP by design. Create accounts
from the Supabase dashboard: **Authentication → Users → Add user**. The
`handle_new_user()` trigger automatically creates a matching `profiles`
row with `role = 'salesperson'`. To make someone an admin, update their
`profiles.role` to `'admin'` directly in the table editor — admins can
then see and manage every salesperson's leads.

## Deploying

`npm run build` produces a static `dist/` folder — deploy it to Vercel,
Netlify, or any static host. Point the environment variables at the same
Supabase project.

## Next steps (not in this MVP)

- Web Push subscriptions + an Edge Function/cron job to fire a
  notification when `follow_up_at` is reached (schema already has the
  `notified` flag ready for this — see the commented-out
  `push_subscriptions` table at the bottom of `schema.sql`)
- App icons in `public/icons/` (currently referenced but not included —
  drop in `icon-192.png` and `icon-512.png` before deploying)
- Admin view for reassigning leads between salespeople
