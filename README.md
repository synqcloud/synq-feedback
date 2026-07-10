# synq-feedback

A self-hosted feedback portal: post suggestions with a rich-text editor
(images included), vote, comment in real time, and manage status from a
Linear-style roadmap.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19**
- **Tailwind CSS v4** — design tokens in `src/app/globals.css` (`@theme`), no hardcoded colors in components
- **[Base UI](https://base-ui.com)** (`@base-ui/react`) for accessible primitives (Dialog, Select, Menu, Toast, Avatar)
- **Tiptap** for the suggestion editor (bold/italic/lists/links/images)
- **Supabase** (local) — Postgres, Auth (email magic link), Realtime, Storage

## Run

```bash
npm install
supabase start      # local Postgres/Auth/Storage/Realtime on the 5632x port range
npm run dev          # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in the values `supabase start` prints
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

Sign-in emails are caught locally by Mailpit — open the URL printed as
`Mailpit` by `supabase start` (defaults to http://127.0.0.1:56324) to grab
the magic link.

### Admin access

The first user to sign in with the email set in `supabase/seed.sql`
(`site_settings.admin_email`, defaults to `iamtelmoo@gmail.com`) is
auto-promoted to admin — able to change suggestion status and edit site
settings at `/settings`. Change that email in `supabase/seed.sql` and run
`supabase db reset` before the first sign-in if you want a different admin.

Other scripts: `supabase stop`, `supabase db reset` (reapplies migrations + seed).

## Structure

```
src/
  app/
    page.tsx                board (list, vote, filter/sort)
    suggestions/[id]/        suggestion detail + realtime comments
    roadmap/                 planned / in progress / completed columns
    settings/                admin-only site settings
    auth/confirm/route.ts    magic-link verification
    proxy.ts                 refreshes the Supabase session cookie
  components/
    ui/                      Base UI wrappers styled with design tokens
    auth/                    sign-in dialog, user menu
    editor/                  Tiptap rich-text editor + toolbar
    suggestions/              board card, vote button, status select, comments
    roadmap/, settings/       page-specific components
  lib/
    supabase/                browser + server clients, generated database types
    data/                    read queries (server-only)
    actions/                 server actions (mutations)
    auth.ts, types.ts, cn.ts
supabase/
  migrations/                schema, RLS policies, storage bucket
  seed.sql                   default site settings + admin email
  templates/magic-link.html  email template linking to /auth/confirm
```

## Data model

- **suggestions** — title, rich-text `body` (Tiptap JSON), `status` (`unassigned` /
  `planned` / `in_progress` / `completed` / `archived`), denormalized `vote_count`
- **votes** — one row per (suggestion, user); toggled via a server action
- **comments** — flat list per suggestion, streamed live via Supabase Realtime
- **profiles** — auto-created on signup; `is_admin` set from `site_settings.admin_email`
- **site_settings** — singleton row for name/description/logo

All tables have RLS: public read, authenticated write with ownership checks,
admin-only status/settings updates. See `supabase/migrations/` for the full
policy set.
