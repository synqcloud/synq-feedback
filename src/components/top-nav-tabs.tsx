"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "Feedback", match: (path: string) => path === "/" || path.startsWith("/kanban") || path.startsWith("/suggestions") },
  { href: "/roadmap", label: "Roadmap", match: (path: string) => path.startsWith("/roadmap") },
];

export function TopNavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 py-3.5 text-sm font-medium transition-colors",
              active
                ? "border-accent text-accent"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
