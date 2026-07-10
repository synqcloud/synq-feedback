"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import { STATUS_LABEL, type Notification } from "@/lib/types";

function notificationHref(notification: Notification) {
  return notification.suggestion ? `/suggestions/${notification.suggestion.id}` : "/";
}

function NotificationText({ notification }: { notification: Notification }) {
  const actorName = notification.actor?.display_name ?? "Someone";
  const title = notification.suggestion?.title ?? "a suggestion";

  if (notification.type === "new_comment") {
    return (
      <>
        <span className="font-medium text-fg">{actorName}</span> left a comment on{" "}
        <span className="font-medium text-fg">{title}</span>
      </>
    );
  }

  if (notification.type === "status_change") {
    const status = notification.suggestion ? STATUS_LABEL[notification.suggestion.status] : "updated";
    return (
      <>
        <span className="font-medium text-fg">{title}</span> is now{" "}
        <span className="font-medium text-fg">{status}</span>
      </>
    );
  }

  if (notification.type === "mention") {
    return (
      <>
        <span className="font-medium text-fg">{actorName}</span> mentioned you in{" "}
        <span className="font-medium text-fg">{title}</span>
      </>
    );
  }

  return (
    <>
      New post: <span className="font-medium text-fg">{title}</span>
    </>
  );
}

function NotificationRow({
  notification,
  onNavigate,
}: {
  notification: Notification;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={notificationHref(notification)}
        onClick={() => {
          if (!notification.read) markNotificationRead(notification.id);
          onNavigate();
        }}
        className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-surface-hover"
      >
        <Avatar name={notification.actor?.display_name ?? "?"} src={notification.actor?.avatar_url} size={28} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-fg-muted">
            <NotificationText notification={notification} />
          </p>
          <span className="text-xs text-fg-subtle">
            {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        {!notification.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
      </Link>
    </li>
  );
}

export function NotificationBell({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [syncedInitial, setSyncedInitial] = React.useState(initialNotifications);
  const [open, setOpen] = React.useState(false);

  if (initialNotifications !== syncedInitial) {
    setSyncedInitial(initialNotifications);
    setNotifications(initialNotifications);
  }

  React.useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function handleInsert(payload: {
      new: {
        id: string;
        type: Notification["type"];
        created_at: string;
        actor_id: string;
        suggestion_id: string;
        comment_id: string | null;
      };
    }) {
      const row = payload.new;

      const [{ data: actor }, { data: suggestion }, comment] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, is_admin")
          .eq("id", row.actor_id)
          .single(),
        supabase.from("suggestions").select("id, title, status").eq("id", row.suggestion_id).single(),
        row.comment_id
          ? supabase.from("comments").select("id, body").eq("id", row.comment_id).single()
          : Promise.resolve({ data: null }),
      ]);

      setNotifications((current) => {
        if (current.some((n) => n.id === row.id)) return current;
        return [
          {
            id: row.id,
            type: row.type,
            read: false,
            created_at: row.created_at,
            actor,
            suggestion,
            comment: comment.data,
          },
          ...current,
        ];
      });
    }

    // Notifications are RLS-scoped to the recipient (unlike the public
    // comments feed), so Realtime needs the current session's JWT set
    // before subscribing, or postgres_changes silently delivers nothing.
    supabase.realtime.setAuth().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${userId}`,
          },
          handleInsert,
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  const unread = notifications.filter((n) => !n.read);
  const previous = notifications.filter((n) => n.read);

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <PopoverTrigger className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-muted outline-none transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <Bell size={17} />
        {unread.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-fg">
            {unread.length > 0 ? "Unread notifications" : "Notifications"}
          </span>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                setNotifications((current) => current.map((n) => ({ ...n, read: true })));
                await markAllNotificationsRead();
              }}
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Sparkles size={18} className="text-fg-subtle" />
              <p className="text-sm text-fg-muted">You&apos;re all caught up.</p>
            </div>
          ) : (
            <>
              {unread.length > 0 && (
                <ul className="divide-y divide-border">
                  {unread.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </ul>
              )}
              {previous.length > 0 && (
                <>
                  <div className="border-t border-border bg-bg-inset px-4 py-2">
                    <span className="text-xs font-medium text-fg-subtle">Previous notifications</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {previous.map((notification) => (
                      <NotificationRow
                        key={notification.id}
                        notification={notification}
                        onNavigate={() => setOpen(false)}
                      />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
