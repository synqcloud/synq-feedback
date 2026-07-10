"use client";

import { Avatar } from "@/components/ui/avatar";
import { useOpenUserProfile } from "@/components/profile/user-profile-provider";
import type { Profile } from "@/lib/types";

export function AuthorLink({ author }: { author: Profile }) {
  const openUserProfile = useOpenUserProfile();

  return (
    <button
      type="button"
      onClick={() => openUserProfile(author)}
      className="flex items-center gap-1.5 rounded-md py-0.5 pr-1.5 pl-0.5 transition-colors hover:bg-surface-hover"
    >
      <Avatar name={author.display_name} src={author.avatar_url} size={18} isAdmin={author.is_admin} />
      <span className="text-fg">{author.display_name}</span>
    </button>
  );
}
