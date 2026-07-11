"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifySubscribers } from "@/lib/notify-subscribers";
import { emailMentionedUsers } from "@/lib/notify-mentions";
import { escapeHtml } from "@/lib/email-template";
import { getTextPreview } from "@/lib/text-preview";
import { STATUS_LABEL, type SuggestionStatus } from "@/lib/types";

// `body` is passed as a JSON string (not the JSONContent object directly):
// Next.js's Server Action argument serialization silently drops nested
// `attrs` objects (e.g. Tiptap image node attrs) when passed as plain
// objects, so the editor stringifies and this parses it back.
export async function createSuggestion(title: string, bodyJson: string, typeId: string | null) {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 3) {
    return { error: "Title must be at least 3 characters." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }

  const body = JSON.parse(bodyJson);
  const { data, error } = await supabase
    .from("suggestions")
    .insert({
      title: trimmedTitle,
      body,
      author_id: userId,
      type_id: typeId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create suggestion." };
  }

  // Authors implicitly vote for their own post (vote_count is trigger-derived
  // from this table, so inserting here is what takes it from 0 to 1).
  await supabase.from("votes").insert({ suggestion_id: data.id, user_id: userId });

  const { data: author } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  await emailMentionedUsers({
    body,
    actorId: userId,
    actorName: author?.display_name ?? "Someone",
    suggestionId: data.id,
    contextLabel: trimmedTitle,
    preview: getTextPreview(body, 300),
  });

  revalidatePath("/");
  return { id: data.id };
}

export async function updateSuggestion(suggestionId: string, title: string, bodyJson: string) {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 3) {
    return { error: "Title must be at least 3 characters." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }

  // RLS only lets the author (or an admin) update this row at all, and a
  // trigger pins status/type/author_id/vote_count back to their old values
  // for non-admins, so this can't be used to sneak a status/type change.
  const { error } = await supabase
    .from("suggestions")
    .update({ title: trimmedTitle, body: JSON.parse(bodyJson) })
    .eq("id", suggestionId);

  if (error) {
    return { error: "Could not update suggestion." };
  }

  revalidatePath("/");
  revalidatePath(`/suggestions/${suggestionId}`);
  return { ok: true };
}

export async function toggleVote(suggestionId: string, hasVoted: boolean) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }

  if (hasVoted) {
    await supabase
      .from("votes")
      .delete()
      .eq("suggestion_id", suggestionId)
      .eq("user_id", userId);
  } else {
    await supabase.from("votes").insert({ suggestion_id: suggestionId, user_id: userId });
  }

  // Deliberately not revalidating "/" or "/roadmap" here: both sort by
  // vote_count by default, so refreshing them mid-session would reorder the
  // list out from under whoever just clicked, right as they clicked it. The
  // optimistic count update already reflects the vote instantly; the real
  // order catches up next time those pages load fresh (both already render
  // dynamically per-request via getCurrentProfile()'s cookie read, so no
  // extra revalidation is needed for that).
  revalidatePath(`/suggestions/${suggestionId}`);
  return { ok: true };
}

export async function updateSuggestionStatus(suggestionId: string, status: SuggestionStatus) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;

  const { data: suggestion, error } = await supabase
    .from("suggestions")
    .update({ status })
    .eq("id", suggestionId)
    .select("title")
    .single();

  if (error) {
    return { error: "Could not update status." };
  }

  revalidatePath("/");
  revalidatePath(`/suggestions/${suggestionId}`);
  revalidatePath("/roadmap");

  if (suggestion && userId) {
    await notifySubscribers({
      suggestionId,
      excludeUserId: userId,
      subject: `"${suggestion.title}" is now ${STATUS_LABEL[status]}`,
      preheader: `${suggestion.title} was marked as ${STATUS_LABEL[status]}`,
      bodyHtml: `<p style="margin:0;"><strong>${escapeHtml(suggestion.title)}</strong> was marked as <strong>${escapeHtml(STATUS_LABEL[status])}</strong>.</p>`,
    });
  }

  return { ok: true };
}
