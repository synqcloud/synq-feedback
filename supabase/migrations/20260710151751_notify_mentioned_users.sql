-- In-app notifications for @mentions: whenever a suggestion or comment body
-- contains a user mention node, notify each mentioned user (skip self).
-- Bodies are Tiptap jsonb docs, e.g. a mention node looks like
-- {"type":"mention","attrs":{"kind":"user","id":"...","label":"..."}}
-- nested arbitrarily deep, so jsonpath's recursive `$.**` wildcard walks the
-- whole tree to find every such node.
create or replace function public.insert_mention_notifications(
  p_body jsonb,
  p_actor_id uuid,
  p_suggestion_id uuid,
  p_comment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mentioned_id uuid;
begin
  for mentioned_id in
    select distinct (elem #>> '{}')::uuid
    from jsonb_path_query(
      p_body,
      '$.**?(@.type == "mention" && @.attrs.kind == "user").attrs.id'
    ) as elem
  loop
    if mentioned_id is not null and mentioned_id <> p_actor_id then
      insert into public.notifications (recipient_id, actor_id, type, suggestion_id, comment_id)
      values (mentioned_id, p_actor_id, 'mention', p_suggestion_id, p_comment_id);
    end if;
  end loop;
end;
$$;

create or replace function public.notify_mentioned_users_suggestion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.insert_mention_notifications(new.body, new.author_id, new.id, null);
  return new;
end;
$$;

create trigger on_suggestion_notify_mentions
after insert on public.suggestions
for each row execute function public.notify_mentioned_users_suggestion();

create or replace function public.notify_mentioned_users_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.insert_mention_notifications(new.body, new.author_id, new.suggestion_id, new.id);
  return new;
end;
$$;

create trigger on_comment_notify_mentions
after insert on public.comments
for each row execute function public.notify_mentioned_users_comment();
