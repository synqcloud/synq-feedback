"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  await supabase.from("notifications").update({ read: true }).eq("id", id).eq("recipient_id", userId);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", userId)
    .eq("read", false);
  revalidatePath("/", "layout");
  return { ok: true };
}
