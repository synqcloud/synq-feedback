import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

const NOTIFICATION_SELECT = `
  id, type, read, created_at,
  actor:profiles!notifications_actor_id_fkey(id, display_name, avatar_url, is_admin),
  suggestion:suggestions(id, title, status),
  comment:comments(id, body)
`;

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) console.error("getNotifications failed:", error);
  return (data as Notification[] | null) ?? [];
}
