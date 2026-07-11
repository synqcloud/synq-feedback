import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SuggestionDetail } from "@/components/suggestions/suggestion-detail";
import { SuggestionModal } from "@/components/suggestions/suggestion-modal";

// Deliberately synchronous (unlike a plain `async function Page`) so
// SuggestionModal -- and its open animation -- mounts once, immediately.
// Only SuggestionDetailLoader suspends while data loads; if the whole page
// were async instead, Next's route-level Suspense (loading.tsx) would swap
// the entire fallback tree for a freshly-mounted real one, replaying the
// dialog's open animation a second time (looked like a double flash/blink).
export default function InterceptedSuggestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <SuggestionModal>
      <Suspense fallback={<Loader2 className="mx-auto my-16 animate-spin text-fg-subtle" size={22} />}>
        <SuggestionDetailLoader paramsPromise={params} />
      </Suspense>
    </SuggestionModal>
  );
}

async function SuggestionDetailLoader({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;
  return <SuggestionDetail id={id} showBackLink={false} />;
}
