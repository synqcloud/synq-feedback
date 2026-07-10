"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "@/lib/cn";

export const PopoverRoot = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;

export function PopoverContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof BasePopover.Popup> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align={align} sideOffset={sideOffset} className="z-50 outline-none">
        <BasePopover.Popup
          className={cn(
            "w-80 origin-[var(--transform-origin)] overflow-hidden rounded-lg border border-border bg-surface text-fg shadow-lg outline-none transition-[transform,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)] data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
            className,
          )}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
