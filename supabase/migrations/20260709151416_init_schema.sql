-- Feedback portal schema: profiles, settings, suggestions, votes, comments.

create extension if not exists "pgcrypto";

create type public.suggestion_status as enum (
  'unassigned',
  'planned',
  'in_progress',
  'completed',
  'archived'
);

-- One row per authenticated user, created automatically on signup.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Singleton row (id always 1) holding site-wide settings.
create table public.site_settings (
  id smallint primary key default 1,
  name text not null default 'Feedback',
  description text not null default '',
  logo_url text,
  admin_email text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body jsonb not null,
  status public.suggestion_status not null default 'unassigned',
  author_id uuid not null references public.profiles (id) on delete cascade,
  vote_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index suggestions_status_idx on public.suggestions (status);
create index suggestions_vote_count_idx on public.suggestions (vote_count desc);
create index suggestions_created_at_idx on public.suggestions (created_at desc);

create table public.votes (
  suggestion_id uuid not null references public.suggestions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_suggestion_id_idx on public.comments (suggestion_id, created_at);

-- Keep suggestions.updated_at current on any change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger suggestions_set_updated_at
before update on public.suggestions
for each row execute function public.set_updated_at();

-- Create a profile row whenever a new auth user signs up, promoting the
-- configured admin_email (see site_settings) to admin automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    exists (
      select 1 from public.site_settings
      where admin_email is not null and admin_email = new.email
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Denormalized vote_count keeps board sorting cheap without a join+count
-- on every list query. Security definer because voters don't otherwise
-- have UPDATE rights on suggestions (only admins do, for status changes).
create or replace function public.handle_vote_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.suggestions set vote_count = vote_count + 1 where id = new.suggestion_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.suggestions set vote_count = vote_count - 1 where id = old.suggestion_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger on_vote_change
after insert or delete on public.votes
for each row execute function public.handle_vote_change();

-- Row Level Security --------------------------------------------------

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.suggestions enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

create policy "profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "site settings are publicly readable"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "admins can update site settings"
on public.site_settings for update
to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin))
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));

create policy "suggestions are publicly readable"
on public.suggestions for select
to anon, authenticated
using (true);

create policy "authenticated users can create suggestions"
on public.suggestions for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "admins can update any suggestion"
on public.suggestions for update
to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin))
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));

create policy "votes are publicly readable"
on public.votes for select
to anon, authenticated
using (true);

create policy "authenticated users can vote"
on public.votes for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can remove their own vote"
on public.votes for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "comments are publicly readable"
on public.comments for select
to anon, authenticated
using (true);

create policy "authenticated users can comment"
on public.comments for insert
to authenticated
with check ((select auth.uid()) = author_id);

-- Storage: suggestion attachment images -------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('suggestion-images', 'suggestion-images', true, 8388608, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

create policy "suggestion images are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'suggestion-images');

create policy "authenticated users can upload suggestion images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'suggestion-images');

-- Realtime: comments stream live on the suggestion detail page.
alter publication supabase_realtime add table public.comments;
