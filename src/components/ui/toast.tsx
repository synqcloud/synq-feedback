"use client";

import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import { cn } from "@/lib/cn";

export const useToast = Toast.useToastManager;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] flex-col gap-2 sm:w-80">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "relative rounded-lg border border-border bg-surface p-3 text-fg shadow-lg transition-[transform,opacity] duration-300",
        "data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0",
        toast.type === "error" && "border-danger/40",
      )}
    >
      <Toast.Title className="text-sm font-medium" />
      <Toast.Description className="text-sm text-fg-muted" />
    </Toast.Root>
  ));
}
