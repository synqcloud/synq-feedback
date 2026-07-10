"use client";

import { createClient } from "@/lib/supabase/client";
import type { SuggestionStatus } from "@/lib/types";

export type MentionItem =
  | { kind: "user"; id: string; label: string; avatarUrl: string | null }
  | { kind: "suggestion"; id: string; label: string; status: SuggestionStatus };

export async function searchMentionItems(query: string): Promise<MentionItem[]> {
  const supabase = createClient();
  const like = `%${query}%`;

  const [{ data: profiles }, { data: suggestions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .ilike("display_name", like)
      .limit(5),
    supabase.from("suggestions").select("id, title, status").ilike("title", like).limit(5),
  ]);

  const users: MentionItem[] = (profiles ?? []).map((profile) => ({
    kind: "user",
    id: profile.id,
    label: profile.display_name,
    avatarUrl: profile.avatar_url,
  }));

  const posts: MentionItem[] = (suggestions ?? []).map((suggestion) => ({
    kind: "suggestion",
    id: suggestion.id,
    label: suggestion.title,
    status: suggestion.status,
  }));

  return [...users, ...posts];
}
