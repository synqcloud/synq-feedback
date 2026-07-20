-- notifySubscribers (the email fan-out) runs with the acting user's RLS
-- context. The subscriptions SELECT policy only exposes a user's OWN rows
-- (`auth.uid() = user_id`), so the app could never read the other
-- subscribers -- every status-change and new-comment email silently
-- collapsed to just the admin `[Copy]`, which is why only the admin ever
-- received one.
--
-- This SECURITY DEFINER function returns subscriber emails for a suggestion,
-- bypassing that per-row restriction. Emails are already publicly readable
-- through the "profiles are publicly readable" SELECT policy, so this exposes
-- no new PII; it only reveals subscription membership to authenticated
-- callers, acceptable for a public feedback board. Locked down to
-- authenticated (revoke from public/anon per the SECURITY DEFINER lock-down
-- convention): both a status change (admin) and a new comment (any member)
-- fan out through it.
create or replace function public.subscriber_emails(
  p_suggestion_id uuid,
  p_exclude_user_id uuid
)
returns table (email text)
language sql
security definer
set search_path = public
as $$
  select p.email
  from public.subscriptions s
  join public.profiles p on p.id = s.user_id
  where s.suggestion_id = p_suggestion_id
    and s.user_id <> p_exclude_user_id
    and p.email is not null;
$$;

revoke execute on function public.subscriber_emails(uuid, uuid) from public, anon;
grant execute on function public.subscriber_emails(uuid, uuid) to authenticated;
