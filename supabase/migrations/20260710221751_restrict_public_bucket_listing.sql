-- The avatars/suggestion-images SELECT policies used a bare
-- `using (bucket_id = '...')` with no operation restriction. A single SQL
-- SELECT privilege covers multiple distinct Storage API operations -- both
-- fetching a known file by name (storage.object.get_public) AND enumerating
-- every file in the bucket (storage.object.list / list_v2). The bare policy
-- allowed both, so any anonymous client could list every avatar/suggestion
-- image filename in the bucket, not just fetch ones it already knows the
-- name of. Flagged by Supabase's own advisor (public_bucket_allows_listing).
--
-- Restricting to get_public/info_public via storage.allow_any_operation()
-- keeps direct downloads (what <img src="..."> actually uses) working
-- unchanged while blocking bucket enumeration.
drop policy if exists "avatars are publicly readable" on storage.objects;

create policy "avatars are publicly readable"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'avatars'
  and storage.allow_any_operation(array['storage.object.get_public', 'storage.object.info_public'])
);

drop policy if exists "suggestion images are publicly readable" on storage.objects;

create policy "suggestion images are publicly readable"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'suggestion-images'
  and storage.allow_any_operation(array['storage.object.get_public', 'storage.object.info_public'])
);
