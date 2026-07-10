import { getCurrentProfile } from "@/lib/auth";
import { getSuggestions, getSuggestionTypes, type SortOrder } from "@/lib/data/suggestions";
import { getSiteSettings } from "@/lib/data/settings";
import { SUGGESTION_STATUSES, type SuggestionStatus } from "@/lib/types";
import { NewSuggestionButton } from "@/components/suggestions/new-suggestion-dialog";
import { SuggestionListRow } from "@/components/suggestions/suggestion-list-row";
import { FeedbackBanner } from "@/components/board/feedback-banner";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { ContentCard } from "@/components/ui/content-card";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = SUGGESTION_STATUSES.includes(params.status as SuggestionStatus)
    ? (params.status as SuggestionStatus)
    : undefined;
  const sort: SortOrder = params.sort === "new" ? "new" : "top";
  const search = params.q?.trim() || undefined;

  const [profile, settings, types] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
    getSuggestionTypes(),
  ]);
  const suggestions = await getSuggestions({
    status,
    sort,
    search,
    currentUserId: profile?.id ?? null,
  });

  return (
    <div className="mx-auto max-w-[690px]">
      <ContentCard>
        <FeedbackBanner name={settings.name} description={settings.description} />

        <BoardToolbar className="sticky top-[50px] z-10 bg-surface">
          <NewSuggestionButton profile={profile} types={types} />
        </BoardToolbar>

        {suggestions.length === 0 ? (
          <div className="animate-fade-in px-5 py-16 text-center text-sm text-fg-muted">
            {search
              ? `No suggestions match "${search}".`
              : "No suggestions yet. Be the first to share an idea."}
          </div>
        ) : (
          <div className="animate-fade-in divide-y divide-border">
            {suggestions.map((suggestion) => (
              <SuggestionListRow
                key={suggestion.id}
                suggestion={suggestion}
                isSignedIn={Boolean(profile)}
              />
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
