import Link from "next/link";
import { VoteButton } from "@/components/suggestions/vote-button";
import { StatusBadge } from "@/components/suggestions/status-badge";
import { TypeBadge } from "@/components/suggestions/type-badge";
import { getTextPreview } from "@/lib/text-preview";
import { STATUS_HOVER_BORDER_CLASS, type Suggestion } from "@/lib/types";
import { cn } from "@/lib/cn";

export function KanbanCard({
  suggestion,
  isSignedIn,
}: {
  suggestion: Suggestion;
  isSignedIn: boolean;
}) {
  const preview = getTextPreview(suggestion.body, 90);

  return (
    <div
      className={cn(
        "relative rounded-md border border-transparent bg-surface px-4 py-3.5 shadow-sm transition-colors duration-[var(--duration-base)]",
        STATUS_HOVER_BORDER_CLASS[suggestion.status],
      )}
    >
      <Link
        href={`/suggestions/${suggestion.id}`}
        className="absolute inset-0 rounded-md"
        aria-label={suggestion.title}
      />
      <h3 className="text-sm font-medium text-fg">{suggestion.title}</h3>
      {preview && <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{preview}</p>}
      <div className="relative mt-3 flex items-center justify-between">
        {suggestion.type ? (
          <TypeBadge type={suggestion.type} />
        ) : (
          <StatusBadge status={suggestion.status} />
        )}
        <VoteButton
          suggestionId={suggestion.id}
          voteCount={suggestion.vote_count}
          hasVoted={suggestion.has_voted}
          isSignedIn={isSignedIn}
          variant="chip"
        />
      </div>
    </div>
  );
}
