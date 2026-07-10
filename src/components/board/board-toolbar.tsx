"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { STATUS_LABEL, SUGGESTION_STATUSES, type SuggestionStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const SORT_LABEL: Record<string, string> = { top: "Trending", new: "Newest" };

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };
}

export function BoardToolbar({
  children,
  className,
  centered = false,
}: {
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
}) {
  const searchParams = useSearchParams();
  const updateQuery = useQueryUpdater();

  const sort = searchParams.get("sort") ?? "top";
  const status = searchParams.get("status") ?? "";
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (searchParams.get("q") ?? "")) {
        updateQuery({ q: search || null });
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5",
        centered && "justify-center border-none px-0",
        className,
      )}
    >
      <SelectRoot
        value={sort}
        onValueChange={(value: string | null) => updateQuery({ sort: value === "top" ? null : value })}
        items={[
          { value: "top", label: "Trending" },
          { value: "new", label: "Newest" },
        ]}
      >
        <SelectTrigger className="gap-1.5 border-none bg-transparent px-1.5 hover:bg-surface-hover">
          <TrendingUp size={14} className="text-fg-subtle" />
          <SelectValue>{() => SORT_LABEL[sort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="top">Trending</SelectItem>
          <SelectItem value="new">Newest</SelectItem>
        </SelectContent>
      </SelectRoot>

      <SelectRoot
        value={status}
        onValueChange={(value: string | null) => updateQuery({ status: value || null })}
        items={[
          { value: "", label: "All statuses" },
          ...SUGGESTION_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
        ]}
      >
        <SelectTrigger className="gap-1.5 border-none bg-transparent px-1.5 hover:bg-surface-hover">
          <SlidersHorizontal size={14} className="text-fg-subtle" />
          <SelectValue>
            {() => (status ? STATUS_LABEL[status as SuggestionStatus] : "Filters")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All statuses</SelectItem>
          {SUGGESTION_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {STATUS_LABEL[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      <div className="flex h-8 items-center gap-1.5 rounded-md px-1.5 text-fg-muted transition-colors focus-within:bg-surface-hover hover:bg-surface-hover">
        <Search size={14} className="text-fg-subtle" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="w-24 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle focus:w-36"
          style={{ transition: "width var(--duration-base) var(--ease-out)" }}
        />
      </div>

      {children && <div className={cn(!centered && "ml-auto")}>{children}</div>}
    </div>
  );
}
