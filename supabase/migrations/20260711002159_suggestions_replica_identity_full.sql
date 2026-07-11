-- LiveBoardRefresh listens for postgres_changes on suggestions and calls
-- router.refresh() on any UPDATE, including the ones on_vote_change makes
-- purely to bump vote_count -- which reorders the (vote-sorted) board/
-- roadmap lists live for every connected client on every vote, not just the
-- voter's own. Default REPLICA IDENTITY only includes the primary key in
-- realtime's `old` payload for UPDATE/DELETE, so the client can't tell "only
-- vote_count changed" from "status/title/type changed" without this --
-- needed so the client-side handler can skip refreshing on vote-only
-- updates while still refreshing for everything else.
alter table public.suggestions replica identity full;
