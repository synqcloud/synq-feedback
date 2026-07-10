import Link from "next/link";
import { VoteButton } from "@/components/suggestions/vote-button";
import { getTextPreview } from "@/lib/text-preview";
import type { Suggestion } from "@/lib/types";

export function SuggestionListRow({
  suggestion,
  isSignedIn,
}: {
  suggestion: Suggestion;
  isSignedIn: boolean;
}) {
  const preview = getTextPreview(suggestion.body);

  return (
    <div className="relative flex items-start gap-4 px-6 py-6 transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover">
      <Link
        href={`/suggestions/${suggestion.id}`}
        className="absolute inset-0"
        aria-label={suggestion.title}
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-fg">{suggestion.title}</h3>
        {preview && <p className="mt-1.5 line-clamp-2 text-base text-fg-muted">{preview}</p>}
      </div>
      <div className="relative">
        <VoteButton
          suggestionId={suggestion.id}
          voteCount={suggestion.vote_count}
          hasVoted={suggestion.has_voted}
          isSignedIn={isSignedIn}
        />
      </div>
    </div>
  );
}
