"use client";

import { useRouter } from "next/navigation";
import { DialogRoot, DialogContent } from "@/components/ui/dialog";

export function SuggestionModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <DialogRoot
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent
        width="lg"
        className="w-[min(52rem,calc(100vw-4rem))] max-h-[90vh] p-8 sm:p-10"
      >
        {children}
      </DialogContent>
    </DialogRoot>
  );
}
