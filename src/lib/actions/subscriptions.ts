"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSubscription(suggestionId: string, isSubscribed: boolean) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  if (isSubscribed) {
    await supabase
      .from("subscriptions")
      .delete()
      .eq("suggestion_id", suggestionId)
      .eq("user_id", userId);
  } else {
    await supabase.from("subscriptions").insert({ suggestion_id: suggestionId, user_id: userId });
  }

  revalidatePath(`/suggestions/${suggestionId}`);
  return { ok: true };
}

export async function unsubscribeFromAllSuggestions() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { error: "You must be signed in." };

  await supabase.from("subscriptions").delete().eq("user_id", userId);

  revalidatePath("/", "layout");
  return { ok: true };
}
