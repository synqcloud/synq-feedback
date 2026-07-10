"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifySubscribers } from "@/lib/notify-subscribers";
import { emailMentionedUsers } from "@/lib/notify-mentions";
import { escapeHtml } from "@/lib/email-template";
import { getTextPreview } from "@/lib/text-preview";

// `bodyJson` is passed as a JSON string (not the JSONContent object
// directly): Next.js's Server Action argument serialization silently drops
// nested `attrs` objects (e.g. Tiptap mention node attrs) when passed as
// plain objects, so the editor stringifies and this parses it back.
export async function addComment(suggestionId: string, bodyJson: string) {
  const body = JSON.parse(bodyJson);
  const preview = getTextPreview(body, 300);
  if (!preview) {
    return { error: "Comment can't be empty." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ suggestion_id: suggestionId, author_id: userId, body });

  if (error) {
    return { error: "Could not post comment." };
  }

  revalidatePath(`/suggestions/${suggestionId}`);

  const [{ data: suggestion }, { data: commenter }] = await Promise.all([
    supabase.from("suggestions").select("title").eq("id", suggestionId).single(),
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
  ]);

  if (suggestion) {
    const commenterName = commenter?.display_name ?? "Someone";
    await notifySubscribers({
      suggestionId,
      excludeUserId: userId,
      subject: `New comment on "${suggestion.title}"`,
      preheader: `${commenterName} commented on ${suggestion.title}`,
      bodyHtml: `<p style="margin:0 0 10px 0;"><strong>${escapeHtml(commenterName)}</strong> commented on <strong>${escapeHtml(suggestion.title)}</strong>:</p><p style="margin:0;padding:12px 14px;background-color:#f6f7f8;border-radius:8px;color:#33353b;">${escapeHtml(preview)}</p>`,
    });
    await emailMentionedUsers({
      body,
      actorId: userId,
      actorName: commenterName,
      suggestionId,
      contextLabel: suggestion.title,
      preview,
    });
  }

  return { ok: true };
}

export async function updateComment(commentId: string, suggestionId: string, bodyJson: string) {
  const body = JSON.parse(bodyJson);
  const preview = getTextPreview(body, 300);
  if (!preview) {
    return { error: "Comment can't be empty." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }

  // RLS only lets the comment's own author update this row at all.
  const { error } = await supabase.from("comments").update({ body }).eq("id", commentId);

  if (error) {
    return { error: "Could not update comment." };
  }

  revalidatePath(`/suggestions/${suggestionId}`);
  return { ok: true };
}
