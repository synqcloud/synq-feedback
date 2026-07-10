import { cn } from "@/lib/cn";

export function ContentCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
