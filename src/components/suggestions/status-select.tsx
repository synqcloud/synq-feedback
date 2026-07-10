"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { STATUS_LABEL, SUGGESTION_STATUSES, type SuggestionStatus } from "@/lib/types";
import { updateSuggestionStatus } from "@/lib/actions/suggestions";

export function StatusSelect({
  suggestionId,
  status,
}: {
  suggestionId: string;
  status: SuggestionStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <SelectRoot
      value={status}
      disabled={pending}
      onValueChange={(next: SuggestionStatus | null) => {
        if (!next) return;
        startTransition(async () => {
          await updateSuggestionStatus(suggestionId, next);
          router.refresh();
        });
      }}
      items={SUGGESTION_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] }))}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUGGESTION_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABEL[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
