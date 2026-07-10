"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Renders nothing. Keeps the board/kanban/roadmap lists in sync when
// anyone creates a suggestion, changes its status, or votes, without
// requiring a manual reload.
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
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (timeout) clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
