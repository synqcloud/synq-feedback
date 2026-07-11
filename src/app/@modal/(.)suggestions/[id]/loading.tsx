import { SuggestionModal } from "@/components/suggestions/suggestion-modal";
import { SuggestionDetailSkeleton } from "@/components/suggestions/suggestion-detail-skeleton";

export default function Loading() {
  return (
    <SuggestionModal>
      <SuggestionDetailSkeleton />
    </SuggestionModal>
  );
}
