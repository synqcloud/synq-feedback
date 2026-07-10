const COLUMN_CARD_COUNTS = [3, 2, 4, 1, 3, 2];

export default function KanbanLoading() {
  return (
    <div className="flex h-full animate-fade-in flex-col">
      <div className="mx-auto mb-3 h-6 w-32 shrink-0 animate-pulse rounded bg-bg-inset" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md">
        <div className="shrink-0 border-y border-border bg-bg-inset">
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-8 w-24 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-8 w-24 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-8 w-28 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-8 w-32 animate-pulse rounded-md bg-accent-soft" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-kanban-dots">
          <div className="flex h-full items-stretch gap-[26px] overflow-x-auto overflow-y-hidden px-6 pt-4 pb-4">
            {COLUMN_CARD_COUNTS.map((count, columnIndex) => (
              <div key={columnIndex} className="flex h-full w-[280px] shrink-0 flex-col gap-3">
                <div className="h-10 shrink-0 animate-pulse rounded-md bg-bg-inset" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: count }).map((_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="h-[104px] animate-pulse rounded-md bg-surface shadow-sm"
                      style={{ animationDelay: `${(columnIndex * 80 + cardIndex * 40) % 600}ms` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
