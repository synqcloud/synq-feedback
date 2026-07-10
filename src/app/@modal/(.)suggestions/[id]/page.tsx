import { SuggestionDetail } from "@/components/suggestions/suggestion-detail";
import { SuggestionModal } from "@/components/suggestions/suggestion-modal";

export default async function InterceptedSuggestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SuggestionModal>
      <SuggestionDetail id={id} showBackLink={false} />
    </SuggestionModal>
  );
}
