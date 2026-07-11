import { ContentCard } from "@/components/ui/content-card";
import { PageShell } from "@/components/layout/page-shell";
import { SuggestionDetailSkeleton } from "@/components/suggestions/suggestion-detail-skeleton";

export default function Loading() {
  return (
    <PageShell className="py-8">
      <div className="mx-auto max-w-[690px]">
        <ContentCard className="px-6 py-8 sm:px-8">
          <SuggestionDetailSkeleton />
        </ContentCard>
      </div>
    </PageShell>
  );
}
