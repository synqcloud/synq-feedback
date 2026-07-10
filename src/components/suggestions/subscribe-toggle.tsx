"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleSubscription } from "@/lib/actions/subscriptions";
import { SignInDialog } from "@/components/auth/sign-in-dialog";

export function SubscribeToggle({
  suggestionId,
  isSubscribed,
  isSignedIn,
}: {
  suggestionId: string;
  isSubscribed: boolean;
  isSignedIn: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useOptimistic(
    isSubscribed,
    (_state, next: boolean) => next,
  );
  // Bumped only when subscribing (not on unsubscribe or initial render), and
  // used as a key to replay the ring animation each time it happens.
  const [ringKey, setRingKey] = React.useState(0);

  function handleClick() {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      await toggleSubscription(suggestionId, optimistic);
    });
    if (next) setRingKey((current) => current + 1);
  }

  const content = (
    <button
      type="button"
      disabled={isPending}
      onClick={isSignedIn ? handleClick : undefined}
      className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
    >
      <Bell
        key={ringKey}
        size={14}
        className={cn(
          "transition-colors duration-[var(--duration-base)]",
          optimistic && "fill-accent text-accent",
          ringKey > 0 && "animate-bell-ring",
        )}
      />
      {optimistic ? "Subscribed to updates" : "Subscribe to updates"}
    </button>
  );

  if (!isSignedIn) {
    return <SignInDialog>{content}</SignInDialog>;
  }

  return content;
}
