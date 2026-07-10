-- Let authors edit their own suggestion (title/body) and their own comment
-- body, and track when content was actually edited (distinct from
-- `updated_at`, which already gets bumped by admin-only status changes --
-- reusing it would show "(edited)" on every status change, not just real
-- content edits).

alter table public.suggestions add column edited_at timestamptz;
alter table public.comments add column edited_at timestamptz;

-- Combined with the admin-status-update case into one policy (rather than
-- two separate permissive policies) since Postgres evaluates every
-- applicable permissive policy per query -- two nearly-identical policies
-- doubles that cost for no benefit.
drop policy "admins can update any suggestion" on public.suggestions;

create policy "authors and admins can update suggestions"
on public.suggestions for update
to authenticated
using (
  (select auth.uid()) = author_id
  or exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin)
)
with check (
  (select auth.uid()) = author_id
  or exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin)
);

create policy "authors can edit own comment"
on public.comments for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

-- Authors can only ever change title/body through this policy (RLS is
-- row-level, not column-level) -- pin every other column back to its old
-- value unless the actor is an admin, and stamp edited_at when the body
-- actually changes so admin status updates don't also flip it.
create or replace function public.protect_suggestion_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin) then
    new.status = old.status;
    new.vote_count = old.vote_count;
    new.author_id = old.author_id;
    new.type_id = old.type_id;
    new.created_at = old.created_at;
  end if;
  if new.body is distinct from old.body or new.title is distinct from old.title then
    new.edited_at = now();
  end if;
  return new;
end;
$$;

create trigger protect_suggestion_fields_trigger
before update on public.suggestions
for each row execute function public.protect_suggestion_fields();

create or replace function public.protect_comment_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.suggestion_id = old.suggestion_id;
  new.author_id = old.author_id;
  new.created_at = old.created_at;
  if new.body is distinct from old.body then
    new.edited_at = now();
  end if;
  return new;
end;
$$;

create trigger protect_comment_fields_trigger
before update on public.comments
for each row execute function public.protect_comment_fields();
