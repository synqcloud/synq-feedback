import type { SuggestionType } from "@/lib/types";
import { cn } from "@/lib/cn";

export function TypeBadge({
  type,
  className,
}: {
  type: SuggestionType;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-fg-muted", className)}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
      {type.name}
    </span>
  );
}
