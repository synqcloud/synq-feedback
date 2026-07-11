export function SuggestionDetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="h-7 w-3/4 animate-pulse rounded bg-bg-inset" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="h-4 w-full animate-pulse rounded bg-bg-inset" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-bg-inset" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-bg-inset" />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="h-4 w-40 animate-pulse rounded bg-bg-inset" />
        <div className="h-4 w-48 animate-pulse rounded bg-bg-inset" />
      </div>

      <div className="mt-6 flex items-center justify-between border-y border-border py-3">
        <div className="h-6 w-20 animate-pulse rounded bg-bg-inset" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-bg-inset" />
      </div>

      <div className="mt-6">
        <div className="mb-4 h-4 w-24 animate-pulse rounded bg-bg-inset" />
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="size-7 shrink-0 animate-pulse rounded-full bg-bg-inset" />
              <div className="flex-1 flex-col gap-2">
                <div className="h-3.5 w-32 animate-pulse rounded bg-bg-inset" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-bg-inset" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
