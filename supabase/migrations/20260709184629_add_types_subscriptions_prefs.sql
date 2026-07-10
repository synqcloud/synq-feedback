-- Suggestion types (admin-managed taxonomy, independent of workflow status)
-----------------------------------------------------------------------------

create table public.suggestion_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#5e6ad2',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.suggestions
  add column type_id uuid references public.suggestion_types (id) on delete set null;

alter table public.suggestion_types enable row level security;

create policy "suggestion types are publicly readable"
on public.suggestion_types for select
to anon, authenticated
using (true);

-- Split by action (rather than `for all`) so this doesn't duplicate the
-- public SELECT policy above for the `authenticated` role.
create policy "admins can create suggestion types"
on public.suggestion_types for insert
to authenticated
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));

create policy "admins can edit suggestion types"
on public.suggestion_types for update
to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin))
with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));

create policy "admins can delete suggestion types"
on public.suggestion_types for delete
to authenticated
using (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin));

-- Per-user notification preferences (columns on profiles, 1:1)
-----------------------------------------------------------------------------

alter table public.profiles
  add column email_on_mention boolean not null default true,
  add column auto_subscribe_own_posts boolean not null default true,
  add column auto_subscribe_commented boolean not null default true,
  add column auto_subscribe_voted boolean not null default false;

-- Subscriptions: who gets notified about updates to a suggestion
-----------------------------------------------------------------------------

create table public.subscriptions (
  suggestion_id uuid not null references public.suggestions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

alter table public.subscriptions enable row level security;

create policy "users can read their own subscriptions"
on public.subscriptions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can subscribe themselves"
on public.subscriptions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can unsubscribe themselves"
on public.subscriptions for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Auto-subscribe according to the actor's own preferences. Runs as the
-- invoking user (not security definer): the insert only ever targets the
-- actor's own row, which the policies above already allow them to write.
create or replace function public.auto_subscribe_on_suggestion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select auto_subscribe_own_posts from public.profiles where id = new.author_id) then
    insert into public.subscriptions (suggestion_id, user_id)
    values (new.id, new.author_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_suggestion_auto_subscribe
after insert on public.suggestions
for each row execute function public.auto_subscribe_on_suggestion();

create or replace function public.auto_subscribe_on_comment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select auto_subscribe_commented from public.profiles where id = new.author_id) then
    insert into public.subscriptions (suggestion_id, user_id)
    values (new.suggestion_id, new.author_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_comment_auto_subscribe
after insert on public.comments
for each row execute function public.auto_subscribe_on_comment();

create or replace function public.auto_subscribe_on_vote()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select auto_subscribe_voted from public.profiles where id = new.user_id) then
    insert into public.subscriptions (suggestion_id, user_id)
    values (new.suggestion_id, new.user_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_vote_auto_subscribe
after insert on public.votes
for each row execute function public.auto_subscribe_on_vote();
