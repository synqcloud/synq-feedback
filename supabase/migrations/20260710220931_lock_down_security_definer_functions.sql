-- The insert_mention_notifications fix (20260710211617) only revoked EXECUTE
-- from anon/authenticated directly. On a real hosted project, PUBLIC *also*
-- retains its own separate EXECUTE grant (standard Postgres default: every
-- new function grants EXECUTE to PUBLIC unless ALTER DEFAULT PRIVILEGES says
-- otherwise), and anon/authenticated inherit from PUBLIC regardless of their
-- own direct grants being revoked -- so the previous fix was incomplete on
-- this environment (local apparently never had a PUBLIC-level grant to begin
-- with, which is why revoking only anon/authenticated fully worked there).
-- Revoking from PUBLIC as well closes that inherited path.
--
-- Applying the same lock-down to every other SECURITY DEFINER function here,
-- all of which are `returns trigger` and are only ever meant to be invoked
-- by Postgres's own trigger-firing mechanism (which does not require the
-- firing session to hold EXECUTE) -- confirmed via Supabase's own advisor
-- flagging all of them as directly callable by anon/authenticated.
revoke execute on function public.insert_mention_notifications(jsonb, uuid, uuid, uuid) from public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_vote_change() from public, anon, authenticated;
revoke execute on function public.notify_admins_new_comment() from public, anon, authenticated;
revoke execute on function public.notify_admins_new_suggestion() from public, anon, authenticated;
revoke execute on function public.notify_mentioned_users_comment() from public, anon, authenticated;
revoke execute on function public.notify_mentioned_users_suggestion() from public, anon, authenticated;
revoke execute on function public.notify_subscribers_new_comment() from public, anon, authenticated;
revoke execute on function public.notify_subscribers_status_change() from public, anon, authenticated;
