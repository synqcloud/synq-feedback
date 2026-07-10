-- Board/kanban/roadmap listen for suggestion changes (new posts, status
-- moves, vote count) to refresh live without a manual page reload.
alter publication supabase_realtime add table public.suggestions;
