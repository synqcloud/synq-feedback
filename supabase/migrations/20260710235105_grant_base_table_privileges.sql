-- No prior migration ever ran an explicit GRANT -- the schema relied
-- entirely on default privileges, which the local CLI's bootstrap happens
-- to set up permissively (anon/authenticated get full data-privilege grants
-- by default) but a real hosted project does not. Confirmed via
-- information_schema.role_table_grants against production: every table in
-- this file only had TRUNCATE/TRIGGER/REFERENCES for anon/authenticated,
-- none of SELECT/INSERT/UPDATE/DELETE. RLS policies only restrict which
-- ROWS a role can see/touch once that role already holds the underlying SQL
-- privilege -- without it, every query 42501s ("permission denied") no
-- matter how permissive the policy is. This is what caused the freshly
-- deployed site to render as empty instead of showing migrated Fider data.
--
-- Granting exactly what each table's existing RLS policies already assume
-- per role, nothing broader -- RLS still does the real per-row enforcement.

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

grant select on public.suggestions to anon, authenticated;
grant insert, update on public.suggestions to authenticated;

grant select on public.suggestion_types to anon, authenticated;
grant insert, update, delete on public.suggestion_types to authenticated;

grant select on public.votes to anon, authenticated;
grant insert, delete on public.votes to authenticated;

grant select on public.comments to anon, authenticated;
grant insert, update on public.comments to authenticated;

grant select, update on public.notifications to authenticated;

grant select, insert, delete on public.subscriptions to authenticated;
