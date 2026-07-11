"use client";

import * as React from "react";
import { Star, X } from "lucide-react";
import { DialogRoot, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { ActivityList, type ActivityTab } from "@/components/profile/activity-list";
import { getUserActivity, type ActivityData } from "@/lib/actions/activity";
import { cn } from "@/lib/cn";

// Single shared instance mounted once by UserProfileProvider (see
// user-profile-provider.tsx) -- always controlled, never mounted per
// avatar/mention, so there's only ever one dialog (and one backdrop) no
// matter how many clickable avatars are on the page.
export function UserProfileModal({
  userId,
  triggerProfile,
  open,
  onOpenChange,
}: {
  userId: string;
  /** Shown immediately (before the fetch resolves) if the caller already has it. */
  triggerProfile?: { display_name: string; avatar_url?: string | null; is_admin?: boolean } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isOpen = open;
  const [tab, setTab] = React.useState<ActivityTab>("posts");
  const [data, setData] = React.useState<ActivityData | null>(null);
  const [loadedFor, setLoadedFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    // Clear the previous user's data immediately so the fallback below
    // (data?.profile ?? triggerProfile) uses the new triggerProfile while
    // loading, instead of briefly showing the last-viewed user's name and
    // avatar until this fetch resolves.
    setData(null);
    let cancelled = false;
    getUserActivity(userId).then((result) => {
      if (!cancelled) {
        setData(result.data ?? { profile: null, posts: [], comments: [], votes: [] });
        setLoadedFor(userId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, userId]);

  const loading = isOpen && (data === null || loadedFor !== userId);
  const displayName = data?.profile?.display_name ?? triggerProfile?.display_name ?? "Someone";
  const avatarUrl = data?.profile?.avatar_url ?? triggerProfile?.avatar_url ?? null;
  const isAdmin = data?.profile?.is_admin ?? triggerProfile?.is_admin ?? false;

  const tabs: { key: ActivityTab; label: string; count: number }[] = [
    { key: "posts", label: "Posts", count: data?.posts.length ?? 0 },
    { key: "comments", label: "Comments", count: data?.comments.length ?? 0 },
    { key: "votes", label: "Votes", count: data?.votes.length ?? 0 },
  ];

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setTab("posts");
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent width="md" showClose={false} className="overflow-hidden p-0">
        <div
          className="relative h-20"
          style={{ background: "linear-gradient(135deg, var(--color-banner-from), var(--color-banner-to))" }}
        >
          <DialogClose
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X size={16} />
          </DialogClose>
        </div>
        <div className="px-5 pt-0 pb-5">
          <Avatar
            name={displayName}
            src={avatarUrl}
            size={64}
            className="-mt-8 border-4 border-surface"
          />
          <div className="mt-3 flex items-center gap-2">
            <h2 className="text-base font-semibold text-fg">{displayName}</h2>
            {isAdmin && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-[1px] text-[10px] font-medium text-white">
                <Star size={9} className="fill-white text-white" />
                Admin
              </span>
            )}
          </div>

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

          <div className="scrollbar-hide mt-4 max-h-80 overflow-y-auto">
            {loading ? (
              <p className="py-10 text-center text-sm text-fg-muted">Loading...</p>
            ) : (
              <ActivityList tab={tab} data={data} onNavigate={() => handleOpenChange(false)} />
            )}
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
