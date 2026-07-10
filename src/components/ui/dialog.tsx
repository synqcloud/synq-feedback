"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const DialogRoot = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  className,
  children,
  showClose = true,
  width = "md",
  ...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
  showClose?: boolean;
  width?: "sm" | "md" | "lg";
}) {
  const widthClasses = {
    sm: "w-[min(24rem,calc(100vw-2rem))]",
    md: "w-[min(32rem,calc(100vw-2rem))]",
    lg: "w-[min(42rem,calc(100vw-2rem))]",
  }[width];

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/70 transition-opacity duration-[260ms] ease-[var(--ease-out)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          "scrollbar-hide fixed top-1/2 left-1/2 z-50 max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-5 text-fg shadow-lg outline-none transition-[transform,opacity] duration-[260ms] ease-[var(--ease-out)] data-ending-style:translate-y-[calc(-50%+8px)] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:scale-[0.96] data-starting-style:opacity-0",
          widthClasses,
          className,
        )}
        {...props}
      >
        {showClose && (
          <BaseDialog.Close
            aria-label="Close"
            className="absolute top-4 right-4 inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X size={16} />
          </BaseDialog.Close>
        )}
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn("pr-6 text-base font-semibold text-fg", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn("text-sm text-fg-muted", className)}
      {...props}
    />
  );
}
