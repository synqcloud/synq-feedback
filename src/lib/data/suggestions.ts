import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Comment, Profile, Suggestion, SuggestionStatus, SuggestionType } from "@/lib/types";

export type SortOrder = "top" | "new";

const SUGGESTION_SELECT = `
  id, title, body, status, vote_count, created_at, updated_at, edited_at,
  author:profiles!suggestions_author_id_fkey(id, display_name, avatar_url, is_admin),
  type:suggestion_types(id, name, color, sort_order),
  comments(count)
`;

type RawSuggestionRow = {
  id: string;
  title: string;
  body: unknown;
  status: SuggestionStatus;
  vote_count: number;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  author: Profile | null;
  type: SuggestionType | null;
  comments: { count: number }[];
};

async function getVotedIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const supabase = await createClient();
  const { data, error } = await supabase.from("votes").select("suggestion_id").eq("user_id", userId);
  if (error) console.error("getVotedIds failed:", error);
  return new Set((data ?? []).map((row) => row.suggestion_id));
}

async function getSubscribedIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const supabase = await createClient();
  const { data, error } = await supabase.from("subscriptions").select("suggestion_id").eq("user_id", userId);
  if (error) console.error("getSubscribedIds failed:", error);
  return new Set((data ?? []).map((row) => row.suggestion_id));
}

function toSuggestion(
  row: RawSuggestionRow,
  votedIds: Set<string>,
  subscribedIds: Set<string>,
): Suggestion {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    vote_count: row.vote_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    edited_at: row.edited_at,
    author: row.author,
    type: row.type,
    has_voted: votedIds.has(row.id),
    is_subscribed: subscribedIds.has(row.id),
    comment_count: row.comments?.[0]?.count ?? 0,
  };
}

export async function getSuggestions({
  status,
  sort = "top",
  search,
  currentUserId,
}: {
  status?: SuggestionStatus;
  sort?: SortOrder;
  search?: string;
  currentUserId: string | null;
}): Promise<Suggestion[]> {
  const supabase = await createClient();
  let query = supabase.from("suggestions").select(SUGGESTION_SELECT);

  if (status) {
    query = query.eq("status", status);
  } else {
    // Matches Nolt/Canny-style boards: completed work lives on the roadmap
    // (which always passes an explicit status, so it's unaffected by this),
    // and archived is only findable via search or explicitly picking
    // "Archived" from the status filter -- neither belongs in the default
    // "all statuses" board view.
    query = query.not("status", "in", "(completed,archived)");
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  query =
    sort === "new"
      ? query.order("created_at", { ascending: false })
      : query.order("vote_count", { ascending: false });

  const [{ data, error }, votedIds, subscribedIds] = await Promise.all([
    query,
    getVotedIds(currentUserId),
    getSubscribedIds(currentUserId),
  ]);

  if (error) console.error("getSuggestions failed:", error);
  return ((data as RawSuggestionRow[] | null) ?? []).map((row) =>
    toSuggestion(row, votedIds, subscribedIds),
  );
}

export async function getSuggestion(
  id: string,
  currentUserId: string | null,
): Promise<Suggestion | null> {
  const supabase = await createClient();
  const [{ data, error }, votedIds, subscribedIds] = await Promise.all([
    supabase.from("suggestions").select(SUGGESTION_SELECT).eq("id", id).single(),
    getVotedIds(currentUserId),
    getSubscribedIds(currentUserId),
  ]);

  if (error) console.error("getSuggestion failed:", error);
  if (!data) return null;
  return toSuggestion(data as RawSuggestionRow, votedIds, subscribedIds);
}

export async function getComments(suggestionId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, suggestion_id, body, created_at, edited_at, author:profiles(id, display_name, avatar_url, is_admin)")
    .eq("suggestion_id", suggestionId)
    .order("created_at", { ascending: true });

  if (error) console.error("getComments failed:", error);
  return (data as Comment[] | null) ?? [];
}

export async function getSuggestionTypes(): Promise<SuggestionType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suggestion_types")
    .select("id, name, color, sort_order")
    .order("sort_order", { ascending: true });

  if (error) console.error("getSuggestionTypes failed:", error);
  return data ?? [];
}
