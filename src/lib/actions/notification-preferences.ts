"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences } from "@/lib/types";

const PREFS_SELECT =
  "email_on_mention, auto_subscribe_own_posts, auto_subscribe_commented, auto_subscribe_voted";

export async function getMyNotificationPreferences(): Promise<{
  data?: NotificationPreferences;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  const { data, error } = await supabase
    .from("profiles")
    .select(PREFS_SELECT)
    .eq("id", userId)
    .single();

  if (error || !data) return { error: "Could not load preferences." };
  return { data };
}

export async function updateNotificationPreferences(prefs: NotificationPreferences) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  const { error } = await supabase.from("profiles").update(prefs).eq("id", userId);

  if (error) return { error: "Could not save preferences." };

  revalidatePath("/", "layout");
  return { ok: true };
}
