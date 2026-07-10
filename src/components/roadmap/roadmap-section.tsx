"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { STATUS_LABEL, STATUS_RING_CLASS, type Suggestion, type SuggestionStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const VISIBLE_COUNT = 6;

export function RoadmapSection({
  status,
  suggestions,
}: {
  status: SuggestionStatus;
  suggestions: Suggestion[];
}) {
  const [expanded, setExpanded] = React.useState(false);
  const visible = expanded ? suggestions : suggestions.slice(0, VISIBLE_COUNT);
  const remaining = suggestions.length - visible.length;

  if (suggestions.length === 0) return null;

  return (
    <div className="relative pb-10">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={cn(
            "h-3 w-3 shrink-0 rounded-full border-2 bg-surface",
            STATUS_RING_CLASS[status],
          )}
        />
        <h2 className="text-sm font-semibold text-fg">{STATUS_LABEL[status]}</h2>
      </div>

      <ul className="flex flex-col gap-2.5 pl-[1.375rem]">
        {visible.map((suggestion) => (
          <li key={suggestion.id} className="relative pl-4">
            <span className="absolute top-[0.55rem] left-0 h-1 w-1 rounded-full bg-fg-subtle" />
            <Link
              href={`/suggestions/${suggestion.id}`}
              className="text-sm text-fg hover:text-accent"
            >
              {suggestion.title}
            </Link>
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 ml-[1.375rem] flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg"
        >
          View {remaining} more
          <ChevronDown size={13} />
        </button>
      )}
    </div>
  );
}
