"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/cn";

export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      className={cn(
        "relative flex h-5 w-9 shrink-0 cursor-default items-center rounded-full bg-border-strong p-0.5 transition-colors duration-[var(--duration-fast)] data-checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-[var(--duration-fast)] data-checked:translate-x-4" />
    </BaseSwitch.Root>
  );
}
