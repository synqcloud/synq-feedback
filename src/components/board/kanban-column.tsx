import { KanbanCard } from "@/components/board/kanban-card";
import { STATUS_LABEL, STATUS_RING_CLASS, type Suggestion, type SuggestionStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export function KanbanColumn({
  status,
  suggestions,
  isSignedIn,
}: {
  status: SuggestionStatus;
  suggestions: Suggestion[];
  isSignedIn: boolean;
}) {
  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col gap-3">
      <div className="flex shrink-0 items-center gap-2 rounded-md bg-bg-inset px-5 py-2.5">
        <span className={cn("h-[11px] w-[11px] shrink-0 rounded-full border-2", STATUS_RING_CLASS[status])} />
        <h2 className="text-sm font-medium text-fg">{STATUS_LABEL[status]}</h2>
        <span className="text-fg-subtle">·</span>
        <span className="text-sm text-fg-muted">{suggestions.length}</span>
      </div>
      <div className="fade-bottom min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2.5 pr-1 pb-1">
          {suggestions.map((suggestion) => (
            <KanbanCard key={suggestion.id} suggestion={suggestion} isSignedIn={isSignedIn} />
          ))}
        </div>
      </div>
    </div>
  );
}
