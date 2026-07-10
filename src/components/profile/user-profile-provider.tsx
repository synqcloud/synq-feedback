"use client";

import * as React from "react";
import { UserProfileModal } from "@/components/profile/user-profile-modal";

type TargetProfile = {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  is_admin?: boolean;
};

const UserProfileContext = React.createContext<((profile: TargetProfile) => void) | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = React.useState<TargetProfile | null>(null);

  const openUserProfile = React.useCallback((profile: TargetProfile) => {
    setTarget(profile);
  }, []);

  return (
    <UserProfileContext.Provider value={openUserProfile}>
      {children}
      <UserProfileModal
        userId={target?.id ?? ""}
        triggerProfile={target}
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
      />
    </UserProfileContext.Provider>
  );
}

export function useOpenUserProfile() {
  const open = React.useContext(UserProfileContext);
  if (!open) {
    throw new Error("useOpenUserProfile must be used within a UserProfileProvider");
  }
  return open;
}
