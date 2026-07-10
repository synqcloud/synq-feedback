"use client";

import * as React from "react";
import { DialogRoot, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ActivityList, type ActivityTab } from "@/components/profile/activity-list";
import { getMyActivity, type ActivityData } from "@/lib/actions/activity";
import { cn } from "@/lib/cn";

export function ActivityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = React.useState<ActivityTab>("posts");
  const [data, setData] = React.useState<ActivityData | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getMyActivity().then((result) => {
      if (!cancelled) setData(result.data ?? { profile: null, posts: [], comments: [], votes: [] });
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const loading = open && data === null;

  const tabs: { key: ActivityTab; label: string; count: number }[] = [
    { key: "posts", label: "Posts", count: data?.posts.length ?? 0 },
    { key: "comments", label: "Comments", count: data?.comments.length ?? 0 },
    { key: "votes", label: "Votes", count: data?.votes.length ?? 0 },
  ];

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setTab("posts");
      }}
    >
      <DialogContent width="md">
        <DialogTitle>My activity</DialogTitle>

        <div className="mt-4 flex items-center gap-1 border-b border-border">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm font-medium transition-colors",
                tab === item.key
                  ? "border-accent text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {item.label}
              <span className="text-xs text-fg-subtle">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="py-10 text-center text-sm text-fg-muted">Loading...</p>
          ) : (
            <ActivityList tab={tab} data={data} onNavigate={() => onOpenChange(false)} />
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
