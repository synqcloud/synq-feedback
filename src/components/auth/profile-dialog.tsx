"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { DialogRoot, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile";
import type { Profile } from "@/lib/types";

export function ProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = React.useState(profile.display_name);
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatar_url);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [syncedOpen, setSyncedOpen] = React.useState(open);

  // Reset the form to the latest profile whenever the dialog transitions to
  // open, following React's "adjust state during render" pattern instead of
  // an effect (setState here commits before the browser paints).
  if (open !== syncedOpen) {
    setSyncedOpen(open);
    if (open) {
      setDisplayName(profile.display_name);
      setAvatarUrl(profile.avatar_url);
      setError(null);
    }
  }

  async function handleAvatarChange(file: File) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${profile.id}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
    setUploading(false);
    if (uploadError) {
      setError("Could not upload image.");
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = await updateProfile({ display_name: displayName, avatar_url: avatarUrl });

    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent width="sm">
        <DialogTitle>Profile</DialogTitle>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative shrink-0 rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Avatar name={displayName || profile.display_name} src={avatarUrl} size={56} />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                <Camera size={18} />
              </span>
            </button>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Change logo"}
              </Button>
              <span className="text-xs text-fg-subtle">PNG, JPG, GIF or WebP.</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleAvatarChange(file);
                event.target.value = "";
              }}
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">Name</span>
            <input
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={saving || uploading}
            className="self-start"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
