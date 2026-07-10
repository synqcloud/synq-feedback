import { STATUS_DOT_CLASS, STATUS_LABEL, type SuggestionStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export function StatusBadge({
  status,
  className,
}: {
  status: SuggestionStatus;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-fg-muted", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
