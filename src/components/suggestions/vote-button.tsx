"use client";

import * as React from "react";
import { Check, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { toggleVote } from "@/lib/actions/suggestions";
import { SignInDialog } from "@/components/auth/sign-in-dialog";

export function VoteButton({
  suggestionId,
  voteCount,
  hasVoted,
  isSignedIn,
  variant = "box",
}: {
  suggestionId: string;
  voteCount: number;
  hasVoted: boolean;
  isSignedIn: boolean;
  variant?: "box" | "pill" | "chip";
}) {
  const [isPending, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useOptimistic(
    { count: voteCount, voted: hasVoted },
    (_state, voted: boolean) => ({
      count: voteCount + (voted ? 1 : -1),
      voted,
    }),
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic(!optimistic.voted);
      await toggleVote(suggestionId, optimistic.voted);
    });
  }

  const button =
    variant === "pill" ? (
      <button
        type="button"
        disabled={isPending}
        onClick={isSignedIn ? handleClick : undefined}
        aria-pressed={optimistic.voted}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] active:scale-90",
          optimistic.voted
            ? "bg-accent-soft text-accent hover:bg-accent-soft"
            : "bg-accent text-accent-fg hover:bg-accent-hover",
        )}
      >
        <ChevronUp size={15} />
        {optimistic.voted ? "Voted" : "Upvote"}
        <span key={optimistic.count} className="animate-scale-in tabular-nums">
          {optimistic.count}
        </span>
      </button>
    ) : variant === "chip" ? (
      <button
        type="button"
        disabled={isPending}
        onClick={isSignedIn ? handleClick : undefined}
        aria-pressed={optimistic.voted}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-[4px] border py-[5px] text-xs font-normal tabular-nums transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] active:scale-90",
          optimistic.voted
            ? "border-accent border-l-[3px] bg-accent-soft pr-[6px] pl-[5px] text-accent"
            : "border-black/[0.08] px-[5px] text-fg-muted hover:bg-bg-inset hover:text-fg dark:border-white/[0.08]",
        )}
      >
        <span key={optimistic.voted ? "voted" : "unvoted"} className="animate-scale-in inline-flex">
          {optimistic.voted ? <Check size={10} /> : <ChevronUp size={10} />}
        </span>
        <span key={optimistic.count} className="animate-scale-in">
          {optimistic.count}
        </span>
      </button>
    ) : (
      <button
        type="button"
        disabled={isPending}
        onClick={isSignedIn ? handleClick : undefined}
        aria-pressed={optimistic.voted}
        className={cn(
          "flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-lg border py-1.5 transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] active:scale-90",
          optimistic.voted
            ? "border-accent bg-accent-soft text-accent"
            : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
        )}
      >
        <ChevronUp size={14} />
        <span key={optimistic.count} className="animate-scale-in text-xs font-medium tabular-nums">
          {optimistic.count}
        </span>
      </button>
    );

  if (!isSignedIn) {
    return <SignInDialog>{button}</SignInDialog>;
  }

  return button;
}
