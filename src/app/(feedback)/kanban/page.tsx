import Image from "next/image";
import { getCurrentProfile } from "@/lib/auth";
import { getSuggestions, getSuggestionTypes, type SortOrder } from "@/lib/data/suggestions";
import { getSiteSettings } from "@/lib/data/settings";
import { SUGGESTION_STATUSES, type SuggestionStatus } from "@/lib/types";
import { NewSuggestionButton } from "@/components/suggestions/new-suggestion-dialog";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { KanbanColumn } from "@/components/board/kanban-column";

export default async function KanbanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = SUGGESTION_STATUSES.includes(params.status as SuggestionStatus)
    ? (params.status as SuggestionStatus)
    : undefined;
  const sort: SortOrder = params.sort === "new" ? "new" : "top";
  const search = params.q?.trim() || undefined;

  const [profile, settings, types] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
    getSuggestionTypes(),
  ]);
  const statuses = statusFilter ? [statusFilter] : SUGGESTION_STATUSES;

  const columns = await Promise.all(
    statuses.map((status) =>
      getSuggestions({ status, sort, search, currentUserId: profile?.id ?? null }),
    ),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-center gap-2">
        <Image src="/synq-icon.png" alt="" width={22} height={22} priority />
        <h1 className="text-center text-xl font-medium text-fg">{settings.name}</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md">
        <div className="shrink-0 border-y border-border bg-bg-inset">
          <BoardToolbar centered className="py-2">
            <NewSuggestionButton profile={profile} types={types} />
          </BoardToolbar>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-kanban-dots">
          <div className="animate-fade-in flex h-full items-stretch gap-[26px] overflow-x-auto overflow-y-hidden px-6 pt-4 pb-4">
            {statuses.map((status, index) => (
              <KanbanColumn
                key={status}
                status={status}
                suggestions={columns[index]}
                isSignedIn={Boolean(profile)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
