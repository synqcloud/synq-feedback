"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function RoadmapToolbar({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (search === (searchParams.get("q") ?? "")) return;
      const next = new URLSearchParams(searchParams);
      if (search) next.set("q", search);
      else next.delete("q");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex items-center gap-2 border-b border-border px-5 py-2.5">
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

      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}
