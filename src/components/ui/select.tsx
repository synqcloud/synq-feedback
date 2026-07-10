"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const SelectRoot = BaseSelect.Root;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Trigger>) {
  return (
    <BaseSelect.Trigger
      className={cn(
        "flex h-8 items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-fg select-none hover:bg-surface-hover data-popup-open:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon className="text-fg-subtle">
        <ChevronsUpDown size={14} />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export const SelectValue = BaseSelect.Value;

export function SelectContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Popup>) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner sideOffset={6} className="z-50 outline-none">
        <BaseSelect.Popup
          className={cn(
            "min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-lg border border-border bg-surface p-1 text-fg shadow-md outline-none transition-[transform,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)] data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
            className,
          )}
          {...props}
        />
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      className={cn(
        "grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-surface-hover",
        className,
      )}
      {...props}
    >
      <BaseSelect.ItemIndicator className="col-start-1 text-accent">
        <Check size={14} />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="col-start-2">{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}
