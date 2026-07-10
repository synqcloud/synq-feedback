"use server";

import { createClient } from "@/lib/supabase/server";
import { getTextPreview } from "@/lib/text-preview";

export type ActivityData = {
  profile: { id: string; display_name: string; avatar_url: string | null; is_admin: boolean } | null;
  posts: { id: string; title: string; created_at: string }[];
  comments: {
    id: string;
    body: string;
    created_at: string;
    suggestion_id: string;
    suggestion_title: string;
  }[];
  votes: { suggestion_id: string; title: string; created_at: string }[];
};

export async function getUserActivity(userId: string): Promise<{ data?: ActivityData; error?: string }> {
  const supabase = await createClient();

  const [{ data: profile }, { data: posts }, { data: comments }, { data: votes }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, is_admin").eq("id", userId).single(),
    supabase
      .from("suggestions")
      .select("id, title, created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("id, body, created_at, suggestion_id, suggestion:suggestions(title)")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("votes")
      .select("created_at, suggestion:suggestions(id, title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    data: {
      profile: profile ?? null,
      posts: posts ?? [],
      comments: (comments ?? []).map((comment) => ({
        id: comment.id,
        body: getTextPreview(comment.body, 120),
        created_at: comment.created_at,
        suggestion_id: comment.suggestion_id,
        suggestion_title: comment.suggestion?.title ?? "Deleted suggestion",
      })),
      votes: (votes ?? [])
        .filter((vote) => vote.suggestion)
        .map((vote) => ({
          suggestion_id: vote.suggestion!.id,
          title: vote.suggestion!.title,
          created_at: vote.created_at,
        })),
    },
  };
}

export async function getMyActivity(): Promise<{ data?: ActivityData; error?: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }
  return getUserActivity(userId);
}
