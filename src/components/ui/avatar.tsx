import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Avatar({
  name,
  src,
  size = 24,
  isAdmin = false,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  isAdmin?: boolean;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const badgeSize = Math.max(11, Math.round(size * 0.42));

  return (
    <span
      className={cn("relative inline-flex shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <BaseAvatar.Root
        className="inline-flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-accent-soft font-medium text-accent select-none"
        style={{ fontSize: size * 0.4 }}
      >
        {src && <BaseAvatar.Image src={src} alt={name} className="h-full w-full object-cover" />}
        <BaseAvatar.Fallback>{initials}</BaseAvatar.Fallback>
      </BaseAvatar.Root>
      {isAdmin && (
        <span
          className="absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-accent ring-2 ring-surface"
          style={{ width: badgeSize, height: badgeSize }}
          title="Admin"
        >
          <Star size={badgeSize * 0.58} className="fill-white text-white" />
        </span>
      )}
    </span>
  );
}
