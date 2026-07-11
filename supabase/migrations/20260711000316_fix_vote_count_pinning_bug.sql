-- Bug: protect_suggestion_fields() pins vote_count back to its old value for
-- any non-admin session. on_vote_change (the trigger that actually
-- increments/decrements vote_count on vote insert/delete) does this via a
-- plain `update public.suggestions set vote_count = ...`, which itself fires
-- protect_suggestion_fields_trigger (BEFORE UPDATE on suggestions) one level
-- deeper -- and since the voter is a normal non-admin user, that nested
-- firing immediately reverts the increment before it's ever visible. Votes
-- themselves record fine (no pinning on the votes table); only the
-- denormalized suggestions.vote_count silently never moves. Confirmed live:
-- every migrated Fider vote and every non-admin test vote left vote_count
-- at 0 while the votes table had the real rows -- only admin-cast votes
-- (which bypass the pin entirely) ever incremented it.
--
-- Fix: also let the update through when it's a nested call from
-- on_vote_change specifically (pg_trigger_depth() > 1 -- on_vote_change is
-- the only trigger anywhere that updates public.suggestions from another
-- table's trigger, so this check is unambiguous, not a general bypass).
create or replace function public.protect_suggestion_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if pg_trigger_depth() <= 1
     and not exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin) then
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

-- One-time reconciliation: recompute every suggestion's vote_count from the
-- actual votes rows, since existing counts were silently left at 0 (or
-- whatever they were pre-bug) by the pinning above. This migration itself
-- runs as a top-level statement with no admin JWT context, so the very
-- trigger being fixed would otherwise pin these updates too -- disable it
-- for this one-time correction.
alter table public.suggestions disable trigger protect_suggestion_fields_trigger;

update public.suggestions s
set vote_count = coalesce(v.real_count, 0)
from (
  select suggestion_id, count(*) as real_count
  from public.votes
  group by suggestion_id
) v
where v.suggestion_id = s.id;

update public.suggestions s
set vote_count = 0
where vote_count <> 0
  and not exists (select 1 from public.votes v where v.suggestion_id = s.id);

alter table public.suggestions enable trigger protect_suggestion_fields_trigger;
