"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Bell, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MenuRoot, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { ProfileDialog } from "@/components/auth/profile-dialog";
import { ActivityDialog } from "@/components/auth/activity-dialog";
import { NotificationsDialog } from "@/components/auth/notifications-dialog";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/types";

export function UserMenu({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  if (!profile) {
    return (
      <SignInDialog>
        <Button variant="primary" size="sm">
          Sign in
        </Button>
      </SignInDialog>
    );
  }

  return (
    <>
      <MenuRoot>
        <MenuTrigger className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <Avatar name={profile.display_name} src={profile.avatar_url} size={28} />
        </MenuTrigger>
        <MenuContent>
          <div className="px-2 py-1.5 text-sm font-medium text-fg">{profile.display_name}</div>
          <MenuSeparator />
          <MenuItem onClick={() => setProfileOpen(true)}>
            <UserRound size={14} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => setActivityOpen(true)}>
            <Activity size={14} />
            Activity
          </MenuItem>
          <MenuItem onClick={() => setNotificationsOpen(true)}>
            <Bell size={14} />
            Notifications
          </MenuItem>
          {profile.is_admin && (
            <MenuItem render={<Link href="/settings" />}>
              <Settings size={14} />
              Site settings
            </MenuItem>
          )}
          <MenuSeparator />
          <MenuItem
            onClick={async () => {
              await signOut();
              router.refresh();
            }}
          >
            <LogOut size={14} />
            Sign out
          </MenuItem>
        </MenuContent>
      </MenuRoot>

      <ProfileDialog profile={profile} open={profileOpen} onOpenChange={setProfileOpen} />
      <ActivityDialog open={activityOpen} onOpenChange={setActivityOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}
