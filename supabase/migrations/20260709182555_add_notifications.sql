-- Admin-facing notifications: new suggestions and new comments.

create type public.notification_type as enum ('new_suggestion', 'new_comment');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  suggestion_id uuid not null references public.suggestions (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

create policy "recipients can read their own notifications"
on public.notifications for select
to authenticated
using ((select auth.uid()) = recipient_id);

create policy "recipients can mark their own notifications read"
on public.notifications for update
to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);

-- Fan out to every admin (except the actor) whenever a suggestion or
-- comment is created. Security definer because authors otherwise have no
-- INSERT rights on notifications (recipients only get UPDATE, for marking
-- read); this function only ever inserts rows scoped to real admin ids and
-- the actor's own id, both taken from the server, not client input.
create or replace function public.notify_admins_new_suggestion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, suggestion_id)
  select id, new.author_id, 'new_suggestion', new.id
  from public.profiles
  where is_admin and id <> new.author_id;
  return new;
end;
$$;

create trigger on_suggestion_notify_admins
after insert on public.suggestions
for each row execute function public.notify_admins_new_suggestion();

create or replace function public.notify_admins_new_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, suggestion_id, comment_id)
  select id, new.author_id, 'new_comment', new.suggestion_id, new.id
  from public.profiles
  where is_admin and id <> new.author_id;
  return new;
end;
$$;

create trigger on_comment_notify_admins
after insert on public.comments
for each row execute function public.notify_admins_new_comment();

alter publication supabase_realtime add table public.notifications;
