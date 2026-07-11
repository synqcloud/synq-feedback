"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Fields that change on every vote (on_vote_change bumps vote_count,
// suggestions_set_updated_at bumps updated_at alongside it) but that we
// deliberately don't want to trigger a live reorder for -- see toggleVote in
// lib/actions/suggestions.ts for the same reasoning. Anything else changing
// (status, title, type, etc.) still refreshes live.
const IGNORED_ON_UPDATE = new Set(["vote_count", "updated_at"]);

function isVoteOnlyChange(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
  if (payload.eventType !== "UPDATE") return false;
  const oldRow = payload.old as Record<string, unknown>;
  const newRow = payload.new as Record<string, unknown>;
  if (!oldRow || Object.keys(oldRow).length === 0) return false; // no replica identity data to compare
  return Object.keys(newRow).every(
    (key) => IGNORED_ON_UPDATE.has(key) || oldRow[key] === newRow[key],
  );
}

// Renders nothing. Keeps the board/kanban/roadmap lists in sync when anyone
// creates a suggestion or changes its status, without requiring a manual
// reload -- but skips refreshing for vote-only updates, since those pages
// sort by vote_count and refreshing would reorder the list live out from
// under whoever's looking at it (see toggleVote for the same call).
export function LiveBoardRefresh() {
  const router = useRouter();

  React.useEffect(() => {
    const supabase = createClient();
    let timeout: ReturnType<typeof setTimeout> | null = null;

    function scheduleRefresh() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => router.refresh(), 300);
    }

    const channel = supabase
      .channel("suggestions:live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suggestions" },
        (payload) => {
          if (isVoteOnlyChange(payload)) return;
          scheduleRefresh();
        },
      )
      .subscribe();

    return () => {
      if (timeout) clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
