"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { formatDistanceToNowStrict } from "date-fns";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useOpenUserProfile } from "@/components/profile/user-profile-provider";
import { updateComment } from "@/lib/actions/comments";
import type { Comment, Profile } from "@/lib/types";

type CommentRealtimeRow = {
  id: string;
  suggestion_id: string;
  author_id: string;
  body: unknown;
  created_at: string;
};

function CommentItem({ comment, canEdit }: { comment: Comment; canEdit: boolean }) {
  const router = useRouter();
  const openUserProfile = useOpenUserProfile();
  const [editing, setEditing] = React.useState(false);
  const [draftBody, setDraftBody] = React.useState<JSONContent | null>(comment.body as JSONContent);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateComment(
      comment.id,
      comment.suggestion_id,
      JSON.stringify(draftBody ?? { type: "doc", content: [] }),
    );
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <li className="group/comment animate-slide-up flex items-start gap-2.5">
      {comment.author ? (
        <button
          type="button"
          onClick={() => openUserProfile(comment.author!)}
          className="shrink-0 rounded-full transition-opacity hover:opacity-80"
        >
          <Avatar
            name={comment.author.display_name}
            src={comment.author.avatar_url}
            size={26}
            isAdmin={comment.author.is_admin}
          />
        </button>
      ) : (
        <Avatar name="Anonymous" src={null} size={26} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-fg-subtle">
          <span className="font-medium text-fg">
            {comment.author?.display_name ?? "Anonymous"}
          </span>
          <span>
            {formatDistanceToNowStrict(new Date(comment.created_at), { addSuffix: true })}
            {comment.edited_at && " · (edited)"}
          </span>
          {canEdit && !editing && (
            <button
              type="button"
              onClick={() => {
                setDraftBody(comment.body as JSONContent);
                setError(null);
                setEditing(true);
              }}
              aria-label="Edit comment"
              className="rounded-md p-0.5 text-fg-subtle opacity-0 transition-opacity group-hover/comment:opacity-100 hover:bg-surface-hover hover:text-fg"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
        {editing ? (
          <div className="mt-1.5 flex flex-col gap-2">
            <RichTextEditor content={draftBody} onChange={setDraftBody} size="base" />
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex items-center gap-2 self-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <RichTextEditor
            content={comment.body as JSONContent}
            editable={false}
            size="base"
            className="mt-0.5"
          />
        )}
      </div>
    </li>
  );
}

export function CommentList({
  suggestionId,
  initialComments,
  currentUserId,
}: {
  suggestionId: string;
  initialComments: Comment[];
  currentUserId?: string | null;
}) {
  const [comments, setComments] = React.useState(initialComments);
  const [syncedComments, setSyncedComments] = React.useState(initialComments);
  const profileCache = React.useRef(new Map<string, Profile | null>());

  // Reconcile local state when the server hands us a fresh `initialComments`
  // (e.g. after a full page data refetch), following React's documented
  // "adjusting state during render" pattern instead of an effect, since
  // committing state during render also runs before the browser paints.
  if (initialComments !== syncedComments) {
    setSyncedComments(initialComments);
    setComments(initialComments);
  }

  React.useEffect(() => {
    for (const comment of initialComments) {
      if (comment.author) profileCache.current.set(comment.author.id, comment.author);
    }
  }, [initialComments]);

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${suggestionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `suggestion_id=eq.${suggestionId}`,
        },
        async (payload) => {
          const row = payload.new as CommentRealtimeRow;

          let author = profileCache.current.get(row.author_id) ?? null;
          if (!author) {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, display_name, avatar_url, is_admin")
              .eq("id", row.author_id)
              .single();
            if (error) console.error("fetch comment author failed:", error);
            author = data;
            profileCache.current.set(row.author_id, author);
          }

          setComments((current) => {
            if (current.some((comment) => comment.id === row.id)) return current;
            return [
              ...current,
              {
                id: row.id,
                suggestion_id: row.suggestion_id,
                body: row.body,
                created_at: row.created_at,
                edited_at: null,
                author,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [suggestionId]);

  if (comments.length === 0) {
    return <p className="text-sm text-fg-muted">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          canEdit={Boolean(currentUserId) && currentUserId === comment.author?.id}
        />
      ))}
    </ul>
  );
}
