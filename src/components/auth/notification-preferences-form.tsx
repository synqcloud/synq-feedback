"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import {
  getMyNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/actions/notification-preferences";
import { unsubscribeFromAllSuggestions } from "@/lib/actions/subscriptions";
import type { NotificationPreferences } from "@/lib/types";

const DEFAULT_PREFS: NotificationPreferences = {
  email_on_mention: true,
  auto_subscribe_own_posts: true,
  auto_subscribe_commented: true,
  auto_subscribe_voted: false,
};

const ROWS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "email_on_mention", label: "Email me when someone cites me with an @mention" },
  {
    key: "auto_subscribe_own_posts",
    label: "Auto-subscribe to own posts and get notified when someone responds",
  },
  { key: "auto_subscribe_commented", label: "Auto-subscribe to posts that you comment on" },
  { key: "auto_subscribe_voted", label: "Auto-subscribe to posts that you vote for" },
];

export function NotificationPreferencesForm() {
  const toast = useToast();
  const [prefs, setPrefs] = React.useState<NotificationPreferences>(DEFAULT_PREFS);
  const [unsubscribing, setUnsubscribing] = React.useState(false);

  React.useEffect(() => {
    getMyNotificationPreferences().then((result) => {
      if (result.data) setPrefs(result.data);
    });
  }, []);

  async function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const result = await updateNotificationPreferences(next);
    if (result.error) {
      toast.add({ title: "Couldn't save", description: result.error, type: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs font-medium text-fg-subtle">Activity related to you</span>

      {ROWS.map((row) => (
        <div key={row.key} className="flex items-start justify-between gap-4">
          <span className="text-sm text-fg">{row.label}</span>
          <Switch
            checked={prefs[row.key]}
            onCheckedChange={(checked) => handleToggle(row.key, checked)}
            aria-label={row.label}
            className="mt-0.5"
          />
        </div>
      ))}

      <button
        type="button"
        disabled={unsubscribing}
        onClick={async () => {
          setUnsubscribing(true);
          await unsubscribeFromAllSuggestions();
          setUnsubscribing(false);
          toast.add({ title: "Unsubscribed from all posts" });
        }}
        className="self-start text-sm text-danger hover:underline"
      >
        {unsubscribing ? "Unsubscribing..." : "Unsubscribe from all posts"}
      </button>
    </div>
  );
}
