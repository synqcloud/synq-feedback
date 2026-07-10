"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, Columns3 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/cn";

const VIEWS = [
  { href: "/", label: "Board", icon: LayoutList },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
];

// Rendered above every top-level tab (Feedback and Roadmap) so the content
// card below always sits at the same vertical position. On Feedback/Kanban
// it shows the Board/Kanban toggle; on Roadmap it reserves the identical
// height but stays invisible, so switching tabs never shifts the card.
const RESERVED_PATHS = ["/", "/kanban", "/roadmap"];

export function FeedbackSubNav() {
  const pathname = usePathname();
  if (!RESERVED_PATHS.includes(pathname)) return null;

  const showLinks = pathname === "/" || pathname === "/kanban";

  return (
    <div>
      <PageShell className="pt-5">
        <div className={cn("mb-3 flex items-center gap-2", !showLinks && "invisible")}>
          {VIEWS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                tabIndex={showLinks ? 0 : -1}
                aria-hidden={!showLinks}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-fg-muted hover:text-fg",
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </div>
      </PageShell>
    </div>
  );
}
