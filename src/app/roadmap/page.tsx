import { getCurrentProfile } from "@/lib/auth";
import { getSuggestions, getSuggestionTypes } from "@/lib/data/suggestions";
import { getSiteSettings } from "@/lib/data/settings";
import { RoadmapSection } from "@/components/roadmap/roadmap-section";
import { RoadmapToolbar } from "@/components/roadmap/roadmap-toolbar";
import { NewSuggestionButton } from "@/components/suggestions/new-suggestion-dialog";
import { FeedbackBanner } from "@/components/board/feedback-banner";
import { ContentCard } from "@/components/ui/content-card";
import { PageShell } from "@/components/layout/page-shell";

const ROADMAP_STATUSES = ["planned", "in_progress", "testing", "completed"] as const;

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;

  const [profile, settings, types] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
    getSuggestionTypes(),
  ]);

  const sections = await Promise.all(
    ROADMAP_STATUSES.map((status) =>
      getSuggestions({ status, sort: "top", search, currentUserId: profile?.id ?? null }),
    ),
  );

  const isEmpty = sections.every((suggestions) => suggestions.length === 0);

  return (
    <PageShell className="pb-8">
      <div className="mx-auto max-w-[690px]">
        <ContentCard>
          <FeedbackBanner name={settings.name} description={settings.description} />

          <RoadmapToolbar>
            <NewSuggestionButton profile={profile} types={types} />
          </RoadmapToolbar>

          <div className="px-6 py-6 sm:px-8">
            {isEmpty ? (
              <p className="text-sm text-fg-muted">Nothing on the roadmap yet.</p>
            ) : (
              <div className="relative border-l border-dashed border-border">
                {ROADMAP_STATUSES.map((status, index) => (
                  <div key={status} className="-ml-px pl-6">
                    <RoadmapSection status={status} suggestions={sections[index]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </ContentCard>
      </div>
    </PageShell>
  );
}
