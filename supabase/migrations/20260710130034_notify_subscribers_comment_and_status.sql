-- In-app notifications for regular users: fan out to a suggestion's
-- subscribers (not just admins) when it gets a new comment, and to
-- subscribers when its status changes.

create or replace function public.notify_subscribers_new_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, suggestion_id, comment_id)
  select s.user_id, new.author_id, 'new_comment', new.suggestion_id, new.id
  from public.subscriptions s
  where s.suggestion_id = new.suggestion_id
    and s.user_id <> new.author_id;
  return new;
end;
$$;

create trigger on_comment_notify_subscribers
after insert on public.comments
for each row execute function public.notify_subscribers_new_comment();

create or replace function public.notify_subscribers_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_user_id uuid := coalesce((select auth.uid()), new.author_id);
begin
  if new.status is distinct from old.status then
    insert into public.notifications (recipient_id, actor_id, type, suggestion_id)
    select s.user_id, acting_user_id, 'status_change', new.id
    from public.subscriptions s
    where s.suggestion_id = new.id
      and s.user_id <> acting_user_id;
  end if;
  return new;
end;
$$;

create trigger on_suggestion_notify_subscribers_status
after update on public.suggestions
for each row execute function public.notify_subscribers_status_change();
