"use client";

import { DialogRoot, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NotificationPreferencesForm } from "@/components/auth/notification-preferences-form";

export function NotificationsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent width="sm">
        <DialogTitle>Notifications</DialogTitle>
        <div className="mt-5">
          <NotificationPreferencesForm />
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
