"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "@/lib/cn";

export const MenuRoot = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;

export function MenuContent({
  className,
  align = "end",
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  align?: "start" | "end";
}) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner align={align} sideOffset={6} className="z-50 outline-none">
        <BaseMenu.Popup
          className={cn(
            "min-w-40 origin-[var(--transform-origin)] rounded-lg border border-border bg-surface p-1 text-fg shadow-md outline-none transition-[transform,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)] data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
            className,
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Item>) {
  return (
    <BaseMenu.Item
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-surface-hover",
        className,
      )}
      {...props}
    />
  );
}

export const MenuSeparator = ({ className }: { className?: string }) => (
  <BaseMenu.Separator className={cn("my-1 h-px bg-border", className)} />
);
