-- Users can edit their own display name and avatar. A trigger keeps
-- id/email/is_admin immutable through this path so a user can't grant
-- themselves admin by editing their own row.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.id = old.id;
  new.email = old.email;
  new.is_admin = old.is_admin;
  return new;
end;
$$;

create trigger protect_profile_privileges_trigger
before update on public.profiles
for each row execute function public.protect_profile_privileges();

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Storage: user avatar images -----------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 4194304, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

create policy "authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');
