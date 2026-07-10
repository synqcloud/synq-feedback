import { cn } from "@/lib/cn";

// The one place that defines how far content sits from the viewport edge.
// Nav, sub-nav, and every top-level page render inside this so corner
// controls (tabs, avatar, "Suggest an idea") stay anchored to the edges
// while the actual content narrows and centers itself underneath.
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[120rem] px-6 sm:px-8", className)}>{children}</div>
  );
}
